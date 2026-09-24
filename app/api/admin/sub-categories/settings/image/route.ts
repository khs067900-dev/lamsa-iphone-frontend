import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/settings/image`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag("home-config");
    revalidateTag("products");
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
