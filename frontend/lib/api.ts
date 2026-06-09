/**
 * lib/api.ts
 *
 * All backend calls go through the Next.js proxy routes (/api/*).
 * This ensures:
 *  - No NEXT_PUBLIC_* env var leaks the backend URL to the browser
 *  - CORS is handled entirely server-side
 *  - One place to change request logic
 */
import type { RecommendationItem } from "@/types";

export async function getRecommendations(
  title: string,
  n = 10
): Promise<RecommendationItem[]> {
  const url = `/api/recommend?title=${encodeURIComponent(title)}&n=${n}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }

  return res.json();
}

// FIX: searchTitles now calls the /api/search proxy route (server-side)
// instead of hitting the Railway backend directly from the browser.
export async function searchTitles(q: string): Promise<string[]> {
  const url = `/api/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}
