"use client";

import { useState } from "react";
import { FaFilm, FaBoltLightning, FaDatabase } from "react-icons/fa6";
import SearchBar from "./SearchBar";
import ResultsGrid from "./ResultsGrid";
import type { RecommendationItem } from "@/types";

const FEATURED = [
  "Inception",
  "Parasite",
  "The Dark Knight",
  "Toy Story",
  "Interstellar",
];

const STATS = [
  { value: "45k+", label: "Films indexed", icon: <FaDatabase size={12} /> },
  { value: "TF-IDF", label: "Algorithm", icon: <FaBoltLightning size={12} /> },
  {
    value: "~200ms",
    label: "Avg. response",
    icon: <FaBoltLightning size={12} />,
  },
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
      const res = await fetch(
        `/api/recommend?title=${encodeURIComponent(title)}&n=10`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail ?? "Something went wrong.");
        return;
      }
      setResults(data);
    } catch {
      setError("Could not reach the recommendation service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Nav */}
      <nav style={{ borderBottom: "1.5px solid var(--border)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FaFilm />
            <span
              className="font-display font-bold text-sm"
              style={{ color: "var(--text)", letterSpacing: "-0.01em" }}
            >
              CineMatch
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(32px, 7vw, 72px) 20px clamp(28px, 5vw, 56px)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
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

        <h1
          className="font-display font-extrabold"
          style={{
            fontSize: "clamp(1.9rem, 5.5vw, 4.2rem)",
            lineHeight: 1.13,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            marginBottom: "clamp(10px, 2vw, 18px)",
            maxWidth: 760,
          }}
        >
          Find your next{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--accent)",
              background: "var(--primary)",
              padding: "0 6px 2px",
              borderRadius: 4,
            }}
          >
            favourite film.
          </em>
        </h1>

        <p
          className="font-body"
          style={{
            color: "var(--muted)",
            maxWidth: 500,
            fontSize: "clamp(0.85rem, 1.8vw, 0.975rem)",
            lineHeight: 1.75,
            marginBottom: "clamp(20px, 4vw, 36px)",
          }}
        >
          Enter any movie title and we surface 10 similar films using NLP. No
          account, no tracking, no noise.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "clamp(16px, 4vw, 36px)",
            flexWrap: "wrap",
            marginBottom: "clamp(20px, 4vw, 36px)",
          }}
        >
          {STATS.map(({ value, label, icon }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "var(--accent)", opacity: 0.6 }}>
                  {icon}
                </span>
                <p
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                    color: "var(--accent)",
                  }}
                >
                  {value}
                </p>
              </div>
              <p
                className="font-body"
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted-2)",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Search box */}
        <div style={{ maxWidth: 680 }}>
          <SearchBar onSearch={handleSearch} loading={loading} />
          {!hasSearched && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <span
                className="font-body"
                style={{ fontSize: "0.72rem", color: "var(--muted-2)" }}
              >
                Try:
              </span>
              {FEATURED.map((title) => (
                <button
                  key={title}
                  className="chip"
                  onClick={() => handleSearch(title)}
                >
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {hasSearched && (
        <div
          style={{
            height: "1.5px",
            background: "var(--border)",
            margin: "0 20px",
          }}
        />
      )}

      {/* Results */}
      <main
        style={{
          flex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: hasSearched ? "clamp(20px, 4vw, 44px) 20px" : "0 20px 44px",
        }}
      >
        <ResultsGrid
          results={results}
          loading={loading}
          error={error}
          query={query}
        />

        {!hasSearched && (
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: 16,
              padding: "clamp(32px, 8vw, 72px) 20px",
              textAlign: "center",
            }}
          >
            <FaFilm
              size={40}
              style={{ color: "var(--border-dark)", margin: "0 auto 16px" }}
            />
            <p
              className="font-display font-medium"
              style={{
                color: "var(--muted)",
                fontSize: "clamp(0.875rem, 2vw, 1rem)",
              }}
            >
              Your recommendations will appear here.
            </p>
            <p
              className="font-body"
              style={{
                color: "var(--muted-2)",
                fontSize: "0.85rem",
                marginTop: 6,
              }}
            >
              Start by typing a film above.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1.5px solid var(--border)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <p
            className="font-display font-semibold"
            style={{ fontSize: "0.75rem", color: "var(--text)" }}
          >
            CineMatch
          </p>
          <p
            className="font-body"
            style={{ fontSize: "0.72rem", color: "var(--muted-2)" }}
          >
            TF-IDF · Cosine Similarity · FastAPI · Next.js ·{" "}
            <a
              href="https://www.omdbapi.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)", textDecoration: "underline" }}
            >
              OMDb
            </a>
          </p>
          <p
            className="font-body"
            style={{ fontSize: "0.72rem", color: "var(--muted-2)" }}
          >
            Built by{" "}
            <a
              href="https://swayam.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                background: "var(--primary)",
                fontStyle: "italic",
              }}
            >
              Swayam
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
