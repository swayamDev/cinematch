import type { RecommendationItem } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getRecommendations(
  title: string,
  n = 10
): Promise<RecommendationItem[]> {
  const url = `${API_BASE}/recommend?title=${encodeURIComponent(title)}&n=${n}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }

  return res.json();
}

export async function searchTitles(q: string): Promise<string[]> {
  const url = `${API_BASE}/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}
