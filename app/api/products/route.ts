import { NextRequest, NextResponse } from "next/server";
import { BACKEND, getAllProducts } from "../../lib/productsCache";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") || "").trim();
  const fields = searchParams.get("fields") || "";
  const limit = searchParams.get("limit") || "";
  const page = searchParams.get("page") || "";
  const category = searchParams.get("category") || "";

  // If search query or specific limits/fields are requested, query backend directly
  if (q || limit || fields || page || category) {
    try {
      const url = new URL("/api/products", BACKEND);
      if (q) url.searchParams.set("q", q);
      if (fields) url.searchParams.set("fields", fields);
      if (limit) url.searchParams.set("limit", limit);
      if (page) url.searchParams.set("page", page);
      if (category) url.searchParams.set("category", category);

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return NextResponse.json([], { status: res.status });
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.products ?? [];

      return NextResponse.json(items, {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
        },
      });
    } catch {
      return NextResponse.json([], { status: 500 });
    }
  }

  // Fallback: cached all products
  const products = await getAllProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
