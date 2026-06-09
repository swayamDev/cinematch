import type { RecommendationItem } from "@/types";
import Image from "next/image";

const FALLBACK_POSTER = "https://placehold.co/300x450/F7F9F0/9AA060?text=No+Poster";

interface MovieCardProps {
  item: RecommendationItem;
  rank: number;
}

export default function MovieCard({ item, rank }: MovieCardProps) {
  const { meta, score } = item;
  const title = meta?.title ?? item.title;
  const poster = meta?.poster ?? FALLBACK_POSTER;
  const year = meta?.year ?? null;
  const rating = meta?.rating && meta.rating !== "N/A" ? meta.rating : null;
  const plot = meta?.plot ?? null;
  const pct = Math.round(score * 100);

  return (
    <article
      className="movie-card animate-fade-up flex flex-col h-full"
      style={{ animationDelay: `${rank * 50}ms` }}
    >
      {/* Poster */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden"
        style={{ background: "var(--surface-2)" }}
      >
        {/* FIX: removed `unoptimized` — remotePatterns already covers both
            m.media-amazon.com and placehold.co, so Next.js can optimise
            these images (resize, convert to WebP, cache at edge). */}
        <Image
          src={poster}
          alt={`${title} poster`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
        />
        <span className="rank-badge">#{rank + 1}</span>
        {rating && <span className="rating-badge">★ {rating}</span>}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3
            className="font-display font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h3>
          {year && (
            <p className="font-body text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {year}
            </p>
          )}
        </div>

        {plot && (
          <p
            className="font-body text-xs leading-relaxed line-clamp-3 flex-1"
            style={{ color: "var(--muted)" }}
          >
            {plot}
          </p>
        )}

        {/* Similarity score */}
        <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-xs" style={{ color: "var(--muted)" }}>
              Match
            </span>
            <span
              className="font-display text-xs font-bold"
              style={{ color: "var(--accent)" }}
            >
              {pct}%
            </span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}
