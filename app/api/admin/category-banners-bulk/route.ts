import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function GET(req: NextRequest) {
  const categories = req.nextUrl.searchParams.get("categories") || "";
  const res = await fetch(
    `${getBackend()}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
