"use client";

import type { RecommendationItem } from "@/types";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

interface ResultsGridProps {
  results: RecommendationItem[];
  loading: boolean;
  error: string | null;
  query: string;
}

export default function ResultsGrid({ results, loading, error, query }: ResultsGridProps) {
  if (loading) {
    return (
      <section aria-label="Loading recommendations">
        <p className="font-display text-sm mb-6" style={{ color: "var(--muted)" }}>
          Finding films similar to{" "}
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{query}</span>…
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border-2 p-10 text-center"
        style={{ borderColor: "var(--border-dark)", borderStyle: "dashed" }}
      >
        <p className="font-display text-4xl mb-3" role="img" aria-label="Not found">🎬</p>
        <p className="font-display font-semibold text-base" style={{ color: "var(--text)" }}>
          {error}
        </p>
        <p className="font-body text-sm mt-1" style={{ color: "var(--muted)" }}>
          Check the spelling or try a different title.
        </p>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <section aria-label="Recommendations">
        <p className="font-display text-sm mb-6" style={{ color: "var(--muted)" }}>
          {results.length} films similar to{" "}
          <span style={{ color: "var(--text)", fontWeight: 700 }}>{query}</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((item, i) => (
            <MovieCard key={item.title} item={item} rank={i} />
          ))}
        </div>
      </section>
    );
  }

  return null;
}
