"""
main.py — FastAPI server for the Movie Recommendation System.

Startup:
    uvicorn main:app --reload
"""

import asyncio
import os
import pickle
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from functools import partial
from typing import Optional

import httpx
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import normalize

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

OMDB_API_KEY = os.getenv("OMDB_API_KEY")
OMDB_BASE = "https://www.omdbapi.com/"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# App state (loaded once at startup)
# ---------------------------------------------------------------------------

@dataclass
class AppState:
    df: Optional[pd.DataFrame] = field(default=None)
    indices: Optional[pd.Series] = field(default=None)
    tfidf_matrix: object = field(default=None)   # scipy sparse


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load heavy artefacts once at startup; pre-normalise matrix for
    correct cosine similarity; release on shutdown."""
    if not OMDB_API_KEY:
        raise RuntimeError("OMDB_API_KEY is not set. Add it to .env")

    for name, attr in [
        ("df.pkl", "df"),
        ("indices.pkl", "indices"),
        ("tfidf_matrix.pkl", "tfidf_matrix"),
    ]:
        path = os.path.join(BASE_DIR, name)
        if not os.path.exists(path):
            raise RuntimeError(
                f"{name} not found. Run `python train.py` first."
            )
        with open(path, "rb") as f:
            setattr(state, attr, pickle.load(f))

    # FIX: pre-normalise every row to unit length so dot-product == true
    # cosine similarity (avoids dividing by only one norm at query time).
    state.tfidf_matrix = normalize(state.tfidf_matrix, norm="l2")

    print(f"[startup] Loaded {len(state.df):,} movies.")
    yield
    # nothing to release for pickle-based state


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Movie Recommendation API", version="2.1", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class MovieMeta(BaseModel):
    title: str
    year: Optional[str] = None
    rating: Optional[str] = None
    poster: Optional[str] = None
    plot: Optional[str] = None


class RecommendationItem(BaseModel):
    title: str
    score: float
    meta: Optional[MovieMeta] = None


# ---------------------------------------------------------------------------
# OMDB helper
# ---------------------------------------------------------------------------

async def fetch_omdb(client: httpx.AsyncClient, title: str) -> Optional[MovieMeta]:
    """Fetch one movie's metadata from OMDb. Returns None on any error."""
    try:
        resp = await client.get(
            OMDB_BASE,
            params={"apikey": OMDB_API_KEY, "t": title},
            timeout=5.0,
        )
        data = resp.json()
        if data.get("Response") != "True":
            return None
        return MovieMeta(
            title=data.get("Title", title),
            year=data.get("Year"),
            rating=data.get("imdbRating"),
            poster=data.get("Poster") if data.get("Poster") != "N/A" else None,
            plot=data.get("Plot") if data.get("Plot") != "N/A" else None,
        )
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Recommendation logic
# ---------------------------------------------------------------------------

def _get_recommendations(title: str, top_n: int) -> list[tuple[str, float]]:
    """
    Return (title, cosine_score) pairs.

    The tfidf_matrix is pre-normalised to unit rows at startup, so a
    plain dot-product gives true cosine similarity in [0, 1].
    """
    matched = [t for t in state.indices.index if str(t).lower() == title.lower()]
    if not matched:
        raise ValueError(f"Movie '{title}' not found in the dataset.")

    idx = state.indices[matched[0]]
    query_vec = state.tfidf_matrix[idx]

    # Both sides are unit-normalised → dot-product == cosine similarity
    scores = (state.tfidf_matrix @ query_vec.T).toarray().flatten()

    top_indices = np.argsort(scores)[::-1]

    results = []
    for i in top_indices:
        if i == idx:
            continue
        results.append((state.df.iloc[i]["title"], float(scores[i])))
        if len(results) >= top_n:
            break

    return results


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "movies_loaded": len(state.df)}


@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    """Autocomplete: return up to 10 titles containing the query string."""
    q_lower = q.lower()
    matches = [
        t for t in state.indices.index
        if q_lower in str(t).lower()
    ][:10]
    return {"results": matches}


@app.get("/recommend", response_model=list[RecommendationItem])
async def recommend(
    title: str = Query(..., min_length=1),
    n: int = Query(10, ge=1, le=20),
):
    # FIX: offload CPU-bound work to a thread pool so the async event loop
    # is not blocked during the matrix dot-product + argsort.
    try:
        loop = asyncio.get_event_loop()
        recs = await loop.run_in_executor(
            None, partial(_get_recommendations, title, n)
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal recommendation error.")

    # Fetch all OMDb metadata concurrently
    async with httpx.AsyncClient() as client:
        meta_list = await asyncio.gather(
            *[fetch_omdb(client, movie_title) for movie_title, _ in recs]
        )

    return [
        RecommendationItem(title=movie_title, score=round(score, 4), meta=meta)
        for (movie_title, score), meta in zip(recs, meta_list)
    ]
