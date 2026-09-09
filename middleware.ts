import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";

  // Force HTTPS redirection (skip in development)
  if (req.headers.get("x-forwarded-proto") === "http" && !host.includes("localhost")) {
    return NextResponse.redirect(
      new URL(`https://${host}${pathname}${req.nextUrl.search}`),
      301
    );
  }

  const token = req.cookies.get("admin_token")?.value;

  if (pathname === "/admin/login") {
    if (token) return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eauthenticate.saudibusiness.gov.sa https://maps.googleapis.com https://va.vercel-scripts.com`,
    `script-src-elem 'self' 'unsafe-inline' https://eauthenticate.saudibusiness.gov.sa https://maps.googleapis.com https://va.vercel-scripts.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://lamsa-iphone-backend.vercel.app https://maps.googleapis.com https://maps.gstatic.com https://nominatim.openstreetmap.org`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  if (!host.includes("localhost")) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");


  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    { source: "/((?!_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.avif|.*\\.ico|.*\\.woff2?|.*\\.ttf|.*\\.otf|.*\\.xml|.*\\.txt).*)" },
  ],
};
