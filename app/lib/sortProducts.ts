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

// Pre-compute color priority map for O(1) lookups instead of O(n)
const COLOR_PRIORITY_MAP = new Map(COLOR_ORDER.map((color, idx) => [color.toLowerCase().trim(), idx]));

function colorPriority(color?: string, name?: string): number {
  const src = (color && color.trim()) ? color.trim() : "";
  if (!src) {
    const n = (name || "").toLowerCase();
    if (n.includes("برتقال") || n.includes("orange")) return 0;
    return 999;
  }
  const key = src.toLowerCase().trim();
  return COLOR_PRIORITY_MAP.get(key) ?? COLOR_ORDER.length;
}

// Regex pattern compiled once for performance
const STORAGE_PATTERN = /(\d+)\s*(tb|gb)/i;

function parseStorage(s?: string, name?: string): number {
  const sources = [s, name].filter(Boolean) as string[];
  for (const raw of sources) {
    const clean = raw.replace(/\s+/g, "").toLowerCase();
    const match = clean.match(STORAGE_PATTERN);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return unit === "tb" ? num * 1024 : num;
    }
  }
  return Infinity;
}

/**
 * Sort products by storage (ascending) then by color priority
 * NOTE: This is now only used for client-side color/storage filtering
 * Server-side sorting is preferred and should be used via API
 */
export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const storageDiff = parseStorage(a.storage, a.name) - parseStorage(b.storage, b.name);
    if (storageDiff !== 0) return storageDiff;
    return colorPriority(a.color, a.name) - colorPriority(b.color, b.name);
  });
}
