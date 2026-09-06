import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await fetch(`${BACKEND}/api/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": req.headers.get("user-agent") || "",
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
        "cf-connecting-ip": req.headers.get("cf-connecting-ip") || "",
        "cf-ipcountry": req.headers.get("cf-ipcountry") || "",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
