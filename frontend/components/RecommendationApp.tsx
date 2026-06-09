"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import ResultsGrid from "./ResultsGrid";
import type { RecommendationItem } from "@/types";

const FEATURED = ["Inception", "Parasite", "The Dark Knight", "Toy Story", "Interstellar"];

const STATS = [
  { value: "45k+", label: "Films indexed" },
  { value: "TF-IDF", label: "Algorithm" },
  { value: "~200ms", label: "Avg. response" },
];

export default function RecommendationApp() {
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (title: string) => {
    if (!title.trim()) return;
    setQuery(title);
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/recommend?title=${encodeURIComponent(title)}&n=10`);
      const data = await res.json();
      if (!res.ok) { setError(data?.detail ?? "Something went wrong."); return; }
      setResults(data);
    } catch {
      setError("Could not reach the recommendation service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">

      {/* ── Top nav strip ──────────────────────────────────────────── */}
      <nav
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--primary)",
              border: "2px solid var(--accent)",
            }}
          />
          <span
            className="font-display font-bold text-sm tracking-tight"
            style={{ color: "var(--text)" }}
          >
            CineMatch
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {["FastAPI", "TF-IDF", "Next.js"].map((t) => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="px-6 pt-16 pb-14 md:pt-20 md:pb-16 max-w-4xl mx-auto w-full">

        {/* Badge */}
        <div className="mb-8">
          <span className="hero-badge">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                animation: "pulse-dot 1.8s ease-in-out infinite",
              }}
            />
            Content-based recommender
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold leading-[1.0] tracking-tight mb-4"
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5rem)",
            color: "var(--text)",
          }}
        >
          Find your next{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--accent)",
              background: "var(--primary)",
              padding: "0 6px 2px",
              borderRadius: "4px",
              display: "inline",
            }}
          >
            favourite film.
          </em>
        </h1>

        <p
          className="font-body text-base leading-relaxed mb-10 max-w-lg"
          style={{ color: "var(--muted)" }}
        >
          Enter any movie title. We surface the 10 most similar films using
          NLP — no account, no tracking, no noise.
        </p>

        {/* Stats row */}
        <div className="flex gap-6 mb-10">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p
                className="font-display font-bold text-xl leading-none"
                style={{ color: "var(--accent)" }}
              >
                {value}
              </p>
              <p className="font-body text-xs mt-1" style={{ color: "var(--muted-2)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Quick-picks */}
        {!hasSearched && (
          <div className="flex flex-wrap gap-2 mt-5 items-center">
            <span className="font-body text-xs" style={{ color: "var(--muted-2)" }}>
              Try:
            </span>
            {FEATURED.map((title) => (
              <button key={title} className="chip" onClick={() => handleSearch(title)}>
                {title}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Divider */}
      {hasSearched && <div className="divider mx-6" />}

      {/* ── Results ──────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <ResultsGrid results={results} loading={loading} error={error} query={query} />

        {!hasSearched && (
          <div
            className="rounded-2xl border-2 p-14 text-center"
            style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
          >
            <p className="font-display text-5xl mb-4 select-none" role="img" aria-label="Film reel">
              🎞
            </p>
            <p className="font-display font-medium text-base" style={{ color: "var(--muted)" }}>
              Your recommendations will appear here.
            </p>
            <p className="font-body text-sm mt-2" style={{ color: "var(--muted-2)" }}>
              Start by typing a film above.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1.5px solid var(--border)" }}
      >
        <p className="font-display text-xs font-semibold" style={{ color: "var(--text)" }}>
          CineMatch
        </p>
        <p className="font-body text-xs" style={{ color: "var(--muted-2)" }}>
          TF-IDF · Cosine Similarity · FastAPI · Next.js 16 ·{" "}
          <a
            href="https://www.omdbapi.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted)", textDecoration: "underline" }}
          >
            OMDb
          </a>
        </p>
      </footer>
    </div>
  );
}
