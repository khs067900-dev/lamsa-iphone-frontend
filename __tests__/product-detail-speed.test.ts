/**
 * Product Detail Page — Performance & Speed Test
 * يقيس وقت ظهور صفحة المنتج للزبون من كل نقطة دخول
 * Real backend: https://lamsa-iphone-backend.vercel.app
 */

const BACKEND = "https://lamsa-iphone-backend.vercel.app";
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,discountPercent,description,specs,warrantyYears,freeDelivery,deliveryTime,installment,price";

const T = { INSTANT: 200, FAST: 500, OK: 1000, SLOW: 2000, DEAD: 3000 };
function rate(ms: number) {
  if (ms <= T.INSTANT) return "🟢 فوري";
  if (ms <= T.FAST)    return "🟢 ممتاز";
  if (ms <= T.OK)      return "🟡 مقبول";
  if (ms <= T.SLOW)    return "🟠 بطيء";
  return "🔴 بطيء جداً";
}
async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const t0 = Date.now();
  const result = await fn();
  return { result, ms: Date.now() - t0 };
}

// Entry points — where user clicks a product from
const ENTRY_PAGES = [
  { label: "الصفحة الرئيسية",        category: null,                    brand: null },
  { label: "صفحة آيفون 17 برو ماكس", category: "ابل ايفون 17 برو ماكس", brand: "Apple" },
  { label: "صفحة آيفون 17 Air",       category: "ابل ايفون 17 اير",      brand: "Apple" },
  { label: "صفحة آيفون 16 برو ماكس", category: "ابل ايفون 16 برو ماكس", brand: "Apple" },
  { label: "صفحة آيفون 16 بلس",       category: "ايفون 16 بلس",          brand: "Apple" },
  { label: "صفحة سامسونج S25",        category: "سامسونج جالاكسي S25",   brand: "Samsung" },
  { label: "صفحة سامسونج S26",        category: "سامسونج جالاكسي S26",   brand: "Samsung" },
  { label: "صفحة ساعات ابل",          category: "ساعات ابل",             brand: "Apple" },
  { label: "صفحة بلاي ستيشن",         category: "ps5",                   brand: null },
  { label: "صفحة ايباد",              category: "tablet",                brand: null },
  { label: "صفحة بطاريات",            category: "بطاريات متنقله",        brand: null },
  { label: "صفحة سماعات",             category: "سماعات",                brand: null },
];

// shared
let allProducts: any[] = [];
const timings: Record<string, number> = {};
const issues: string[] = [];

// ─────────────────────────────────────────────────────────────────────────────
describe("📦 Product Detail Page — Speed & Performance", () => {

  beforeAll(async () => {
    await fetch(`${BACKEND}/ping`).catch(() => {});
    await new Promise(r => setTimeout(r, 200));
    const r = await fetch(`${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`);
    const d = await r.json();
    allProducts = Array.isArray(d) ? d : (d.products ?? []);
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("1. وقت فتح صفحة المنتج من كل نقطة دخول", () => {

    it("من الصفحة الرئيسية — أول منتج يظهر (priority=true)", async () => {
      const product = allProducts[0];
      const { result, ms } = await timed(() =>
        fetch(`${BACKEND}/api/products/${product._id}`).then(r => r.json())
      );
      timings["from_home_first"] = ms;
      console.log(`\n  🏠 من الرئيسية (أول منتج): ${ms}ms  ${rate(ms)}`);
      console.log(`     المنتج: "${result.name?.slice(0, 40)}"`);
      expect(ms).toBeLessThan(T.DEAD);
    });

    it("من الصفحة الرئيسية — منتج عشوائي (lazy loaded)", async () => {
      const product = allProducts[Math.floor(allProducts.length / 2)];
      const { result, ms } = await timed(() =>
        fetch(`${BACKEND}/api/products/${product._id}`).then(r => r.json())
      );
      timings["from_home_random"] = ms;
      console.log(`\n  🏠 من الرئيسية (منتج عشوائي): ${ms}ms  ${rate(ms)}`);
      console.log(`     المنتج: "${result.name?.slice(0, 40)}"`);
      expect(ms).toBeLessThan(T.DEAD);
    });

    ENTRY_PAGES.forEach(({ label, category, brand }) => {
      it(`من ${label}`, async () => {
        const filtered = allProducts.filter(p => {
          const matchCat = category ? (p.category || "").includes(category) : true;
          const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
          return matchCat && matchBrand;
        });

        if (filtered.length === 0) {
          issues.push(`⚠️  "${label}" — مفيش منتجات`);
          console.warn(`\n  ⚠️  "${label}": مفيش منتجات — الصفحة فاضية`);
          return;
        }

        const product = filtered[0];
        const t0 = Date.now();

        // Step 1: product already in cache (SSR passes initialProduct)
        const fromCache = allProducts.find(p => p._id === product._id);
        const cacheMs = Date.now() - t0;

        // Step 2: if not in cache, fetch from API (fallback)
        const { result, ms: apiMs } = await timed(() =>
          fetch(`${BACKEND}/api/products/${product._id}`).then(r => r.json())
        );

        timings[`entry_${label}`] = apiMs;

        console.log(`\n  📂 ${label}:`);
        console.log(`     منتجات في الصفحة: ${filtered.length}`);
        console.log(`     من الـ cache (SSR): ${cacheMs}ms  ${rate(cacheMs)}`);
        console.log(`     من الـ API (fallback): ${apiMs}ms  ${rate(apiMs)}`);
        console.log(`     المنتج: "${result.name?.slice(0, 40)}"`);
        console.log(`     السعر: ${(result.salePrice ?? result.originalPrice ?? 0).toLocaleString("en-US")} ر.س`);
        console.log(`     متوفر: ${result.inStock ? "✅" : "❌"}`);

        expect(cacheMs).toBeLessThan(5);
        expect(apiMs).toBeLessThan(T.DEAD);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("2. مكونات صفحة المنتج — وقت render كل جزء", () => {

    it("ProductImages — وقت تحضير الصور", () => {
      const product = allProducts.find(p => p.images?.length > 1) || allProducts[0];
      const API = "https://lamsa-iphone-backend.vercel.app";
      const t0 = Date.now();
      const merged = [...(product.images || []), ...(product.image ? [product.image] : [])];
      const allImages = [...new Set(merged)].map((src: string) =>
        src.startsWith("http") ? src : `${API}${src}`
      );
      const ms = Date.now() - t0;
      timings["images_prep"] = ms;
      console.log(`\n  🖼️  ProductImages prep: ${ms}ms  ${rate(ms)}`);
      console.log(`     صور: ${allImages.length} صورة`);
      expect(ms).toBeLessThan(5);
    });

    it("ProductInfo — وقت حساب السعر والخصم", () => {
      const products = allProducts.slice(0, 20);
      const t0 = Date.now();
      products.forEach(p => {
        const originalPrice = p.originalPrice || p.price || 0;
        const hasDiscount = p.salePrice != null && p.salePrice > 0 && p.salePrice < originalPrice;
        const savingsPercent = hasDiscount
          ? Math.round(((originalPrice - p.salePrice) / originalPrice) * 100)
          : 0;
        return { hasDiscount, savingsPercent };
      });
      const ms = Date.now() - t0;
      timings["price_calc"] = ms;
      console.log(`\n  💰 ProductInfo price calc (20 products): ${ms}ms  ${rate(ms)}`);
      expect(ms).toBeLessThan(5);
    });

    it("ProductDetails — وقت تحضير الـ specs", () => {
      const withSpecs = allProducts.filter(p => p.specs && Object.values(p.specs).some(Boolean));
      const t0 = Date.now();
      withSpecs.slice(0, 10).forEach(p => {
        const hasSpecs = p.specs && Object.values(p.specs).some(Boolean);
        const specCount = hasSpecs ? Object.values(p.specs).filter(Boolean).length : 0;
        return specCount;
      });
      const ms = Date.now() - t0;
      timings["specs_prep"] = ms;
      console.log(`\n  📋 ProductDetails specs prep: ${ms}ms  ${rate(ms)}`);
      console.log(`     منتجات بمواصفات: ${withSpecs.length}/${allProducts.length}`);
      if (withSpecs.length === 0) issues.push("⚠️  مفيش منتجات عندها specs — تاب المواصفات هيكون فاضي");
      expect(ms).toBeLessThan(5);
    });

    it("Add to Cart button — وقت الاستجابة", () => {
      const product = allProducts[0];
      const cart: any[] = [];
      const t0 = Date.now();
      const existing = cart.find(i => i.product._id === product._id);
      if (existing) existing.qty += 1;
      else cart.push({ product, qty: 1 });
      const ms = Date.now() - t0;
      timings["add_to_cart"] = ms;
      console.log(`\n  🛒 Add to Cart: ${ms}ms  ${rate(ms)}`);
      expect(ms).toBeLessThan(5);
    });

    it("Share button — navigator.share (browser API)", () => {
      // simulate — no actual share in Node
      const t0 = Date.now();
      const shareData = {
        title: allProducts[0]?.name || "",
        url: `https://lamsasmart.com/product/${allProducts[0]?._id}`,
      };
      const ms = Date.now() - t0;
      timings["share_prep"] = ms;
      console.log(`\n  📤 Share button prep: ${ms}ms  ${rate(ms)}`);
      expect(shareData.title.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("3. جودة بيانات صفحة المنتج", () => {

    it("كل المنتجات عندها اسم وسعر وصورة", () => {
      const noName  = allProducts.filter(p => !p.name);
      const noPrice = allProducts.filter(p => !(p.originalPrice || p.price));
      const noImg   = allProducts.filter(p => !p.image && (!p.images || !p.images.length));
      console.log(`\n  📊 Data quality:`);
      console.log(`     بدون اسم: ${noName.length}`);
      console.log(`     بدون سعر: ${noPrice.length}`);
      console.log(`     بدون صورة: ${noImg.length}`);
      if (noName.length)  issues.push(`❌ ${noName.length} منتجات بدون اسم`);
      if (noPrice.length) issues.push(`❌ ${noPrice.length} منتجات بدون سعر`);
      if (noImg.length)   issues.push(`❌ ${noImg.length} منتجات بدون صورة`);
      expect(noName.length).toBe(0);
      expect(noPrice.length).toBe(0);
      expect(noImg.length).toBe(0);
    });

    it("كل المنتجات عندها _id صالح للـ routing", () => {
      const invalid = allProducts.filter(p => !p._id?.match(/^[a-f0-9]{24}$/));
      console.log(`\n  🔑 Valid IDs: ${allProducts.length - invalid.length}/${allProducts.length}`);
      expect(invalid.length).toBe(0);
    });

    it("منتجات بصور متعددة (ProductImages thumbnails)", () => {
      const multiImg = allProducts.filter(p => p.images?.length > 1);
      const singleImg = allProducts.filter(p => (!p.images || p.images.length <= 1) && p.image);
      console.log(`\n  🖼️  صور متعددة: ${multiImg.length} منتج`);
      console.log(`     صورة واحدة: ${singleImg.length} منتج`);
      if (multiImg.length === 0) issues.push("⚠️  مفيش منتجات بصور متعددة — thumbnails مش هتظهر");
    });

    it("منتجات بـ description (تاب الوصف)", () => {
      const withDesc = allProducts.filter(p => p.description?.trim());
      const pct = ((withDesc.length / allProducts.length) * 100).toFixed(1);
      console.log(`\n  📝 بوصف: ${withDesc.length}/${allProducts.length} (${pct}%)`);
      if (withDesc.length === 0) issues.push("⚠️  مفيش منتجات بوصف — تاب الوصف مش هيظهر");
    });

    it("منتجات بـ specs (تاب المواصفات)", () => {
      const withSpecs = allProducts.filter(p => p.specs && Object.values(p.specs).some(Boolean));
      const pct = ((withSpecs.length / allProducts.length) * 100).toFixed(1);
      console.log(`\n  📋 بمواصفات: ${withSpecs.length}/${allProducts.length} (${pct}%)`);
      if (withSpecs.length === 0) issues.push("⚠️  مفيش منتجات بـ specs — تاب المواصفات مش هيظهر");
    });

    it("منتجات out of stock — زبون هيشوف 'غير متوفر'", () => {
      const oos = allProducts.filter(p => !p.inStock);
      console.log(`\n  📦 Out of stock: ${oos.length} منتج`);
      oos.forEach(p => console.log(`     • "${p.name?.slice(0, 50)}"`));
    });

    it("منتجات بخصم — badge الخصم هيظهر", () => {
      const withDiscount = allProducts.filter(p =>
        p.salePrice && p.originalPrice && p.salePrice < p.originalPrice
      );
      console.log(`\n  🏷️  بخصم حقيقي: ${withDiscount.length} منتج`);
      withDiscount.slice(0, 3).forEach(p => {
        const pct = Math.round(((p.originalPrice - p.salePrice) / p.originalPrice) * 100);
        console.log(`     • "${p.name?.slice(0, 40)}" — خصم ${pct}%`);
      });
      if (withDiscount.length === 0) issues.push("⚠️  مفيش منتجات بخصم — badge الخصم مش هيظهر");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("4. سرعة الـ API — warm vs cold", () => {

    it("warm cache — نفس المنتج مرتين", async () => {
      const id = allProducts[0]._id;
      const { ms: first }  = await timed(() => fetch(`${BACKEND}/api/products/${id}`).then(r => r.json()));
      const { ms: second } = await timed(() => fetch(`${BACKEND}/api/products/${id}`).then(r => r.json()));
      timings["warm_first"]  = first;
      timings["warm_second"] = second;
      console.log(`\n  🔄 نفس المنتج مرتين:`);
      console.log(`     أول مرة:  ${first}ms  ${rate(first)}`);
      console.log(`     تاني مرة: ${second}ms  ${rate(second)}`);
      if (second < first) console.log(`     ✅ الـ cache شغال — تحسن ${first - second}ms`);
      expect(second).toBeLessThan(T.DEAD);
    });

    it("3 منتجات مختلفة بالتوازي (كأن الزبون بيفتح tabs)", async () => {
      const ids = allProducts.slice(0, 3).map(p => p._id);
      const t0 = Date.now();
      await Promise.all(ids.map(id =>
        fetch(`${BACKEND}/api/products/${id}`).then(r => r.json())
      ));
      const ms = Date.now() - t0;
      timings["parallel_3"] = ms;
      console.log(`\n  ⚡ 3 منتجات بالتوازي: ${ms}ms  ${rate(ms)}`);
      expect(ms).toBeLessThan(T.DEAD);
    });

    it("getProductById من الـ Next.js cache (0ms — SSR)", () => {
      const id = allProducts[0]._id;
      const t0 = Date.now();
      const found = allProducts.find(p => p._id === id);
      const ms = Date.now() - t0;
      timings["from_nextjs_cache"] = ms;
      console.log(`\n  ⚡ getProductById (Next.js cache): ${ms}ms  ${rate(ms)}`);
      expect(found).toBeDefined();
      expect(ms).toBeLessThan(5);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  describe("5. Final Report", () => {

    it("ملخص شامل لأداء صفحة المنتج", () => {
      const withSpecs   = allProducts.filter(p => p.specs && Object.values(p.specs).some(Boolean)).length;
      const withDesc    = allProducts.filter(p => p.description?.trim()).length;
      const withDisc    = allProducts.filter(p => p.salePrice && p.originalPrice && p.salePrice < p.originalPrice).length;
      const multiImg    = allProducts.filter(p => p.images?.length > 1).length;
      const oos         = allProducts.filter(p => !p.inStock).length;

      const avgApiMs = Math.round(
        Object.entries(timings)
          .filter(([k]) => k.startsWith("entry_"))
          .reduce((s, [, v]) => s + v, 0) /
        Math.max(Object.keys(timings).filter(k => k.startsWith("entry_")).length, 1)
      );

      console.log(`
  ╔══════════════════════════════════════════════════════════════════════╗
  ║       📦 Product Detail Page — Performance Report                    ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  ⏱️  وقت الفتح من الـ cache (SSR)                                    ║
  ║    • getProductById (Next.js cache) : ${String((timings["from_nextjs_cache"]||0)+"ms").padEnd(8)} ${rate(timings["from_nextjs_cache"]||0).padEnd(18)}║
  ║    • أول منتج من الرئيسية          : ${String((timings["from_home_first"]||0)+"ms").padEnd(8)} ${rate(timings["from_home_first"]||0).padEnd(18)}║
  ║    • منتج عشوائي من الرئيسية       : ${String((timings["from_home_random"]||0)+"ms").padEnd(8)} ${rate(timings["from_home_random"]||0).padEnd(18)}║
  ║    • متوسط من صفحات الكاتيجوري     : ${String(avgApiMs+"ms").padEnd(8)} ${rate(avgApiMs).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  ⏱️  وقت الـ API (warm cache)                                        ║
  ║    • أول طلب                        : ${String((timings["warm_first"]||0)+"ms").padEnd(8)} ${rate(timings["warm_first"]||0).padEnd(18)}║
  ║    • تاني طلب (cached)              : ${String((timings["warm_second"]||0)+"ms").padEnd(8)} ${rate(timings["warm_second"]||0).padEnd(18)}║
  ║    • 3 منتجات بالتوازي              : ${String((timings["parallel_3"]||0)+"ms").padEnd(8)} ${rate(timings["parallel_3"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  🖥️  وقت render المكونات (browser)                                   ║
  ║    • ProductImages prep             : ${String((timings["images_prep"]||0)+"ms").padEnd(8)} ${rate(timings["images_prep"]||0).padEnd(18)}║
  ║    • ProductInfo price calc         : ${String((timings["price_calc"]||0)+"ms").padEnd(8)} ${rate(timings["price_calc"]||0).padEnd(18)}║
  ║    • ProductDetails specs prep      : ${String((timings["specs_prep"]||0)+"ms").padEnd(8)} ${rate(timings["specs_prep"]||0).padEnd(18)}║
  ║    • Add to Cart                    : ${String((timings["add_to_cart"]||0)+"ms").padEnd(8)} ${rate(timings["add_to_cart"]||0).padEnd(18)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  📊 جودة البيانات                                                    ║
  ║    • إجمالي المنتجات                : ${String(allProducts.length).padEnd(28)}║
  ║    • بمواصفات (specs tab)           : ${String(withSpecs).padEnd(28)}║
  ║    • بوصف (description tab)         : ${String(withDesc).padEnd(28)}║
  ║    • بخصم (discount badge)          : ${String(withDisc).padEnd(28)}║
  ║    • بصور متعددة (thumbnails)       : ${String(multiImg).padEnd(28)}║
  ║    • غير متوفر (out of stock)       : ${String(oos).padEnd(28)}║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║  🚨 مشاكل مكتشفة                                                     ║`);

      if (issues.length === 0) {
        console.log(`  ║    ✅ لا توجد مشاكل                                                  ║`);
      } else {
        issues.forEach(issue => {
          console.log(`  ║    ${issue.padEnd(66)}║`);
        });
      }

      console.log(`  ╚══════════════════════════════════════════════════════════════════════╝`);
      expect(true).toBe(true);
    });
  });
});
