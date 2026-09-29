import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["res.cloudinary.com", "cloudinary.com"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new NextResponse("forbidden", { status: 403 });
  }

  // fix: replace /image/upload/ with /raw/upload/ for PDF files
  const fetchUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");

  const res = await fetch(fetchUrl);
  if (!res.ok) return new NextResponse("failed", { status: res.status });

  const contentType = res.headers.get("content-type") || "application/pdf";

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400, immutable",
    },
  });
}
