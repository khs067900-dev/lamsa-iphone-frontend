import { NextRequest, NextResponse } from "next/server";

const SKIP_PATHS = [
  "/blocked",
  "/api/secret",
  "/_next",
  "/favicon",
];

function getRealIP(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.split(",")[0].trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

async function isDeviceBlocked(fp: string | null, ip: string): Promise<boolean> {
  try {
    const base = process.env.BACKEND_URL || "http://localhost:5000";
    const params = new URLSearchParams();
    if (fp) params.set("fp", fp);
    if (ip && ip !== "unknown") params.set("ip", ip);
    if (!params.toString()) return false;

    const r = await fetch(`${base}/api/devices/check?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!r.ok) return false;
    const data = await r.json();
    return !!data.blocked;
  } catch {
    return false; // fail open
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Force HTTPS redirection (skip in development)
  const host = req.headers.get("host") || "";
  if (req.headers.get("x-forwarded-proto") === "http" && !host.includes("localhost")) {
    return NextResponse.redirect(
      new URL(`https://${host}${pathname}${req.nextUrl.search}`),
      301
    );
  }

  // Skip block check for these paths
  const skip = SKIP_PATHS.some((p) => pathname.startsWith(p));
  if (!skip) {
    const fp = req.cookies.get("x-device-fp")?.value ||
      req.headers.get("x-device-fingerprint") || null;
    const ip = getRealIP(req);
    const blocked = await isDeviceBlocked(fp, ip);
    if (blocked) {
      return NextResponse.redirect(new URL("/blocked", req.url));
    }
  }

  const token = req.cookies.get("admin_token")?.value;

  // If logged-in admin visits login page, redirect to dashboard
  if (pathname === "/admin/login") {
    if (token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Secret panel — cookie-only auth, no redirect (just 404-like blank)
  if (pathname.startsWith("/secret-panel")) {
    const spToken = req.cookies.get("sp_token")?.value;
    const spSecret = process.env.SECRET_PANEL_PASSWORD;
    if (!spToken || !spSecret || spToken !== spSecret) {
      // Return the page anyway — LoginForm handles the UI
      // We only block API routes here
      return NextResponse.next();
    }
  }

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eauthenticate.saudibusiness.gov.sa https://maps.googleapis.com`,
    `script-src-elem 'self' 'unsafe-inline' https://eauthenticate.saudibusiness.gov.sa https://maps.googleapis.com`,
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
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Prevent caching for admin routes
  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    { source: "/((?!_next/static|_next/image|favicon.ico).*)" },
  ],
};
