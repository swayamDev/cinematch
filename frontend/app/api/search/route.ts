import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const upstream = `${API_BASE}/search?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Autocomplete failures are non-fatal — return empty list
    return NextResponse.json({ results: [] });
  }
}
