import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

function isValidValue(v: string | null): boolean {
  if (!v) return false;
  return /^[a-zA-Z0-9.:_-]+$/.test(v) && v.length <= 64;
}

export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get("fp");
  const ip = req.nextUrl.searchParams.get("ip");

  if (!isValidValue(fp) && !isValidValue(ip)) {
    return NextResponse.json({ blocked: false });
  }

  try {
    const params = new URLSearchParams();
    if (fp) params.set("fp", fp);
    if (ip) params.set("ip", ip);

    const r = await fetch(`${BACKEND}/api/devices/check?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    if (!r.ok) return NextResponse.json({ blocked: false });
    const data = await r.json();
    return NextResponse.json({ blocked: !!data.blocked });
  } catch {
    // fail open — never block on error
    return NextResponse.json({ blocked: false });
  }
}
