import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function isAuthed(req: NextRequest) {
  const token = req.cookies.get("sp_token")?.value;
  const secret = process.env.SECRET_PANEL_PASSWORD;
  return token && secret && token === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "logs"; // logs | blocked
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("search") || "";

  const endpoint =
    type === "blocked"
      ? `/api/admin/devices/blocked?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      : `/api/admin/devices/logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

  try {
    const r = await fetch(`${BACKEND}${endpoint}`, {
      headers: { "x-internal-token": process.env.ADMIN_INTERNAL_TOKEN || "" },
      cache: "no-store",
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const action = body.action; // block | unblock | delete-log | delete-blocked

  try {
    let endpoint = "";
    let method = "POST";

    if (action === "block") {
      endpoint = "/api/admin/devices/block";
    } else if (action === "unblock") {
      endpoint = `/api/admin/devices/unblock/${body.id}`;
    } else if (action === "delete-log") {
      endpoint = `/api/admin/devices/log/${body.id}`;
      method = "DELETE";
    } else if (action === "set-label") {
      endpoint = `/api/admin/devices/log/${body.id}/label`;
      method = "PATCH";
    } else if (action === "delete-all-logs") {
      endpoint = "/api/admin/devices/logs/all";
      method = "DELETE";
    } else if (action === "unblock-all") {
      endpoint = "/api/admin/devices/unblock-all";
    } else if (action === "delete-all-blocked") {
      endpoint = "/api/admin/devices/blocked/all";
      method = "DELETE";
    } else if (action === "delete-blocked") {
      endpoint = `/api/admin/devices/blocked/${body.id}`;
      method = "DELETE";
    } else {
      return NextResponse.json({ error: "action غير صالح" }, { status: 400 });
    }

    const r = await fetch(`${BACKEND}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": process.env.ADMIN_INTERNAL_TOKEN || "",
      },
      body: method !== "DELETE" ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
