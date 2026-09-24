import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settingsRes, maxRes] = await Promise.all([
    fetch(`${getBackend()}/api/admin/sub-categories/home-settings`, { next: { revalidate: 60, tags: ["home-config"] } }),
    fetch(`${getBackend()}/api/admin/sub-categories/max`, { next: { revalidate: 60, tags: ["home-config"] } }),
  ]);
  const settings = settingsRes.ok ? await settingsRes.json() : [];
  const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
  return NextResponse.json({ settings, max: maxData.max ?? 4 }, {
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });
}
