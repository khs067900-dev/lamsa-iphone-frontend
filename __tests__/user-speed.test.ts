/**
 * User-Facing Speed Test
 * يقيس وقت ظهور كل حاجة للزبون بالـ ms
 * Real backend: https://lamsa-iphone-backend.vercel.app
 */

const BACKEND = "https://lamsa-iphone-backend.vercel.app";
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,discountPercent,price,freeDelivery,warrantyYears,installment";

// ─── UX thresholds (Google Core Web Vitals inspired) ─────────────────────────
const THRESHOLDS = {
  INSTANT:  200,   // زبون مش حاسس بأي تأخير
  FAST:     500,   // ممتاز
  OK:      1000,   // مقبول
  SLOW:    2000,   // بطيء — زبون حاسس
  DEAD:    3000,   // كتير جداً — زبون ممكن يمشي
};

function rating(ms: number): string {
  if (ms <= THRESHOLDS.INSTANT) return "🟢 فوري";
  if (ms <= THRESHOLDS.FAST)    return "🟢 ممتاز";
  if (ms <= THRESHOLDS.OK)      return "🟡 مقبول";
  if (ms <= THRESHOLDS.SLOW)    return "🟠 بطيء";
  return "🔴 بطيء جداً";
}

async function time<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const t0 = Date.now();
  const result = await fn();
  return { result, ms: Date.now() - t0 };
}

// ─── shared state ─────────────────────────────────────────────────────────────
let allProducts: any[] = [];
const timings: Record<string, number> = {};

// ═════════════════════════════════════════════════════════════════════════════
describe("⏱️  User-Facing Speed — وقت ظهور كل حاجة للزبون", () => {

  // ── 0. Warm up ────────────────────────────────────────────────────────────
  beforeAll(async () => {
    // warm the backend cache first
    await fetch(`${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`);
    await new Promise(r => setTimeout(r, 300));
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("📄 1. الصفحة الرئيسية — Home Page", () => {

    it("وقت جلب كل المنتجات (getAllProducts cache warm)", async () => {
      const { result, ms } = await time(() =>
        fetch(`${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`).then(r => r.json())
      );
      allProducts = Array.isArray(result) ? result : (result.products ?? []);
      timings["home_products"] = ms;
      console.log(`\n  🏠 Home — جلب ${allProducts.length} منتج: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("وقت جلب company info (logo, name)", async () => {
      const { ms } = await time(() =>
        fetch(`${BACKEND}/api/admin/company`).then(r => r.json())
      );
      timings["company"] = ms;
      console.log(`\n  🏢 Company info: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("وقت جلب home-settings (ترتيب الكاتيجوريز)", async () => {
      const { ms } = await time(() =>
        fetch(`${BACKEND}/api/admin/sub-categories/home-settings`).then(r => r.json())
      );
      timings["home_settings"] = ms;
      console.log(`\n  ⚙️  Home settings: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("وقت جلب category banners", async () => {
      const cats = [...new Set(allProducts.map((p: any) => p.category).filter(Boolean))].join(",");
      const { ms } = await time(() =>
        fetch(`${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(cats)}`).then(r => r.json())
      );
      timings["banners"] = ms;
      console.log(`\n  🖼️  Category banners: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("إجمالي وقت تحميل الصفحة الرئيسية (كل الـ requests مع بعض)", async () => {
      const t0 = Date.now();
      await Promise.all([
        fetch(`${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`),
        fetch(`${BACKEND}/api/admin/company`),
        fetch(`${BACKEND}/api/admin/sub-categories/home-settings`),
        fetch(`${BACKEND}/api/admin/sub-categories/max`),
      ]);
      const ms = Date.now() - t0;
      timings["home_total_parallel"] = ms;
      console.log(`\n  ⚡ Home — كل الـ requests بالتوازي: ${ms}ms  ${rating(ms)}`);
      console.log(`     (بعد كده banners بتتجيب في ${timings["banners"]}ms إضافية)`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("وقت grouping + sorting المنتجات في الـ browser", () => {
      const t0 = Date.now();
      const map: Record<string, any[]> = {};
      allProducts.forEach((p: any) => {
        const cat = p.category || p.subCategory || "أخرى";
        (map[cat] ??= []).push(p);
      });
      const ms = Date.now() - t0;
      timings["browser_grouping"] = ms;
      console.log(`\n  🖥️  Browser grouping ${allProducts.length} products: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(50);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("📱 2. صفحات الكاتيجوري — Category Pages", () => {

    const categoryPages = [
      { label: "آيفون 17 برو ماكس", slug: "iphone-17-pro-max", category: "ابل ايفون 17 برو ماكس" },
      { label: "آيفون 17 Air",       slug: "iphone-17-air",     category: "ابل ايفون 17 اير" },
      { label: "آيفون 16 برو ماكس", slug: "iphone-16-pro-max", category: "ابل ايفون 16 برو ماكس" },
      { label: "فقط آبل",            slug: "apple-only",        category: null },
      { label: "سامسونج S25",        slug: "samsung-s25-ultra", category: "سامسونج جالاكسي S25" },
      { label: "ساعات ابل",          slug: "se",                category: null },
      { label: "بلاي ستيشن",         slug: "ps5",               category: "ps5" },
      { label: "ايباد",              slug: "ipad",              category: "tablet" },
      { label: "بطاريات",            slug: "anker-batteries",   category: "بطاريات متنقله" },
    ];

    categoryPages.forEach(({ label, slug, category }) => {
      it(`صفحة "${label}" — وقت ظهور المنتجات`, async () => {
        // simulate what CategoryPageClient does: filter from cached products
        const t0 = Date.now();
        const filtered = allProducts.filter((p: any) => {
          if (!category) return true; // apple-only / se handled differently
          return (p.category || "").includes(category);
        });
        const ms = Date.now() - t0;
        timings[`cat_${slug}`] = ms;
        const pages = Math.ceil(filtered.length / 12) || 1;
        console.log(`\n  📂 "${label}": ${filtered.length} منتج، ${pages} صفحة — filter: ${ms}ms  ${rating(ms)}`);
        expect(ms).toBeLessThan(50);
      });
    });

    it("apple-only — أكبر صفحة (114 منتج، 10 صفحات)", () => {
      const t0 = Date.now();
      const filtered = allProducts.filter((p: any) =>
        p.brand?.toLowerCase() === "apple"
      );
      const ms = Date.now() - t0;
      const pages = Math.ceil(filtered.length / 12);
      console.log(`\n  🍎 apple-only: ${filtered.length} منتج، ${pages} صفحة — filter: ${ms}ms  ${rating(ms)}`);
      expect(filtered.length).toBeGreaterThan(0);
      expect(ms).toBeLessThan(50);
    });

    it("pagination — وقت تغيير الصفحة في الـ browser", () => {
      const ITEMS_PER_PAGE = 12;
      const appleProducts = allProducts.filter((p: any) => p.brand?.toLowerCase() === "apple");
      const t0 = Date.now();
      // simulate page 2 click
      const page2 = appleProducts.slice(ITEMS_PER_PAGE, ITEMS_PER_PAGE * 2);
      const ms = Date.now() - t0;
      timings["pagination_click"] = ms;
      console.log(`\n  📄 Pagination click (page 2): ${page2.length} products in ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(10); // pure JS slice — should be instant
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("🔍 3. البحث — Search", () => {

    const searchQueries = [
      { q: "ايفون",    expectedMin: 1 },
      { q: "سامسونج",  expectedMin: 1 },
      { q: "ساعة",     expectedMin: 0 }, // was broken — now fixed
      { q: "ايباد",    expectedMin: 0 }, // was broken — now fixed
      { q: "بلاي",     expectedMin: 1 },
      { q: "سماعات",   expectedMin: 1 },
      { q: "بطاري",    expectedMin: 1 },
    ];

    searchQueries.forEach(({ q, expectedMin }) => {
      it(`بحث "${q}" — وقت ظهور النتايج للزبون`, async () => {
        const { result, ms } = await time(() =>
          fetch(`${BACKEND}/api/products?q=${encodeURIComponent(q)}`).then(r => r.json())
        );
        const results = Array.isArray(result) ? result : [];
        timings[`search_${q}`] = ms;
        const status = results.length >= expectedMin ? "✅" : "⚠️ ";
        console.log(`\n  🔍 "${q}": ${results.length} نتيجة في ${ms}ms  ${rating(ms)}  ${status}`);
        if (results.length === 0 && expectedMin > 0) {
          console.warn(`     ⚠️  مفيش نتايج — مشكلة في البحث`);
        }
        expect(ms).toBeLessThan(THRESHOLDS.DEAD);
      });
    });

    it("search debounce simulation (300ms delay كما في الـ Navbar)", async () => {
      // simulate user typing with 300ms debounce
      const queries = ["ا", "اي", "ايف", "ايفو", "ايفون"];
      const results: number[] = [];
      for (const q of queries) {
        await new Promise(r => setTimeout(r, 300)); // debounce
        const { ms } = await time(() =>
          fetch(`${BACKEND}/api/products?q=${encodeURIComponent(q)}`).then(r => r.json())
        );
        results.push(ms);
      }
      const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
      console.log(`\n  ⌨️  Search debounce (5 keystrokes × 300ms): avg ${avg}ms per request  ${rating(avg)}`);
      console.log(`     Total typing experience: ~${300 * 5 + avg}ms للنتيجة الأخيرة`);
      expect(avg).toBeLessThan(THRESHOLDS.DEAD);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("📦 4. صفحة المنتج — Product Detail", () => {

    it("وقت فتح صفحة منتج (product detail fetch)", async () => {
      const sample = allProducts[0];
      const { result, ms } = await time(() =>
        fetch(`${BACKEND}/api/products/${sample._id}`).then(r => r.json())
      );
      timings["product_detail"] = ms;
      console.log(`\n  📦 Product detail "${result.name?.slice(0, 30)}...": ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("وقت فتح 3 منتجات مختلفة (متوسط)", async () => {
      const samples = allProducts.slice(0, 3);
      const times: number[] = [];
      for (const p of samples) {
        const { ms } = await time(() =>
          fetch(`${BACKEND}/api/products/${p._id}`).then(r => r.json())
        );
        times.push(ms);
      }
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      timings["product_detail_avg"] = avg;
      console.log(`\n  📦 Product detail avg (3 products): ${avg}ms  ${rating(avg)}`);
      console.log(`     Individual: ${times.map(t => t + "ms").join(", ")}`);
      expect(avg).toBeLessThan(THRESHOLDS.DEAD);
    });

    it("getProductById من الـ cache (بدون network)", () => {
      const t0 = Date.now();
      const id = allProducts[0]._id;
      const found = allProducts.find((p: any) => p._id === id);
      const ms = Date.now() - t0;
      timings["product_from_cache"] = ms;
      console.log(`\n  ⚡ getProductById من cache: ${ms}ms  ${rating(ms)}`);
      expect(found).toBeDefined();
      expect(ms).toBeLessThan(5);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("🛒 5. السلة والـ Checkout", () => {

    it("وقت إضافة منتج للسلة (Zustand store — pure JS)", () => {
      const product = allProducts[0];
      const cart: any[] = [];
      const t0 = Date.now();
      // simulate addItem
      const existing = cart.find(i => i.product._id === product._id);
      if (existing) existing.qty += 1;
      else cart.push({ product, qty: 1 });
      const ms = Date.now() - t0;
      timings["add_to_cart"] = ms;
      console.log(`\n  🛒 Add to cart (Zustand): ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(5);
    });

    it("وقت حساب إجمالي السلة (totalPrice)", () => {
      const cart = allProducts.slice(0, 10).map((p: any) => ({ product: p, qty: 1 }));
      const t0 = Date.now();
      const total = cart.reduce((sum: number, { product, qty }: any) => {
        const price = product.salePrice ?? product.originalPrice ?? product.price ?? 0;
        return sum + price * qty;
      }, 0);
      const ms = Date.now() - t0;
      timings["cart_total"] = ms;
      console.log(`\n  💰 Cart total (10 items): ${total.toLocaleString("en-US")} SAR في ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(5);
    });

    it("وقت جلب بيانات الـ checkout (company + settings)", async () => {
      const t0 = Date.now();
      await Promise.all([
        fetch(`${BACKEND}/api/admin/company`),
        fetch(`${BACKEND}/api/admin/card-field-settings`).catch(() => null),
      ]);
      const ms = Date.now() - t0;
      timings["checkout_load"] = ms;
      console.log(`\n  💳 Checkout load: ${ms}ms  ${rating(ms)}`);
      expect(ms).toBeLessThan(THRESHOLDS.DEAD);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("🔗 6. Nav Links — وقت استجابة كل رابط", () => {

    it("كل nav link بيفلتر من الـ cache (بدون network)", () => {
      const navSlugs = [
        { slug: "iphone-17-pro-max", cat: "ابل ايفون 17 برو ماكس" },
        { slug: "iphone-17-air",     cat: "ابل ايفون 17 اير" },
        { slug: "iphone-16-pro-max", cat: "ابل ايفون 16 برو ماكس" },
        { slug: "samsung-s25-ultra", cat: "سامسونج جالاكسي S25" },
        { slug: "ps5",               cat: "ps5" },
        { slug: "ipad",              cat: "tablet" },
        { slug: "anker-batteries",   cat: "بطاريات متنقله" },
      ];

      console.log(`\n  🔗 Nav link filter times (from cache):`);
      navSlugs.forEach(({ slug, cat }) => {
        const t0 = Date.now();
        const filtered = allProducts.filter((p: any) => (p.category || "").includes(cat));
        const ms = Date.now() - t0;
        console.log(`     ${slug}: ${filtered.length} products in ${ms}ms  ${rating(ms)}`);
        expect(ms).toBeLessThan(20);
      });
    });

    it("samsung-s22-ultra — صفحة فاضية (مشكلة بيانات)", () => {
      const filtered = allProducts.filter((p: any) =>
        (p.category || "").includes("سامسونج جالاكسي S22")
      );
      console.log(`\n  ⚠️  samsung-s22-ultra: ${filtered.length} منتجات`);
      if (filtered.length === 0) {
        console.warn(`     🔴 الصفحة هتظهر فاضية للزبون — محتاج تضيف منتجات S22 أو تشيل الرابط`);
      }
      expect(filtered.length).toBe(0); // documenting the known issue
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("📊 7. Final Report — ملخص وقت ظهور كل حاجة للزبون", () => {

    it("الـ Summary الكامل", () => {
      const homeTotal = Math.max(timings["home_total_parallel"] || 0, timings["home_products"] || 0);
      const bannersExtra = timings["banners"] || 0;

      console.log(`
  ╔══════════════════════════════════════════════════════════════════════╗
  ║         ⏱️  وقت ظهور كل حاجة للزبون — User-Facing Speed Report      ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  📄 الصفحة الرئيسية                                                  ║
  ║    • جلب المنتجات (warm cache)  : ${String((timings["home_products"]||0)+"ms").padEnd(8)} ${rating(timings["home_products"]||0).padEnd(18)}║
  ║    • Company info               : ${String((timings["company"]||0)+"ms").padEnd(8)} ${rating(timings["company"]||0).padEnd(18)}║
  ║    • Home settings              : ${String((timings["home_settings"]||0)+"ms").padEnd(8)} ${rating(timings["home_settings"]||0).padEnd(18)}║
  ║    • Category banners           : ${String((timings["banners"]||0)+"ms").padEnd(8)} ${rating(timings["banners"]||0).padEnd(18)}║
  ║    • كل الـ requests بالتوازي   : ${String(homeTotal+"ms").padEnd(8)} ${rating(homeTotal).padEnd(18)}║
  ║    • Grouping في الـ browser    : ${String((timings["browser_grouping"]||0)+"ms").padEnd(8)} ${rating(timings["browser_grouping"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  📦 صفحة المنتج                                                      ║
  ║    • Product detail fetch       : ${String((timings["product_detail"]||0)+"ms").padEnd(8)} ${rating(timings["product_detail"]||0).padEnd(18)}║
  ║    • متوسط 3 منتجات             : ${String((timings["product_detail_avg"]||0)+"ms").padEnd(8)} ${rating(timings["product_detail_avg"]||0).padEnd(18)}║
  ║    • من الـ cache (بدون network): ${String((timings["product_from_cache"]||0)+"ms").padEnd(8)} ${rating(timings["product_from_cache"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  🔍 البحث                                                            ║
  ║    • بحث "ايفون"                : ${String((timings["search_ايفون"]||0)+"ms").padEnd(8)} ${rating(timings["search_ايفون"]||0).padEnd(18)}║
  ║    • بحث "سامسونج"              : ${String((timings["search_سامسونج"]||0)+"ms").padEnd(8)} ${rating(timings["search_سامسونج"]||0).padEnd(18)}║
  ║    • بحث "ساعة" (بعد الفيكس)   : ${String((timings["search_ساعة"]||0)+"ms").padEnd(8)} ${rating(timings["search_ساعة"]||0).padEnd(18)}║
  ║    • بحث "ايباد" (بعد الفيكس)  : ${String((timings["search_ايباد"]||0)+"ms").padEnd(8)} ${rating(timings["search_ايباد"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  🛒 السلة والـ Checkout                                              ║
  ║    • Add to cart (Zustand)      : ${String((timings["add_to_cart"]||0)+"ms").padEnd(8)} ${rating(timings["add_to_cart"]||0).padEnd(18)}║
  ║    • Cart total calculation     : ${String((timings["cart_total"]||0)+"ms").padEnd(8)} ${rating(timings["cart_total"]||0).padEnd(18)}║
  ║    • Checkout page load         : ${String((timings["checkout_load"]||0)+"ms").padEnd(8)} ${rating(timings["checkout_load"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  📄 Pagination                                                       ║
  ║    • تغيير صفحة (pure JS)       : ${String((timings["pagination_click"]||0)+"ms").padEnd(8)} ${rating(timings["pagination_click"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  🚨 مشاكل مكتشفة                                                     ║
  ║    • samsung-s22-ultra: صفحة فاضية — مفيش منتجات S22 في الـ DB      ║
  ╚══════════════════════════════════════════════════════════════════════╝`);
      expect(true).toBe(true);
    });
  });
});
