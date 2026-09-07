import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get("fp");
  if (!fp) return NextResponse.json({ blocked: false });

  try {
    const res = await fetch(`${BACKEND}/api/admin/check-block?fp=${fp}`, {
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ blocked: false });
    const data = await res.json();
    return NextResponse.json({ blocked: !!data.blocked });
  } catch {
    return NextResponse.json({ blocked: false });
  }
}
