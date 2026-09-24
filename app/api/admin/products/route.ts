import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../_lib";

// Force dynamic — admin routes must never be cached by Next.js
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Forward ALL query params (page, limit, q, category) to the backend
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();
  const url = `${getBackend()}/api/admin/products${query ? `?${query}` : ""}`;

  const res = await fetch(url, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(
    `${getBackend()}/api/admin/products`,
    forwardCookies(req, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  const data = await res.json();
  if (res.ok) {
    revalidateTag("products");
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
