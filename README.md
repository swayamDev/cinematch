# CineMatch — Movie Recommendation System

Content-based movie recommender using **TF-IDF + Cosine Similarity**, a **FastAPI** backend, and a **Next.js 16** frontend.

```
movie-rec/
├── backend/
│   ├── main.py              FastAPI server (routes, OMDb, recommendation logic)
│   ├── train.py             Offline preprocessing + artifact generation
│   ├── Dockerfile           Railway deployment
│   ├── railway.json         Railway config
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── api/recommend/route.ts   Proxy route (avoids browser CORS)
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── RecommendationApp.tsx    Main client shell
    │   ├── SearchBar.tsx            Input + autocomplete
    │   ├── ResultsGrid.tsx          Grid + loading/error states
    │   ├── MovieCard.tsx            Individual result card
    │   └── MovieCardSkeleton.tsx    Loading skeleton
    ├── lib/api.ts                   Typed fetch helpers
    ├── types/index.ts               Shared TypeScript types
    └── vercel.json                  Vercel deployment config
```

---

## Deploy (Vercel + Railway)

### Backend → Railway

1. Push the `backend/` folder to its own GitHub repo (or a monorepo).
2. Create a new Railway project → **Deploy from GitHub**.
3. Railway auto-detects the `Dockerfile`. Set these env vars in Railway dashboard:
   ```
   OMDB_API_KEY=your_key
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
4. **Important:** Before deploying, you need to run `train.py` and commit the `.pkl` artifacts, or add a Railway build step:
   - In Railway → Settings → Build Command: `python train.py --csv movies_metadata.csv --out .`
   - Upload `movies_metadata.csv` via Railway volume or embed it in the repo if it's small enough.
5. Note your Railway public URL (e.g. `https://cinematch-backend.up.railway.app`).

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub.
2. Import the repo in [vercel.com/new](https://vercel.com/new).
3. Add environment variables:
   ```
   API_URL=https://your-backend.up.railway.app
   ```
4. Deploy. Vercel auto-builds Next.js and gives you a `*.vercel.app` URL.
5. Copy that URL back to Railway → `ALLOWED_ORIGINS`.

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add OMDB_API_KEY
python train.py --csv movies_metadata.csv --out .
uvicorn main:app --reload     # → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                   # → http://localhost:3000
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | `{ status, movies_loaded }` |
| GET | `/search?q=<query>` | Autocomplete — up to 10 title matches |
| GET | `/recommend?title=<title>&n=<n>` | Top `n` similar movies (default 10, max 20) |

---

## How It Works

1. **train.py** loads `movies_metadata.csv`, combines `overview + genres + tagline` into a `tags` field, applies NLTK lemmatisation + stopword removal, then fits a `TfidfVectorizer` (50k features, bigrams). Artifacts are persisted as `.pkl` files.

2. **main.py** loads artifacts at startup. On `/recommend`, it computes a normalised dot-product (true cosine similarity) between the query vector and the full matrix, returns the top-N results, then fetches OMDb metadata for all of them **concurrently** via `asyncio.gather`.

3. **Next.js** proxies requests through `app/api/recommend/route.ts` so the browser never makes a cross-origin call. The `SearchBar` debounces autocomplete at 280ms. Cards render with staggered fade-up animations.
