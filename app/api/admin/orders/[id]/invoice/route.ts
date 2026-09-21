import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

// Aggregates order + company data in one BFF call.
// Used by: receipt/page.tsx, contract/page.tsx
// Note: invoice/page.tsx and cancellation/page.tsx fetch order + company independently
// (they also need product images, so they manage their own parallel fetches).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const init = forwardCookies(req, {});
  const backend = getBackend();

  // Fetch order and company in parallel — was previously broken because it called
  // GET /api/checkout/:id which doesn't exist (only POST / exists on that route).
  const [orderRes, companyRes] = await Promise.all([
    fetch(`${backend}/api/admin/orders/${id}`, init),
    fetch(`${backend}/api/admin/company`, init),
  ]);

  const order   = orderRes.ok   ? await orderRes.json()   : null;
  const company = companyRes.ok ? await companyRes.json() : {};

  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: orderRes.status });
  }

  return NextResponse.json({ order, company });
}
