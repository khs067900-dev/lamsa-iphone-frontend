/**
 * Home Page Products — Performance & Data Quality Tests
 * Uses REAL backend: https://lamsa-iphone-backend.vercel.app
 */

const BACKEND = "https://lamsa-iphone-backend.vercel.app";
const FIELDS =
  "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,network,price";

// ─── helpers ────────────────────────────────────────────────────────────────

function sortProducts(products: any[]): any[] {
  const COLOR_ORDER = ["برتقالي","سيلفر","أزرق تيتانيوم","أزرق فاتح","أزرق","ازرق","أسود تيتانيوم","أسود","أبيض تيتانيوم","أبيض","بينك","جولد","رصاصي","رمادي تيتانيوم","صحراوي"];
  function parseStorage(s?: string, name?: string): number {
    for (const raw of [s, name].filter(Boolean) as string[]) {
      const clean = raw.replace(/\s+/g, "");
      const m = clean.match(/(\d+)(tb|gb)/i) || clean.match(/(gb|tb)(\d+)/i);
      if (m) {
        const num = parseInt(m[1]) || parseInt(m[2]);
        const unit = (m[1].match(/\d/) ? m[2] : m[1]).toLowerCase();
        return unit === "tb" ? num * 1024 : num;
      }
    }
    return Infinity;
  }
  function colorPriority(color?: string, name?: string): number {
    const src = color?.trim() || "";
    if (!src) return 999;
    const idx = COLOR_ORDER.findIndex((c) => c === src);
    return idx !== -1 ? idx : COLOR_ORDER.length;
  }
  return [...products].sort((a, b) => {
    const sd = parseStorage(a.storage, a.name) - parseStorage(b.storage, b.name);
    if (sd !== 0) return sd;
    return colorPriority(a.color, a.name) - colorPriority(b.color, b.name);
  });
}

function groupByCategory(products: any[]): Record<string, any[]> {
  const map: Record<string, any[]> = {};
  products.forEach((p) => {
    const cat = p.category || p.subCategory || "أخرى";
    (map[cat] ??= []).push(p);
  });
  Object.keys(map).forEach((cat) => { map[cat] = sortProducts(map[cat]); });
  return map;
}

// ─── shared state ────────────────────────────────────────────────────────────

let products: any[] = [];
let fetchMs = 0;
let groupMs = 0;
let sortMs = 0;
let grouped: Record<string, any[]> = {};

// ─── suite ───────────────────────────────────────────────────────────────────

describe("🏠 Home Page — Products Performance & Quality", () => {

  // ── 1. Fetch real data ────────────────────────────────────────────────────
  describe("1. API — fetch speed", () => {
    it("fetches all products and records time", async () => {
      const t0 = Date.now();
      const res = await fetch(`${BACKEND}/api/products?page=1&limit=2000&fields=${FIELDS}`);
      fetchMs = Date.now() - t0;

      expect(res.ok).toBe(true);
      const data = await res.json();
      products = Array.isArray(data) ? data : (data.products ?? []);

      console.log(`\n  ✅ API responded in: ${fetchMs}ms`);
      console.log(`  📦 Total products fetched: ${products.length}`);
      console.log(`  📡 Status: ${res.status}`);
    });

    it("API should respond under 3000ms", () => {
      console.log(`  ⏱  Fetch time: ${fetchMs}ms  (limit: 3000ms)`);
      if (fetchMs > 3000) {
        console.warn(`  ⚠️  SLOW: API took ${fetchMs}ms — users will wait this long on cold cache`);
      }
      expect(fetchMs).toBeLessThan(3000);
    });

    it("API should respond under 1000ms (ideal target)", () => {
      console.log(`  🎯 Ideal target: <1000ms — actual: ${fetchMs}ms`);
      if (fetchMs > 1000) {
        console.warn(`  ⚠️  PROBLEM: ${fetchMs}ms is too slow for a good UX. Consider pagination or ISR.`);
      }
      expect(fetchMs).toBeLessThan(1000);
    });
  });

  // ── 2. Data quality ───────────────────────────────────────────────────────
  describe("2. Data quality", () => {
    it("all products have a name", () => {
      const missing = products.filter((p) => !p.name);
      console.log(`\n  🔍 Products missing name: ${missing.length}`);
      if (missing.length) console.warn("  ⚠️  IDs:", missing.map((p) => p._id));
      expect(missing.length).toBe(0);
    });

    it("all products have a valid price > 0", () => {
      const bad = products.filter((p) => {
        const price = p.originalPrice || p.price || 0;
        return price <= 0;
      });
      console.log(`  💰 Products with invalid price (≤0): ${bad.length}`);
      if (bad.length) console.warn("  ⚠️  Names:", bad.map((p) => p.name));
      expect(bad.length).toBe(0);
    });

    it("all products have an image", () => {
      const noImg = products.filter((p) => !p.image && (!p.images || p.images.length === 0));
      console.log(`  🖼  Products missing image: ${noImg.length}`);
      if (noImg.length) console.warn("  ⚠️  Names:", noImg.map((p) => p.name));
      expect(noImg.length).toBe(0);
    });

    it("no product has salePrice > originalPrice (pricing bug)", () => {
      const bugged = products.filter(
        (p) => p.salePrice && p.originalPrice && p.salePrice > p.originalPrice
      );
      console.log(`  🐛 Products where salePrice > originalPrice: ${bugged.length}`);
      if (bugged.length) {
        bugged.forEach((p) =>
          console.warn(`  ⚠️  "${p.name}" — original: ${p.originalPrice}, sale: ${p.salePrice}`)
        );
      }
      expect(bugged.length).toBe(0);
    });

    it("no product has discountPercent > 0 but no salePrice", () => {
      const inconsistent = products.filter(
        (p) => p.discountPercent > 0 && (!p.salePrice || p.salePrice <= 0)
      );
      console.log(`  🏷  Products with discountPercent but no salePrice: ${inconsistent.length}`);
      if (inconsistent.length) {
        inconsistent.forEach((p) =>
          console.warn(`  ⚠️  "${p.name}" — discount: ${p.discountPercent}%, salePrice: ${p.salePrice}`)
        );
      }
      expect(inconsistent.length).toBe(0);
    });

    it("all products have a category or subCategory", () => {
      const noCat = products.filter((p) => !p.category && !p.subCategory);
      console.log(`  📂 Products missing category: ${noCat.length}`);
      if (noCat.length) console.warn("  ⚠️  Names:", noCat.map((p) => p.name));
      expect(noCat.length).toBe(0);
    });

    it("reports inStock breakdown", () => {
      const inStock = products.filter((p) => p.inStock).length;
      const outOfStock = products.filter((p) => !p.inStock).length;
      console.log(`\n  📊 In stock: ${inStock} | Out of stock: ${outOfStock}`);
      expect(products.length).toBeGreaterThan(0);
    });
  });

  // ── 3. Client-side processing performance ─────────────────────────────────
  describe("3. Client-side processing (grouping + sorting)", () => {
    it("groups and sorts all products and records time", () => {
      const t0 = Date.now();
      grouped = groupByCategory(products);
      groupMs = Date.now() - t0;

      const categories = Object.keys(grouped);
      console.log(`\n  ⚙️  Group+Sort time: ${groupMs}ms for ${products.length} products`);
      console.log(`  📁 Categories found: ${categories.length}`);
      categories.forEach((cat) => {
        console.log(`     • "${cat}": ${grouped[cat].length} products`);
      });
    });

    it("grouping should complete under 50ms", () => {
      console.log(`  ⏱  Group+Sort: ${groupMs}ms  (limit: 50ms)`);
      if (groupMs > 50) {
        console.warn(`  ⚠️  SLOW: ${groupMs}ms to process ${products.length} products in browser`);
      }
      expect(groupMs).toBeLessThan(50);
    });
  });

  // ── 4. Home page payload size ─────────────────────────────────────────────
  describe("4. Payload size (what gets sent to browser)", () => {
    it("measures JSON payload size", () => {
      const bytes = Buffer.byteLength(JSON.stringify(products), "utf8");
      const kb = (bytes / 1024).toFixed(1);
      const mb = (bytes / 1024 / 1024).toFixed(2);
      console.log(`\n  📦 Total payload: ${kb} KB (${mb} MB) for ${products.length} products`);
      if (bytes > 500 * 1024) {
        console.warn(`  ⚠️  PROBLEM: Payload is ${mb}MB — this is sent on every SSR page load`);
        console.warn(`  💡 FIX: Reduce fields fetched or paginate. Current limit=2000 is too high.`);
      }
    });

    it("payload should be under 500KB", () => {
      const bytes = Buffer.byteLength(JSON.stringify(products), "utf8");
      const kb = (bytes / 1024).toFixed(1);
      console.log(`  📏 Payload: ${kb}KB  (limit: 500KB)`);
      expect(bytes).toBeLessThan(500 * 1024);
    });
  });

  // ── 5. Home page display logic ────────────────────────────────────────────
  describe("5. Home page display — what user actually sees", () => {
    it("each category shows max 4 products (LIMIT=4)", () => {
      const LIMIT = 4;
      Object.entries(grouped).forEach(([cat, items]) => {
        const visible = items.slice(0, LIMIT).length;
        expect(visible).toBeLessThanOrEqual(LIMIT);
      });
      const totalVisible = Object.values(grouped).reduce((sum, items) => sum + Math.min(items.length, 4), 0);
      const totalFetched = products.length;
      const wastedPercent = (((totalFetched - totalVisible) / totalFetched) * 100).toFixed(1);
      console.log(`\n  👁  Visible products on home: ${totalVisible}`);
      console.log(`  📦 Total fetched from API: ${totalFetched}`);
      console.log(`  🗑  Wasted (fetched but never shown): ${totalFetched - totalVisible} products (${wastedPercent}%)`);
      if (parseFloat(wastedPercent) > 50) {
        console.warn(`  ⚠️  PROBLEM: ${wastedPercent}% of fetched data is never shown on home page`);
        console.warn(`  💡 FIX: Fetch only what's needed per category (max 4 per category)`);
      }
    });

    it("summary report", () => {
      const totalVisible = Object.values(grouped).reduce((sum, items) => sum + Math.min(items.length, 4), 0);
      const bytes = Buffer.byteLength(JSON.stringify(products), "utf8");
      console.log(`
  ╔══════════════════════════════════════════════════╗
  ║           PERFORMANCE SUMMARY REPORT             ║
  ╠══════════════════════════════════════════════════╣
  ║  API fetch time       : ${String(fetchMs + "ms").padEnd(22)}║
  ║  Group+Sort time      : ${String(groupMs + "ms").padEnd(22)}║
  ║  Total products       : ${String(products.length).padEnd(22)}║
  ║  Visible on home      : ${String(totalVisible).padEnd(22)}║
  ║  Wasted products      : ${String(products.length - totalVisible).padEnd(22)}║
  ║  Payload size         : ${String((bytes / 1024).toFixed(1) + " KB").padEnd(22)}║
  ║  Categories           : ${String(Object.keys(grouped).length).padEnd(22)}║
  ╚══════════════════════════════════════════════════╝`);
      expect(true).toBe(true);
    });
  });
});
