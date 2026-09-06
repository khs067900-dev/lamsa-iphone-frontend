import { NextRequest, NextResponse } from "next/server";

// In-memory store: orderId → { count, firstAt, lastAt }
const resends = new Map<string, { count: number; firstAt: number; lastAt: number }>();

const MAX_RESENDS = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 60 * 1000;    // 60 seconds between resends

export async function POST(req: NextRequest) {
  const { orderId, customerName } = await req.json();

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }

  const now = Date.now();
  const key = String(orderId).slice(0, 64);
  const entry = resends.get(key);

  if (entry) {
    if (now - entry.firstAt > WINDOW_MS) {
      resends.delete(key);
    } else {
      if (now - entry.lastAt < COOLDOWN_MS) {
        const retryAfter = Math.ceil((COOLDOWN_MS - (now - entry.lastAt)) / 1000);
        return NextResponse.json({ ok: false, error: "انتظر قبل إعادة الإرسال", retryAfter }, { status: 429 });
      }
      if (entry.count >= MAX_RESENDS) {
        return NextResponse.json({ ok: false, error: "تجاوزت الحد المسموح من إعادة الإرسال" }, { status: 429 });
      }
      entry.count += 1;
      entry.lastAt = now;
    }
  }

  if (!resends.has(key)) {
    resends.set(key, { count: 1, firstAt: now, lastAt: now });
  }

  const text = [
    `🔄 تم طلب إعادة ارسال كود`,
    `🆔 رقم الطلب: ${orderId}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
  ].join("\n");

  const chatIds = [process.env.TELEGRAM_CHAT_ID, "967729669"].filter(Boolean);
  let sent = false;
  for (const chatId of chatIds) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text }),
          }
        );
        if (res.ok) { sent = true; break; }
      } catch {}
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  return NextResponse.json({ ok: sent });
}
