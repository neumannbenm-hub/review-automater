import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing is not available yet." },
    { status: 503 }
  );
}
