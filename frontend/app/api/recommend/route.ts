import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const n = searchParams.get("n") ?? "10";

  if (!title) {
    return NextResponse.json({ detail: "title is required" }, { status: 400 });
  }

  const upstream = `${API_BASE}/recommend?title=${encodeURIComponent(title)}&n=${n}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { detail: "Could not reach recommendation service." },
      { status: 503 }
    );
  }
}
