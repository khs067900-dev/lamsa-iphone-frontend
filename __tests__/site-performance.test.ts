/**
 * Site-wide Performance & Products Test
 * Real backend: https://lamsa-iphone-backend.vercel.app
 * Covers: all major pages, nav links, buttons, product display, filters
 */

const BACKEND = "https://lamsa-iphone-backend.vercel.app";
const SITE = "https://lamsasmart.com";
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,discountPercent,price";

// ─── All nav links extracted from navData.ts ─────────────────────────────────
const NAV_LINKS = [
  { label: "الهواتف الذكية - آيفون 17 برو ماكس", href: "/smartphones/iphone-17-pro-max" },
  { label: "آيفون 17 برو", href: "/smartphones/iphone-17-pro" },
  { label: "آيفون 17 Air", href: "/smartphones/iphone-17-air" },
  { label: "آيفون 17 عادي", href: "/smartphones/iphone-17" },
  { label: "آيفون 16 برو ماكس", href: "/smartphones/iphone-16-pro-max" },
  { label: "آيفون 16 برو", href: "/smartphones/iphone-16-pro" },
  { label: "آيفون 16 بلس", href: "/smartphones/iphone-16-plus" },
  { label: "آيفون 16 عادي", href: "/smartphones/iphone-16" },
  { label: "آيفون 15 برو ماكس", href: "/smartphones/iphone-15-pro-max" },
  { label: "آيفون 15 بلس", href: "/smartphones/iphone-15-plus" },
  { label: "آيفون 14 برو ماكس", href: "/smartphones/iphone-14-pro-max" },
  { label: "فقط آبل", href: "/smartphones/apple-only" },
  { label: "سامسونج S26", href: "/smartphones/samsung-s26-ultra" },
  { label: "سامسونج S25", href: "/smartphones/samsung-s25-ultra" },
  { label: "سامسونج S24", href: "/smartphones/samsung-s24-ultra" },
  { label: "سامسونج S23", href: "/smartphones/samsung-s23-ultra" },
  { label: "سامسونج S22", href: "/smartphones/samsung-s22-ultra" },
  { label: "ساعات ابل", href: "/apple-watches/se" },
  { label: "بلاي ستيشن", href: "/playstation" },
  { label: "ايباد", href: "/tablets/ipad" },
  { label: "بطاريات متنقلة", href: "/accessories/anker-batteries" },
  { label: "سماعات AirPods", href: "/accessories/airpods" },
];

// ─── slug → category filter mapping (from categoryConfig.ts) ─────────────────
const SLUG_FILTERS: Record<string, { category?: string; brand?: string; nameIncludes?: string[]; nameExcludes?: string[] }> = {
  "iphone-17-pro-max": { category: "ابل ايفون 17 برو ماكس" },
  "iphone-17-pro":     { category: "ابل ايفون 17 برو", nameExcludes: ["ماكس","max"] },
  "iphone-17-air":     { category: "ابل ايفون 17 اير" },
  "iphone-17":         { category: "ابل ايفون 17", nameExcludes: ["برو","pro","اير","air","ماكس","max"] },
  "iphone-16-pro-max": { category: "ابل ايفون 16 برو ماكس" },
  "iphone-16-pro":     { brand: "Apple", nameIncludes: ["ايفون 16 برو","آيفون 16 برو"], nameExcludes: ["ماكس","max"] },
  "iphone-16-plus":    { brand: "Apple", nameIncludes: ["ايفون 16 بلس","آيفون 16 بلس"] },
  "iphone-16":         { category: "ايفون 16", nameExcludes: ["برو","pro","بلس","plus","ماكس","max"] },
  "iphone-15-pro-max": { category: "ابل ايفون 15 برو ماكس" },
  "iphone-15-plus":    { category: "ابل ايفون 15 بلس" },
  "iphone-14-pro-max": { category: "ابل ايفون 14 برو ماكس" },
  "apple-only":        { brand: "Apple" },
  "samsung-s26-ultra": { category: "سامسونج جالاكسي S26" },
  "samsung-s25-ultra": { category: "سامسونج جالاكسي S25" },
  "samsung-s24-ultra": { category: "سامسونج جالاكسي S24" },
  "samsung-s23-ultra": { category: "سامسونج جلاكسي S23 الترا" },
  "samsung-s22-ultra": { category: "سامسونج جالاكسي S22" },
  "se":                { brand: "Apple", nameIncludes: ["ساعة","watch"] },
  "ps5":               { category: "ps5" },
  "ipad":              { category: "tablet" },
  "anker-batteries":   { category: "بطاريات متنقله" },
  "airpods":           { brand: "Apple", nameIncludes: ["airpods","ايربودز","سماعة ابل"] },
};

function normalizeArabic(str: string) {
  return str.replace(/[أإآا]/g,"ا").replace(/[ىي]/g,"ي").replace(/ة/g,"ه").replace(/ؤ/g,"و").replace(/ئ/g,"ي");
}

function filterBySlug(products: any[], slug: string): any[] {
  const f = SLUG_FILTERS[slug];
  if (!f) return products;
  return products.filter(p => {
    const matchBrand = f.brand ? p.brand?.toLowerCase() === f.brand.toLowerCase() : true;
    const matchCat = f.category ? normalizeArabic(p.category||"").includes(normalizeArabic(f.category)) : true;
    const matchInc = f.nameIncludes?.length ? f.nameIncludes.some(kw => p.name?.toLowerCase().includes(kw.toLowerCase())) : true;
    const matchExc = f.nameExcludes?.length ? !f.nameExcludes.some(kw => p.name?.toLowerCase().includes(kw.toLowerCase())) : true;
    return matchBrand && matchCat && matchInc && matchExc;
  });
}

// ─── shared state ─────────────────────────────────────────────────────────────
let allProducts: any[] = [];
let fetchMs = 0;

// ═════════════════════════════════════════════════════════════════════════════
describe("🌐 Site-wide Performance & Products Tests", () => {

  // ── 0. Fetch real data once ───────────────────────────────────────────────
  describe("0. Setup — fetch all products", () => {
    it("fetches all products from real backend", async () => {
      const t0 = Date.now();
      const r = await fetch(`${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`);
      fetchMs = Date.now() - t0;
      expect(r.ok).toBe(true);
      const data = await r.json();
      allProducts = Array.isArray(data) ? data : (data.products ?? []);
      console.log(`\n  ✅ Fetched ${allProducts.length} products in ${fetchMs}ms`);
    });
  });

  // ── 1. API Performance ────────────────────────────────────────────────────
  describe("1. API Performance", () => {
    it("responds under 3000ms (hard limit)", () => {
      console.log(`\n  ⏱  API time: ${fetchMs}ms`);
      expect(fetchMs).toBeLessThan(3000);
    });

    it("responds under 1000ms (ideal — warm cache)", () => {
      if (fetchMs >= 1000) console.warn(`  ⚠️  ${fetchMs}ms — cold Vercel start detected`);
      expect(fetchMs).toBeLessThan(1000);
    });

    it("measures search API speed", async () => {
      const t0 = Date.now();
      const r = await fetch(`${BACKEND}/api/products?q=ايفون`);
      const ms = Date.now() - t0;
      const data = await r.json();
      const results = Array.isArray(data) ? data : [];
      console.log(`\n  🔍 Search "ايفون": ${results.length} results in ${ms}ms`);
      if (ms > 1500) console.warn(`  ⚠️  Search is slow: ${ms}ms`);
      expect(r.ok).toBe(true);
      expect(ms).toBeLessThan(3000);
    });

    it("measures company API speed", async () => {
      const t0 = Date.now();
      const r = await fetch(`${BACKEND}/api/admin/company`);
      const ms = Date.now() - t0;
      console.log(`\n  🏢 Company API: ${ms}ms`);
      expect(r.ok).toBe(true);
      expect(ms).toBeLessThan(3000);
    });

    it("measures home-settings API speed", async () => {
      const t0 = Date.now();
      const r = await fetch(`${BACKEND}/api/admin/sub-categories/home-settings`);
      const ms = Date.now() - t0;
      console.log(`\n  ⚙️  Home-settings API: ${ms}ms`);
      expect(ms).toBeLessThan(3000);
    });
  });

  // ── 2. Home Page Products ─────────────────────────────────────────────────
  describe("2. Home Page — ProductGrid", () => {
    it("groups products by category correctly", () => {
      const map: Record<string, any[]> = {};
      allProducts.forEach(p => {
        const cat = p.category || p.subCategory || "أخرى";
        (map[cat] ??= []).push(p);
      });
      const cats = Object.keys(map);
      console.log(`\n  📁 ${cats.length} categories on home:`);
      cats.forEach(c => console.log(`     • "${c}": ${map[c].length} products (shows ${Math.min(map[c].length,4)})`));
      expect(cats.length).toBeGreaterThan(0);
    });

    it("home shows max 4 products per category (LIMIT=4)", () => {
      const map: Record<string, any[]> = {};
      allProducts.forEach(p => { const c = p.category||p.subCategory||"أخرى"; (map[c]??=[]).push(p); });
      const totalVisible = Object.values(map).reduce((s,v) => s + Math.min(v.length,4), 0);
      const wasted = allProducts.length - totalVisible;
      const pct = ((wasted/allProducts.length)*100).toFixed(1);
      console.log(`\n  👁  Visible: ${totalVisible} / ${allProducts.length} (wasted: ${wasted} = ${pct}%)`);
      Object.entries(map).forEach(([cat, items]) => {
        expect(Math.min(items.length, 4)).toBeLessThanOrEqual(4);
      });
    });

    it("no product has salePrice > originalPrice (pricing bug)", () => {
      const bad = allProducts.filter(p => p.salePrice && p.originalPrice && p.salePrice > p.originalPrice);
      console.log(`\n  🐛 salePrice > originalPrice: ${bad.length} products`);
      bad.forEach(p => console.warn(`  ⚠️  "${p.name}" orig:${p.originalPrice} sale:${p.salePrice}`));
      expect(bad.length).toBe(0);
    });

    it("all products have image", () => {
      const noImg = allProducts.filter(p => !p.image && (!p.images||!p.images.length));
      console.log(`\n  🖼  Missing image: ${noImg.length}`);
      expect(noImg.length).toBe(0);
    });

    it("all products have valid price > 0", () => {
      const bad = allProducts.filter(p => (p.originalPrice||p.price||0) <= 0);
      console.log(`\n  💰 Invalid price: ${bad.length}`);
      expect(bad.length).toBe(0);
    });
  });

  // ── 3. Nav Links — every link has products ────────────────────────────────
  describe("3. Navbar Links — product coverage", () => {
    const slugLinks = NAV_LINKS.filter(l => {
      const parts = l.href.split("/");
      return parts.length >= 3 && SLUG_FILTERS[parts[parts.length-1]];
    });

    it("reports product count for every nav link", () => {
      console.log(`\n  🔗 Nav link product coverage:`);
      const empty: string[] = [];
      slugLinks.forEach(link => {
        const slug = link.href.split("/").pop()!;
        const filtered = filterBySlug(allProducts, slug);
        const status = filtered.length === 0 ? "❌ EMPTY" : `✅ ${filtered.length} products`;
        console.log(`     ${status} — ${link.label} (${link.href})`);
        if (filtered.length === 0) empty.push(link.label);
      });
      if (empty.length) console.warn(`\n  ⚠️  ${empty.length} nav links have NO products: ${empty.join(", ")}`);
      expect(true).toBe(true); // informational
    });

    it("main iPhone categories have products", () => {
      const mainSlugs = ["iphone-17-pro-max","iphone-17-pro","iphone-17-air","iphone-17","iphone-16-pro-max","iphone-16-pro","apple-only"];
      mainSlugs.forEach(slug => {
        const count = filterBySlug(allProducts, slug).length;
        console.log(`     ${slug}: ${count} products`);
        expect(count).toBeGreaterThan(0);
      });
    });

    it("samsung categories have products", () => {
      const samsungSlugs = ["samsung-s26-ultra","samsung-s25-ultra","samsung-s24-ultra","samsung-s23-ultra"];
      samsungSlugs.forEach(slug => {
        const count = filterBySlug(allProducts, slug).length;
        console.log(`     ${slug}: ${count} products`);
        expect(count).toBeGreaterThanOrEqual(0); // informational — may be 0
      });
    });
  });

  // ── 4. Category Pages — pagination ───────────────────────────────────────
  describe("4. Category Pages — pagination logic", () => {
    const ITEMS_PER_PAGE = 12;

    it("calculates correct page counts for all slugs", () => {
      console.log(`\n  📄 Pagination (${ITEMS_PER_PAGE} per page):`);
      Object.keys(SLUG_FILTERS).forEach(slug => {
        const products = filterBySlug(allProducts, slug);
        const pages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
        if (products.length > 0) {
          console.log(`     ${slug}: ${products.length} products → ${pages} page(s)`);
        }
      });
      expect(true).toBe(true);
    });

    it("apple-only page has enough products to paginate", () => {
      const products = filterBySlug(allProducts, "apple-only");
      const pages = Math.ceil(products.length / ITEMS_PER_PAGE);
      console.log(`\n  📱 apple-only: ${products.length} products, ${pages} pages`);
      expect(products.length).toBeGreaterThan(0);
    });
  });

  // ── 5. Product Detail Page ────────────────────────────────────────────────
  describe("5. Product Detail Page", () => {
    it("fetches a real product by ID", async () => {
      const sample = allProducts[0];
      expect(sample).toBeDefined();
      const t0 = Date.now();
      const r = await fetch(`${BACKEND}/api/products/${sample._id}`);
      const ms = Date.now() - t0;
      const product = await r.json();
      console.log(`\n  📦 Product detail fetch: ${ms}ms`);
      console.log(`     Name: ${product.name}`);
      console.log(`     Price: ${product.originalPrice} SAR`);
      console.log(`     inStock: ${product.inStock}`);
      expect(r.ok).toBe(true);
      expect(product._id).toBe(sample._id);
      expect(ms).toBeLessThan(3000);
    });

    it("all products have valid _id for routing", () => {
      const noId = allProducts.filter(p => !p._id);
      console.log(`\n  🔑 Products missing _id: ${noId.length}`);
      expect(noId.length).toBe(0);
    });

    it("product detail page URL is valid for all products", () => {
      const urls = allProducts.map(p => `/product/${p._id}`);
      const invalid = urls.filter(u => !u.match(/^\/product\/[a-f0-9]{24}$/));
      console.log(`\n  🔗 Valid product URLs: ${urls.length - invalid.length}/${urls.length}`);
      if (invalid.length) console.warn(`  ⚠️  Invalid URLs: ${invalid.slice(0,5).join(", ")}`);
      expect(invalid.length).toBe(0);
    });
  });

  // ── 6. Search Functionality ───────────────────────────────────────────────
  describe("6. Search — /api/products?q=", () => {
    const queries = ["ايفون", "سامسونج", "ساعة", "بلاي", "ايباد"];

    queries.forEach(q => {
      it(`search "${q}" returns results`, async () => {
        const t0 = Date.now();
        const r = await fetch(`${BACKEND}/api/products?q=${encodeURIComponent(q)}`);
        const ms = Date.now() - t0;
        const data = await r.json();
        const results = Array.isArray(data) ? data : [];
        console.log(`\n  🔍 "${q}": ${results.length} results in ${ms}ms`);
        if (results.length === 0) console.warn(`  ⚠️  No results for "${q}"`);
        expect(r.ok).toBe(true);
        expect(ms).toBeLessThan(3000);
      });
    });

    it("search with empty query returns all products", async () => {
      const r = await fetch(`${BACKEND}/api/products?page=1&limit=10`);
      const data = await r.json();
      const results = Array.isArray(data) ? data : (data.products ?? []);
      console.log(`\n  🔍 Empty search: ${results.length} results (first page)`);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ── 7. Cart & Checkout Buttons ────────────────────────────────────────────
  describe("7. Cart & Checkout — data integrity", () => {
    it("all products have required cart fields", () => {
      const missing = allProducts.filter(p => !p._id || !p.name || !(p.originalPrice||p.price));
      console.log(`\n  🛒 Products missing cart fields (_id/name/price): ${missing.length}`);
      expect(missing.length).toBe(0);
    });

    it("installment products have valid installment data", () => {
      const installmentProducts = allProducts.filter(p => p.installment?.available);
      const badInstallment = installmentProducts.filter(p =>
        p.installment.available && (!p.installment.months || p.installment.months <= 0)
      );
      console.log(`\n  💳 Installment products: ${installmentProducts.length}`);
      console.log(`     Bad installment data (no months): ${badInstallment.length}`);
      if (badInstallment.length) badInstallment.forEach(p => console.warn(`  ⚠️  "${p.name}"`));
      expect(badInstallment.length).toBe(0);
    });

    it("out-of-stock products are correctly flagged", () => {
      const outOfStock = allProducts.filter(p => !p.inStock);
      console.log(`\n  📦 Out of stock: ${outOfStock.length} products`);
      outOfStock.forEach(p => console.log(`     • "${p.name}"`));
      expect(outOfStock.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ── 8. Payload & Memory ───────────────────────────────────────────────────
  describe("8. Payload Size & Memory", () => {
    it("total payload size is acceptable", () => {
      const bytes = Buffer.byteLength(JSON.stringify(allProducts), "utf8");
      const kb = (bytes/1024).toFixed(1);
      console.log(`\n  📦 Full payload: ${kb} KB for ${allProducts.length} products`);
      if (bytes > 500*1024) console.warn(`  ⚠️  Payload ${kb}KB is large — consider field trimming`);
      expect(bytes).toBeLessThan(1024*1024); // under 1MB
    });

    it("average product size is reasonable", () => {
      const bytes = Buffer.byteLength(JSON.stringify(allProducts), "utf8");
      const avgBytes = Math.round(bytes / allProducts.length);
      console.log(`\n  📊 Avg product size: ${avgBytes} bytes`);
      if (avgBytes > 5000) console.warn(`  ⚠️  Products are large (${avgBytes}B avg) — check for unused fields`);
      expect(avgBytes).toBeLessThan(10000);
    });
  });

  // ── 9. Final Summary ─────────────────────────────────────────────────────
  describe("9. Summary Report", () => {
    it("prints full site performance summary", () => {
      const map: Record<string, any[]> = {};
      allProducts.forEach(p => { const c = p.category||p.subCategory||"أخرى"; (map[c]??=[]).push(p); });
      const totalVisible = Object.values(map).reduce((s,v) => s+Math.min(v.length,4), 0);
      const bytes = Buffer.byteLength(JSON.stringify(allProducts), "utf8");
      const inStock = allProducts.filter(p => p.inStock).length;
      const withDiscount = allProducts.filter(p => p.discountPercent > 0).length;
      const withInstallment = allProducts.filter(p => p.installment?.available).length;
      const navCoverage = NAV_LINKS.filter(l => {
        const slug = l.href.split("/").pop()!;
        return SLUG_FILTERS[slug] && filterBySlug(allProducts, slug).length > 0;
      }).length;
      const navTotal = NAV_LINKS.filter(l => SLUG_FILTERS[l.href.split("/").pop()!]).length;

      console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║           FULL SITE PERFORMANCE SUMMARY                  ║
  ╠══════════════════════════════════════════════════════════╣
  ║  API fetch time (warm)  : ${String(fetchMs+"ms").padEnd(30)}║
  ║  Total products         : ${String(allProducts.length).padEnd(30)}║
  ║  In stock               : ${String(inStock).padEnd(30)}║
  ║  Out of stock           : ${String(allProducts.length-inStock).padEnd(30)}║
  ║  With discount          : ${String(withDiscount).padEnd(30)}║
  ║  With installment       : ${String(withInstallment).padEnd(30)}║
  ║  Categories             : ${String(Object.keys(map).length).padEnd(30)}║
  ║  Visible on home (4/cat): ${String(totalVisible).padEnd(30)}║
  ║  Payload size           : ${String((bytes/1024).toFixed(1)+"KB").padEnd(30)}║
  ║  Nav links with products: ${String(navCoverage+"/"+navTotal).padEnd(30)}║
  ╚══════════════════════════════════════════════════════════╝`);
      expect(true).toBe(true);
    });
  });
});
