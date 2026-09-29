import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const q = new URLSearchParams({ page, limit });
  if (search) q.set("search", search);
  if (status) q.set("status", status);

  const url = `${getBackend()}/api/admin/orders?${q.toString()}`;
  const res = await fetch(url, forwardCookies(req, {
    headers: { "Cache-Control": "no-cache" },
  }));
  const data = await res.json();
  return NextResponse.json(data, {
    status: res.status,
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
