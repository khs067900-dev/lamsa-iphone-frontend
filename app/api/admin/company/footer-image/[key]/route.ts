import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const body = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/company/footer-image/${key}`, forwardCookies(req, { method: "POST", body }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag("company");
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const res = await fetch(`${getBackend()}/api/admin/company/footer-image/${key}`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    revalidateTag("company");
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
