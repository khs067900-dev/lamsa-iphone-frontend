import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export const revalidate = 120;

export async function GET() {
  const [settingsRes, maxRes] = await Promise.all([
    fetch(`${getBackend()}/api/admin/sub-categories/home-settings`, { next: { revalidate: 120 } }),
    fetch(`${getBackend()}/api/admin/sub-categories/max`, { next: { revalidate: 120 } }),
  ]);
  const settings = settingsRes.ok ? await settingsRes.json() : [];
  const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
  return NextResponse.json({ settings, max: maxData.max ?? 4 }, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
  });
}
