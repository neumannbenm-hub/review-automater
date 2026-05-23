import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const BASE = process.env.REVIEWBOOST_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${BASE}/api/sentiment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    } as RequestInit);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "backend unavailable" }, { status: 503 });
  }
}
