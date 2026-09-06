import type { Product } from "../components/products/types";

const COLOR_ORDER: string[] = [
  "برتقالي",
  "سيلفر",
  "سيبفلر",
  "أزرق تيتانيوم",
  "أزرق فاتح",
  "أزرق",
  "ازرق",
  "أسود تيتانيوم",
  "أسود",
  "أبيض تيتانيوم",
  "أبيض",
  "بينك",
  "جولد",
  "رصاصي",
  "رمادي تيتانيوم",
  "صحراوي",
];

function colorPriority(color?: string, name?: string): number {
  const src = (color && color.trim()) ? color.trim() : "";
  if (!src) {
    const n = (name || "").toLowerCase();
    if (n.includes("برتقال") || n.includes("orange")) return 0;
    return 999;
  }
  const idx = COLOR_ORDER.findIndex(c => c === src || c.trim() === src.trim());
  return idx !== -1 ? idx : COLOR_ORDER.length;
}

function parseStorage(s?: string, name?: string): number {
  const sources = [s, name].filter(Boolean) as string[];
  for (const raw of sources) {
    const clean = raw.replace(/\s+/g, "");
    const en = clean.match(/(\d+)(tb|gb)/i) || clean.match(/(gb|tb)(\d+)/i);
    if (en) {
      const num = parseInt(en[1]) || parseInt(en[2]);
      const unit = (en[1].match(/\d/) ? en[2] : en[1]).toLowerCase();
      return unit === "tb" ? num * 1024 : num;
    }
  }
  return Infinity;
}

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const storageDiff = parseStorage(a.storage, a.name) - parseStorage(b.storage, b.name);
    if (storageDiff !== 0) return storageDiff;
    return colorPriority(a.color, a.name) - colorPriority(b.color, b.name);
  });
}
