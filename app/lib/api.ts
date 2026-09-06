import { getFingerprint } from "./useFingerprint";

const ALLOWED_HOSTS = ["localhost", "lamsasmart.com", "lamsa-iphone-backend.vercel.app"];
const ALLOWED_PREFIXES = [
  "/api/admin",
  "/api/products",
  "/api/checkout",
];

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const { hostname, origin } = new URL(raw);
    if (!ALLOWED_HOSTS.includes(hostname)) throw new Error(`Blocked host: ${hostname}`);
    return origin;
  } catch {
    return "http://localhost:5000";
  }
}

export const API = getApiBase();

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    throw new Error(`Blocked path: ${path}`);
  }
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;

  const fp = getFingerprint();
  const headers = new Headers(init?.headers);
  if (fp) headers.set("x-device-fingerprint", fp);

  return fetch(url, { ...init, headers });
}
