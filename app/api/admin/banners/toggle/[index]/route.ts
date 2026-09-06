import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/banners/toggle/${index}`, forwardCookies(req, { method: "PATCH" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
