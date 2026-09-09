import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string; index: string }> }) {
  const { category, index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/category-banners/${encodeURIComponent(category)}/${index}`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  if (res.ok) revalidateTag("banners");
  return NextResponse.json(data, { status: res.status });
}
