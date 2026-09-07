const BASE = "http://localhost:3000";

const items = [
  { productId: "test123", name: "iPhone 16 Pro", price: 4500, quantity: 1 },
];

const common = {
  cardNumber: "4111111111111111",
  expiry: "12/26",
  cvv: "123",
  cardHolder: "AHMED TEST",
  items,
  total: 4500,
  customer: "أحمد تجربة",
  whatsapp: "966501234567",
  nationalId: "1234567890",
  address: "الرياض - حي النزهة",
  shippingCompany: "أرامكس",
  fingerprint: "test-fingerprint-001",
};

async function send(label, body) {
  console.log(`\n📤 إرسال طلب: ${label}`);
  const res = await fetch(`${BASE}/api/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  console.log(`✅ Status: ${res.status}`);
  console.log(`📦 Response:`, JSON.stringify(data, null, 2));
}

// طلب كاش
await send("كاش (full)", {
  ...common,
  installmentType: "full",
  months: 0,
  downPayment: 0,
});

// طلب تقسيط
await send("تقسيط (installment)", {
  ...common,
  installmentType: "installment",
  months: 12,
  downPayment: 1000,
});
