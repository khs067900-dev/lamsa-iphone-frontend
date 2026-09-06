import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string; index: string }> }) {
  const { category, index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/category-banners/${encodeURIComponent(category)}/${index}/image`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
