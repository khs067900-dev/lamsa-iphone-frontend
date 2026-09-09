import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function GET(req: NextRequest) {
  const categories = req.nextUrl.searchParams.get("categories") || "";
  const res = await fetch(
    `${getBackend()}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories)}`,
    { next: { revalidate: 3600, tags: ["banners"] } }
  );
  const data = await res.json();
  return NextResponse.json(data, {
    status: res.status,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
