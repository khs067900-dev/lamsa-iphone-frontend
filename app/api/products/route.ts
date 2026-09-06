import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "../../lib/productsCache";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase().trim();
  const products = await getAllProducts();

  const result = q
    ? products.filter((p: { name?: string; category?: string; brand?: string }) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      )
    : products;

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=31536000, immutable" },
  });
}
