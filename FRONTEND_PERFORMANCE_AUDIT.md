# FRONTEND PERFORMANCE AUDIT — LAMSA SMART STORE
**Date:** 2026-09-21 | **Framework:** Next.js 15 / React 19 / Zustand 5 / Tailwind 4  
**Method:** Static code analysis — READ ONLY, nothing modified  

---

## EXECUTIVE SUMMARY

The frontend architecture is fundamentally sound for a Next.js ISR application. Public pages use `force-static` with 120–3600 s revalidation, `unstable_cache` deduplicates server fetches, the cart is 100% client-side (zero backend calls), and admin pages use proper server-driven pagination with debounce. However there are **7 high-severity issues** that generate unnecessary backend load, serverless CPU, and client overhead.

**Top risks in order of severity:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | `favicon.svg` is **1 MB** — served to every visitor |
| 2 | CRITICAL | Admin Navbar fires **2 uncached API calls** on every admin page mount |
| 3 | HIGH | Admin print pages each fetch `/api/admin/company` independently (3–4 duplicate serverless calls per print) |
| 4 | HIGH | Google Maps `/api/places` proxy uses `cache: "no-store"` — zero caching on place-details |
| 5 | HIGH | `money-icon.webp` (63.6 KB) used via raw `<img>` in 10+ components — bypasses optimization |
| 6 | HIGH | Category pages load **100 products into client memory** then slice client-side |
| 7 | MEDIUM | `ShopByDevice` runs `setInterval` at **1 second** on the homepage — continuous CPU |

---

## PHASE 1 — ARCHITECTURE MAP

### Route Map

```
app/
├── layout.tsx                   Server Component — getCompany() x2 (metadata + render)
├── page.tsx                     Server Component — force-static, revalidate=120
│                                Fetches: getCompany, getAllProductsWithBanners, getHomeConfig (3 parallel)
├── (categories)/
│   ├── [slug]/page.tsx          Server Component — revalidate via ISR, getProductsByCategory
│   ├── smartphones/*/page.tsx   ~22 static category pages (each is a Server Component)
│   ├── apple-watches/
│   ├── audio/ tablets/ etc.
├── product/[id]/page.tsx        Server Component — revalidate=120, getProductById
├── cart/page.tsx                Client Component — 100% Zustand/localStorage
├── checkout/page.tsx            Client Component — /api/notify POST on submit
├── checkout/verify/page.tsx     Client Component — /api/verify POST per OTP attempt
├── search/page.tsx              Suspense wrapper → SearchClient (Client)
├── admin/
│   ├── layout.tsx               Client Component (usePathname)
│   ├── components/AdminNavbar   Client — fetches /api/company + /api/admin/orders on mount
│   ├── products/page.tsx        Client — paginated, debounced search
│   ├── orders/page.tsx          Client — paginated, debounced search
│   ├── orders/[id]/page.tsx     Client — fetch on mount
│   ├── orders/[id]/print/       Client — fetch order + company on mount
│   ├── orders/[id]/invoice/     Client — fetch order + company on mount
│   ├── orders/[id]/receipt/     Client — fetch order on mount
│   ├── orders/[id]/contract/    Client — fetch order on mount
│   ├── orders/[id]/cancellation/Client — fetch order + company + products on mount
│   ├── dashboard/page.tsx       Server Component (static placeholder)
│   └── ...
├── api/
│   ├── products/route.ts        Proxy → getAllProducts() (unstable_cache), search filter in memory
│   ├── company/route.ts         Proxy → backend /api/admin/company, revalidate=3600
│   ├── places/route.ts          Google Maps proxy — cache: "no-store"
│   ├── notify/route.ts          Checkout POST — persists order + fires Telegram
│   ├── verify/route.ts          OTP verification proxy
│   ├── revalidate/route.ts      ISR tag invalidation endpoint
│   └── admin/*                  ~30 admin proxy routes
```

### State Management
- **Zustand** (`cartStore`, `companyStore`) — no React Query, no SWR
- **Cart**: fully client-side via `persist` middleware → localStorage
- **Company (admin)**: Zustand store with `fetchCompany()` — fetches `/api/company` client-side

### Font Loading
- **Cairo** via `next/font/google` — subsets `arabic + latin`, weights `400, 700, 800` — correct, no render blocking

### Third-Party Scripts
- `@vercel/analytics/next` — loaded via `<Analytics />` in root layout (non-blocking)
- `@fingerprintjs/fingerprintjs` — dynamically imported in `useFingerprint.ts`
- Google Maps SDK — loaded lazily inside `AddressMap.tsx` only when checkout map is rendered
- Saudi Business seal (`sbc-verify-seal`) — inline script in Footer via `data-token` attribute (no explicit `async/defer` — potential render block)

---

## PHASE 2 — BACKEND REQUEST INVENTORY

All endpoints called by the frontend:

| Frontend File | Page | Endpoint | Method | Trigger | Location | Cache | Notes |
|---|---|---|---|---|---|---|---|
| `lib/config.ts` | All public pages | `BACKEND/api/admin/company` | GET | Build/ISR miss | Server | `unstable_cache` indefinite + tag:company | Called inside `generateMetadata` AND `RootLayout` — both hit same cache key |
| `lib/productsCache.ts` | Homepage | `BACKEND/api/products` | GET | Build/ISR miss | Server | `unstable_cache` revalidate=120 | limit=100, all products |
| `lib/productsCache.ts` | Homepage | `BACKEND/api/admin/category-banners-bulk` | GET | Build/ISR miss | Server | `unstable_cache` revalidate=120 | Batched banner fetch |
| `page.tsx` | Homepage | `BACKEND/api/admin/sub-categories/home-settings` | GET | Build/ISR miss | Server | revalidate=300 | |
| `page.tsx` | Homepage | `BACKEND/api/admin/sub-categories/max` | GET | Build/ISR miss | Server | revalidate=300 | |
| `lib/productsCache.ts` | Category pages | `BACKEND/api/products/by-category` | GET | Build/ISR miss | Server | `unstable_cache` revalidate=120 | Per slug, server-filtered |
| `lib/productsCache.ts` | Product page | `BACKEND/api/products/[id]` | GET | Build/ISR miss | Server | `unstable_cache` revalidate=120 per product | |
| `CustomerReviews.tsx` | Homepage | `BACKEND/api/admin/reviews` | GET | Build/ISR miss | Server | `unstable_cache` revalidate=3600 | |
| `store/companyStore.ts` | Every admin page | `/api/company` | GET | AdminNavbar mount | Client | None (Zustand, no TTL) | DUPLICATE of SSR company |
| `admin/components/AdminNavbar.tsx` | Every admin page | `/api/admin/orders?page=1&limit=1` | GET | Mount | Client | None | Fetches total count only |
| `Navbar.tsx` | All public pages | `/api/products?q=…` | GET | Search input (300ms debounce) | Client | CDN: s-maxage=60 | AbortController used |
| `search/SearchClient.tsx` | /search | `/api/products?q=…` | GET | URL param change | Client | CDN: s-maxage=60 | Deduped via lastQ ref |
| `components/address/AddressSearch.tsx` | /checkout | `/api/places?type=autocomplete` | GET | 400ms debounce on input | Client | **no-store** | New invocation per selection |
| `components/address/AddressSearch.tsx` | /checkout | `/api/places?type=details` | GET | Address selection | Client | **no-store** | |
| `checkout/page.tsx` | /checkout | `/api/notify` | POST | Form submit (COD) | Client | N/A | |
| `checkout/page.tsx` | /checkout | `/api/notify` | POST | Card submit | Client | N/A | |
| `checkout/verify/page.tsx` | /checkout/verify | `/api/verify` | POST | OTP submit | Client | N/A | Up to 6 attempts |
| `checkout/verify/page.tsx` | /checkout/verify | `/api/resend` | POST | Resend button | Client | N/A | |
| `admin/orders/page.tsx` | /admin/orders | `/api/admin/orders` | GET | Mount + search + pagination | Client | None | Debounced 400ms |
| `admin/orders/[id]/page.tsx` | /admin/orders/[id] | `/api/admin/orders/[id]` | GET | Mount | Client | None | |
| `admin/orders/[id]/page.tsx` | /admin/orders/[id] | `/api/admin/orders/[id]` | PUT | Save financials | Client | N/A | |
| `admin/orders/[id]/page.tsx` | /admin/orders/[id] | `/api/admin/orders/[id]` | PUT | Status change | Client | N/A | |
| `admin/orders/[id]/print/page.tsx` | /admin/orders/[id]/print | `/api/admin/orders/[id]` | GET | Mount | Client | None | |
| `admin/orders/[id]/print/page.tsx` | /admin/orders/[id]/print | `/api/admin/company` | GET | Mount | Client | None | DUPLICATE |
| `admin/orders/[id]/invoice/page.tsx` | /admin/orders/[id]/invoice | `/api/admin/orders/[id]` | GET | Mount | Client | None | |
| `admin/orders/[id]/invoice/page.tsx` | /admin/orders/[id]/invoice | `/api/admin/company` | GET | Mount | Client | None | DUPLICATE |
| `admin/orders/[id]/cancellation/page.tsx` | cancellation | `/api/admin/orders/[id]` | GET | Mount | Client | None | |
| `admin/orders/[id]/cancellation/page.tsx` | cancellation | `/api/admin/company` | GET | Mount | Client | None | DUPLICATE |
| `admin/orders/[id]/cancellation/page.tsx` | cancellation | `/api/admin/products/[pid]` | GET | Per item | Client | None | N fetches for N items |
| `admin/orders/[id]/contract/page.tsx` | contract | `/api/admin/orders/[id]/invoice` | GET | Mount | Client | None | |
| `admin/orders/[id]/receipt/page.tsx` | receipt | `/api/admin/orders/[id]/invoice` | GET | Mount | Client | None | |
| `admin/orders/ReceiptVoucher.tsx` | receipt | `/api/admin/orders/[id]/invoice` | GET | Render | Client | None | May duplicate receipt page |
| `admin/products/page.tsx` | /admin/products | `/api/admin/products` | GET | Mount + filter + search | Client | None | Debounced 400ms |
| `admin/products/page.tsx` | /admin/products | `/api/admin/sub-categories` | GET | Mount (once) | Client | None | |
| `admin/products/page.tsx` | /admin/products | `/api/admin/products/[id]` | DELETE | Delete action | Client | N/A | |
| `admin/orders/[id]/PrintPage.tsx` | print | `/api/admin/company` | GET | Mount | Client | None | DUPLICATE |
| `admin/company/hooks/useCompany.ts` | /admin/company | `/api/admin/company` | GET/PUT | Mount + save | Client | None | |
| `admin/users/page.tsx` | /admin/users | `/api/admin/users` | GET | Mount | Client | None | 2x (init + effect) |
| `api/products/route.ts` | (proxy) | `getAllProducts()` via cache | GET | Any search | Server | unstable_cache=120s | Loads ALL 100 products |
| `api/places/route.ts` | (proxy) | `maps.googleapis.com/autocomplete` | GET | Debounced input | Server | **no-store** | |
| `api/places/route.ts` | (proxy) | `maps.googleapis.com/place/details` | GET | Address pick | Server | **no-store** | |
| `api/notify/route.ts` | (proxy) | `BACKEND/api/checkout` | POST | Checkout submit | Server | N/A | Also fires Telegram async |
| `api/notify/route.ts` | (proxy) | `ip-api.com/json/[ip]` | GET | Every checkout | Server | None | External geo call |

---

## PHASE 3 — DUPLICATE REQUEST ANALYSIS

### DUP-1: `getCompany()` called twice in root layout (MEDIUM)

**Files:** `app/layout.tsx`  
**Pattern:** `generateMetadata()` calls `getCompany()`, then `RootLayout` also calls `getCompany()`.  
Both calls go through `unstable_cache` with the same key `["company"]`, so they hit the same cache entry and do NOT cause two backend requests after the first ISR build. However, during an ISR miss or cold start they create **2 parallel cache lookups** before the deduplication layer settles.

```
Current:  generateMetadata → getCompany() + RootLayout → getCompany() = 2 unstable_cache calls
Ideal:    1 shared awaited result passed down
```

**Reduction potential:** Low for backend (cache deduplicates), but avoids redundant promise overhead.

---

### DUP-2: AdminNavbar fetches company on every admin page (HIGH)

**Files:** `app/admin/components/AdminNavbar.tsx`, `app/store/companyStore.ts`  
**Pattern:**  
```tsx
useEffect(() => { fetchCompany(); }, [fetchCompany]);
// fetchCompany → GET /api/company → GET BACKEND/api/admin/company
```
This fires on **every admin page navigation** (AdminNavbar remounts on layout changes). The company data is already available server-side and doesn't need a client fetch.

```
Current:  GET /api/company — every admin page mount (no TTL in Zustand)
Ideal:    Pass company data as a prop from the server layout, 0 client fetches
Reduction: ~100% of admin company requests eliminated
```

---

### DUP-3: Admin print pages independently fetch `/api/admin/company` (HIGH)

**Files:**  
- `admin/orders/[id]/print/page.tsx` — line 23  
- `admin/orders/[id]/invoice/page.tsx` — line 61  
- `admin/orders/[id]/cancellation/page.tsx` — line 59  
- `admin/orders/[id]/PrintPage.tsx` — line 22  

**Pattern:** Each page opens in a new tab and independently `fetch("/api/admin/company")` on mount. Opening print + invoice + receipt for one order = **4 separate `/api/admin/company` serverless invocations**.

```
Current:  4 × GET /api/admin/company per order print session
Ideal:    1 request, shared or embedded in the order response
Reduction: 75%
```

---

### DUP-4: `/api/admin/users` fetched twice on mount (MEDIUM)

**File:** `app/admin/users/page.tsx` lines 60 and 65  
**Pattern:** Two separate `fetch(ADMIN_USERS_URL)` calls — one inside a save function and one as a re-fetch effect — both fire on mount.

```
Current:  2 × GET /api/admin/users on page mount
Ideal:    1 request
Reduction: 50%
```

---

### DUP-5: Navbar search and `/search` page both call `/api/products?q=` (LOW)

When a user searches in the Navbar and then clicks through to `/search?q=`, the SearchClient fires another `GET /api/products?q=…`. The result from the Navbar search is discarded. Since the route handler caches with `s-maxage=60`, the second request may be served from CDN. No backend pressure, but the route handler still executes.

```
Current:  2 requests for same query (navbar + search page)
Ideal:    1 request, pass navbar results to search page or share via URL
```

---

## PHASE 4 — BACKEND LOAD ANALYSIS

### BL-1: `/api/products` route handler loads ALL 100 products for every search (HIGH)

**File:** `app/api/products/route.ts`  
```ts
const products = await getAllProducts();  // loads all 100 products from cache
const result = q ? products.filter(…) : products;
```
The `getAllProducts()` cache serves up to 100 products. Filtering is done **in the Next.js serverless function** (not the backend). For every search request that misses the CDN cache, the serverless function must:
1. Deserialize 100 product objects from the cache
2. Run `.filter()` over all of them
3. Serialize the result to JSON

This adds CPU per invocation and means the cache payload is always 100 products regardless of how many match.

**Backend impact:** Medium — backend only called on cache miss (every 120s), but the Next.js function does unnecessary work on every request.

---

### BL-2: `cache: "no-store"` on Google Maps place details proxy (HIGH)

**File:** `app/api/places/route.ts` line 23  
```ts
const res = await fetch(url, { cache: "no-store" });
```
Every time a user selects a place suggestion during checkout:
- The Next.js function invokes the Google Maps Places Details API with no cache
- Google charges per call
- The same place_id selected twice creates 2 identical API calls

**Backend impact:** Serverless invocation per selection. Google Maps API cost risk.

---

### BL-3: Cancellation page fetches individual products per order item (MEDIUM)

**File:** `app/admin/orders/[id]/cancellation/page.tsx` line 72  
```ts
const p = await fetch(`/api/admin/products/${pid}`).then(r => r.json());
```
This runs inside a `for` loop over `order.items`. An order with 3 items fires **3 serial product fetch calls** on page mount.

**Backend impact:** N serverless invocations where N = number of items in order.

---

### BL-4: AdminNavbar fetches orders count on every admin page load (MEDIUM)

**File:** `app/admin/components/AdminNavbar.tsx` line 18  
```ts
fetch("/api/admin/orders?page=1&limit=1")
```
This is a proxy call → backend → MongoDB. It fires every time any admin page loads (AdminNavbar is in the shared layout). No caching.

```
10 admin page visits = 10 backend MongoDB queries just for the count badge
```

---

### BL-5: `getAllProductsWithBanners` has a fallback that bypasses cache (MEDIUM)

**File:** `app/lib/productsCache.ts`  
```ts
export async function getAllProductsWithBanners() {
  const result = await cachedFetch();
  if (!result.products.length) {
    return fetchProductsWithBanners(); // bypasses cache!
  }
  return result;
}
```
If the cache returns an empty array (e.g., backend was down at build time), **every homepage request bypasses the cache** and hits the backend directly. Under load this could flood the backend.

---

## PHASE 5 — CPU CONSUMPTION ANALYSIS

### Server-Side CPU

| Issue | File | Severity | Reason |
|---|---|---|---|
| In-memory search filter over 100 products | `api/products/route.ts` | MEDIUM | Deserializes + filters full product list on every search cache miss |
| Google Maps proxy with no-store | `api/places/route.ts` | MEDIUM | Cold path: full function init + upstream HTTP call per request |
| Telegram notification + geo-IP lookup | `api/notify/route.ts` | LOW | Async fire-and-forget — does not block response but consumes function memory |
| Serial product fetches in cancellation | `admin/orders/[id]/cancellation/page.tsx` | MEDIUM | N upstream calls per mount |
| `getAllProductsWithBanners` cache bypass | `lib/productsCache.ts` | HIGH (on failure) | Full backend hit on every request when empty |

### Client-Side CPU

| Issue | File | Severity | Reason |
|---|---|---|---|
| `setInterval` 1000ms on homepage | `components/ShopByDevice.tsx` | MEDIUM | Countdown timer runs every second while page is visible, forces re-render every second |
| `setInterval` in multiple banner components | `Banner.tsx`, `BannerSlider.tsx`, `CategoryBanner.tsx`, `IPhone18Hero.tsx` | LOW | 5–6 second intervals, minimal impact |
| Client-side pagination over 100 products | `CategoryPageClient.tsx` | MEDIUM | Full 100-product array kept in memory; `.slice()` on every page change |
| `useMemo` on `grouped` + `orderedCategories` in ProductGrid | `components/products/ProductGrid.tsx` | LOW | Correct usage; only fires when `initialProducts` changes |
| Inline `<style>` blocks with CSS animations in every render | `CategoryPageClient.tsx`, `Banner.tsx` | LOW | `<style>` injection in JSX re-runs on every render; minor |
| All pagination page buttons rendered | `admin/orders/page.tsx` | LOW | `Array.from({length: totalPages})` — could render 50–100 buttons in DOM |

**CPU impact note:** All figures are INFERRED from architecture. Production profiling required for exact measurements.

---

## PHASE 6 — SERVERLESS / VERCEL FUNCTION ANALYSIS

Pages and routes that invoke Vercel serverless functions on every request:

| Route | Reason | Frequency | CPU Risk | Could be static/cached? |
|---|---|---|---|---|
| `GET /api/products` | No `force-static`, loads from `unstable_cache` | Every search | Low (cache hit path) | Yes — CDN s-maxage=60 already set |
| `GET /api/company` | Proxy with revalidate=3600 | Every admin page load (client) | Low | Yes — already cached, but client bypasses it |
| `GET /api/places?type=autocomplete` | No caching | Every debounced keystroke in checkout | Medium | Yes — could cache by input string |
| `GET /api/places?type=details` | `cache: "no-store"` | Every address selection | Medium | Yes — place_id is deterministic |
| `POST /api/notify` | Always dynamic | Every checkout submit | High (geo IP + Telegram) | No |
| `POST /api/verify` | Always dynamic | Up to 6× per checkout | Low | No |
| `GET /api/admin/*` | `force-dynamic` (correct) | Every admin action | Low–Medium | No (admin must be dynamic) |
| `GET /api/sub-categories-home` | `force-dynamic` | If called | Medium | Yes — data changes rarely |
| `GET /api/admin/sub-categories/public` | `cache: "no-store"` | Every call | Low | Yes |

### Cold Start Risk

The `api/notify/route.ts` imports nothing heavy at the top level. However it runs:
- A geo-IP HTTP call to `ip-api.com`
- Multiple Telegram API calls in parallel

These are async fire-and-forget, so they don't affect TTFB. But they keep the function alive longer and consume memory.

`@fingerprintjs/fingerprintjs` is **dynamically imported** (`import("@fingerprintjs/fingerprintjs")`) — correct, avoids bundle size increase.

---

## PHASE 7 — SSR / SSG / ISR / CSR CLASSIFICATION

| Page | Rendering Mode | Why | Server Work Per Visit | Notes |
|---|---|---|---|---|
| `/` (homepage) | ISR (force-static, revalidate=120) | `export const dynamic = 'force-static'` | None after build | Correct |
| `/product/[id]` | ISR (revalidate=120) | `getProductById` with `unstable_cache` | None after cache warm | Correct |
| `/(categories)/[slug]` | ISR (revalidate=120 via `getProductsByCategory`) | `unstable_cache` | None after cache warm | Correct |
| `/cart` | CSR | No server data needed | None | Correct |
| `/checkout` | CSR | Cart data from localStorage | None | Correct |
| `/checkout/verify` | CSR | sessionStorage only | None | Correct |
| `/search` | CSR (Suspense boundary) | Dynamic query param | None | Acceptable |
| `/admin/*` | CSR (client layout) | Auth-gated, always `"use client"` | None (proxy routes handle backend) | Acceptable |
| `/admin/products/page.tsx` | CSR | `"use client"` on whole page | None | Could split — table client, shell server |
| `/admin/orders/page.tsx` | CSR | `"use client"` on whole page | None | Same |
| `/about`, `/privacy`, `/return-policy` | CSR (Client Components) | Marked `"use client"` for animations | None | Could be server components with CSS animations |
| `/payment`, `/payment-method` | CSR | `"use client"` | None | Likely avoidable |
| `app/layout.tsx` | ISR (force-static, revalidate=3600) | `getCompany()` for metadata | None after cache warm | Correct |

**Finding:** No pages are incorrectly using `force-dynamic` for public content. The ISR strategy is properly applied throughout.

---

## PHASE 8 — REACT RE-RENDER AUDIT

### HIGH RISK COMPONENTS

**1. `ShopByDevice.tsx` — 1-second setInterval re-render**  
File: `app/components/ShopByDevice.tsx`  
Every second: `setInterval(calc, 1000)` → `setState` → re-render of the entire ShopByDevice subtree including all product cards.

**2. `ClientLayout.tsx` — `usePathname()` triggers re-render on every navigation**  
File: `app/components/ClientLayout.tsx`  
`usePathname()` causes the entire layout (Navbar + Footer + WhatsappButton) to re-evaluate on every route change. The Navbar is a complex component. Mitigation: Navbar, Footer, WhatsappButton are conditionally rendered but the parent still re-renders.

**3. `ProductCard.tsx` — Inline function props**  
`handleAddToCart` uses `useCallback` correctly. However `normalizeProductForCard(product)` is called directly in render without `useMemo` — runs on every re-render.

**4. `admin/orders/page.tsx` — `Array.from({length: totalPages})` in render**  
Renders all pagination buttons inline. With 50 pages of orders this creates 50 DOM nodes. On mobile the buttons are hidden via CSS but still exist in the DOM.

**5. `Navbar.tsx` — 5 useEffect hooks**  
The Navbar has 5 `useEffect` hooks. Each adds event listeners (`resize`, `mousedown`) or state updates. The component is sticky and never unmounts — these listeners persist for the full session.

---

## PHASE 9 — useEffect AUDIT

| File | Purpose | Dependencies | Risk | Impact |
|---|---|---|---|---|
| `Navbar.tsx:26` | Focus search input | `[searchOpen]` | Required | Low |
| `Navbar.tsx:31` | Close search on outside click | `[]` | Required | Low |
| `Navbar.tsx:58` | Debounced search fetch | `[searchQuery, fetchResults]` | Required, well-implemented (AbortController) | Low |
| `Navbar.tsx:68` | Close mobile on resize | `[]` | Required | Low |
| `Navbar.tsx:75` | Prevent body scroll | `[mobileOpen]` | Required | Low |
| `AdminNavbar.tsx:13` | `fetchCompany()` | `[fetchCompany]` | **DUPLICATE — company already available server-side** | HIGH |
| `AdminNavbar.tsx:15` | Fetch orders count | `[]` | Fires once per mount — uncached | MEDIUM |
| `admin/orders/[id]/page.tsx:18` | Fetch order on mount | `[id]` | Required | Low |
| `checkout/page.tsx:47` | Restore from localStorage | `[]` | Required | Low |
| `checkout/page.tsx:61` | Set mounted | `[]` | Pattern: hydration guard | Low |
| `checkout/verify/page.tsx:31` | Read sessionStorage | `[router]` | Required | Low |
| `checkout/verify/page.tsx:36` | Countdown timer (setTimeout) | `[timer]` | Recursive timeout — correct pattern | Low |
| `checkout/verify/page.tsx:44` | Cooldown timer | `[cooldown]` | Recursive timeout — correct pattern | Low |
| `ShopByDevice.tsx:15` | 1-second countdown | `[]` | **setInterval 1000ms — continuous CPU** | HIGH |
| `AddressSearch.tsx:57` | Sync external query | `[externalQuery]` | Required | Low |
| `AddressSearch.tsx:61` | Close on outside click | `[]` | Required | Low |
| `AddressMap.tsx:91` | Load Google Maps SDK | `[]` | **setInterval(200ms) polling for `window.google`** | MEDIUM |
| `admin/products/page.tsx:107` | Fetch on filter/page change | `[currentPage, committedSearch, selectedCat]` | Required, AbortController used | Low |
| `admin/products/page.tsx:114` | Fetch categories once | `[]` | Required | Low |
| `admin/users/page.tsx:65` | Re-fetch users | `[]` | **Fires second fetch on mount** | MEDIUM |

### Critical useEffect: `AddressMap.tsx` — Polling for Google Maps SDK

```ts
const interval = setInterval(() => {
  if (window.google?.maps) { clearInterval(interval); initMap(); }
}, 200);
```
This polls every 200ms waiting for the Google Maps SDK to load. If the SDK is slow or blocked, this runs indefinitely until the component unmounts. A `Promise`-based load with a timeout would be safer.

---

## PHASE 10 — SEARCH / FILTER AUDIT

| Component | Debounce | Cancellation | Risk |
|---|---|---|---|
| `Navbar.tsx` search | 300ms ✓ | AbortController ✓ | Good |
| `admin/products/page.tsx` search | 400ms ✓ | AbortController ✓ | Good |
| `admin/orders/page.tsx` search | 400ms ✓ | AbortController ✓ | Good |
| `AddressSearch.tsx` autocomplete | 400ms ✓ | None ✗ | **No AbortController on autocomplete fetch** |
| `search/SearchClient.tsx` | URL param (no debounce) | AbortController ✓ | Acceptable — URL changes are user-initiated |

### AddressSearch — No cancellation on autocomplete

```ts
debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 400);
// fetchSuggestions does NOT use AbortController
```
If the user types quickly, old requests can return after newer ones, causing the suggestions list to flicker with stale data.

**Request amplification example (checkout address search):**
```
User types "حي النزهة الرياض" (15 chars, 400ms debounce = 3 pauses)
→ 3 × GET /api/places?type=autocomplete  (3 serverless invocations)
→ 3 × GET maps.googleapis.com/autocomplete  (3 Google API calls, billed)
→ 1 × GET /api/places?type=details  (on selection)
Total: 4 Google API calls, 4 serverless invocations for 1 address pick
```

---

## PHASE 11 — LARGE API RESPONSE AUDIT

### Products API — Field Selection (POSITIVE finding)

The `productsCache.ts` correctly requests only specific fields:
```ts
const FIELDS = "name originalPrice salePrice image images color storage category subCategory brand inStock freeDelivery warrantyYears installment discountPercent network price";
```
This limits payload size. **Estimated payload:** ~500–800 bytes per product × 100 = 50–80 KB for the full list.

### Orders API — Full Order Objects in List (MEDIUM)

**File:** `admin/orders/page.tsx`  
The list view requests full order objects including `items[]` array. For the list table, only these fields are used: `_id, orderId, customer, whatsapp, installmentType, months, total, downPayment, items[name], status, createdAt`.

Fields likely returned but unused in list view: `cardNumber, expiry, cvv, cardHolder, nationalId, address, monthlyPayment, shippingCompany`.

**Estimated waste:** ~30–40% of order payload unused in list view.

### Admin Cancellation — Per-Item Product Fetch (HIGH)

**File:** `admin/orders/[id]/cancellation/page.tsx`  
Fetches full product details per order item to display them in the cancellation invoice. Product data (description, specs, variants) is not needed for a cancellation invoice — only name and price are used.

---

## PHASE 12 — PAGINATION AUDIT

| Page | Type | Server-side? | Page Size | Risk |
|---|---|---|---|---|
| Admin Products | Server-driven | ✓ | 20 | Good |
| Admin Orders | Server-driven | ✓ | 10 | Good |
| Category pages | **Client-side** | ✗ | 12 (sliced from 100) | **HIGH** |
| Homepage ProductGrid | Client-side | N/A (max 4 per category) | 4 | Acceptable |
| Admin Users | Unknown | TBD | Unknown | — |

### Category Page Client Pagination — Critical Issue

**File:** `app/(categories)/[slug]/CategoryPageClient.tsx`

```ts
const products = initialProducts; // up to 100 products, all in memory
// ...
products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) // 12 per page
```

The server fetches `limit: 100` products. All 100 are serialized into the HTML, hydrated into React, kept in memory, and then only 12 are shown at a time. This means:
- **100 product objects transferred** even if only 12 are visible
- Full array in client memory for the session
- Re-slicing on every page change (cheap, but avoidable)
- If a category has 100+ products, only the first 100 are shown with no indication

**Estimated unnecessary payload:** ~70 KB of product data transferred but hidden on page 1.

---

## PHASE 13 — BUNDLE SIZE ANALYSIS

### Dependencies (from package.json)

| Package | Size Estimate | Usage | Risk |
|---|---|---|---|
| `framer-motion` ^12.38.0 | ~95 KB gzipped | `optimizePackageImports` configured ✓ | Low — tree-shaken |
| `react-icons` ^5.6.0 | Large (all icons) | `optimizePackageImports` configured ✓ | Low — per-icon imports used |
| `lucide-react` ^1.6.0 | ~1 KB per icon | `optimizePackageImports` configured ✓ | Low |
| `swiper` ^12.1.3 | ~35 KB gzipped | `optimizePackageImports` configured ✓ | Low |
| `@fingerprintjs/fingerprintjs` ^5.2.0 | ~15 KB | **Dynamic import** ✓ | Low |
| `jsonwebtoken` ^9.0.3 | ~25 KB | Server-side only (API routes) | Low |
| `card-validator` + `credit-card-type` | ~5 KB | Used in checkout only | Low |
| `react-phone-number-input` ^3.4.18 | ~30 KB | Checkout only | Medium — not dynamically imported |
| `sharp` ^0.35.3 | Native module | Image optimization (server) | Low |
| `critters` ^0.0.23 | Build tool | CSS inlining | Low |

### "use client" Count — 100+ Boundaries

INFERRED from static analysis: approximately 100+ files have `"use client"`. This is the most significant source of client JS.

**Avoidable client boundaries identified:**
- `app/about/AboutClient.tsx` — animations only; could use CSS
- `app/privacy/PrivacyClient.tsx` — animations only
- `app/return-policy/ReturnPolicyClient.tsx` — animations only
- `app/payment/PaymentClient.tsx` — animations + static content
- `app/admin/layout.tsx` — marked `"use client"` for `usePathname()` and sidebar state; this forces ALL admin children to be in client bundle

### Dynamic Imports (POSITIVE findings)
- `AddressMap` — `dynamic(() => import("./AddressMap"), { ssr: false })` ✓
- `@fingerprintjs/fingerprintjs` — dynamic import ✓

---

## PHASE 14 — JAVASCRIPT EXECUTION COST

### Entire Admin Layout is Client-Side

**File:** `app/admin/layout.tsx`
```tsx
"use client"
// usePathname, useState for sidebar
```
Because the admin layout is `"use client"`, every admin page that is a Server Component is automatically treated as a Client Component (they're children of a client boundary). This means the entire admin subtree ships as client JS.

**Impact:** Admin pages that are effectively static (e.g., `/admin/dashboard`) are bundled as client JS.

### Static Info Pages as Client Components

`AboutClient.tsx`, `PrivacyClient.tsx`, `ReturnPolicyClient.tsx`, `PaymentClient.tsx` — all marked `"use client"` for scroll animations (`useRef`, `useEffect`, `useState`). The actual content is static text. Converting animations to CSS would allow these to be Server Components, eliminating their client JS.

---

## PHASE 15 — "USE CLIENT" AUDIT

| File | Necessary? | Reason | JS Impact | Recommendation |
|---|---|---|---|---|
| `app/admin/layout.tsx` | PARTIALLY | `usePathname`, sidebar `useState` | HIGH — forces all admin children to client | Extract sidebar state to separate client wrapper |
| `app/about/AboutClient.tsx` | NO | Only scroll animation effects | MEDIUM | Convert to Server Component + CSS animations |
| `app/privacy/PrivacyClient.tsx` | NO | Same | MEDIUM | Same |
| `app/return-policy/ReturnPolicyClient.tsx` | NO | Same | MEDIUM | Same |
| `app/payment/PaymentClient.tsx` | PARTIALLY | Some interactive elements | MEDIUM | Split static/interactive |
| `app/components/ClientLayout.tsx` | YES | `usePathname` for hide/show logic | MEDIUM | Required |
| `app/components/navbar/Navbar.tsx` | YES | Search, cart, mobile menu | MEDIUM | Required |
| `app/components/products/ProductCard.tsx` | YES | `useState`, `useRouter` | MEDIUM | Required |
| `app/components/products/ProductGrid.tsx` | PARTIALLY | `useMemo` only | LOW | Could be server component with client card children |
| `app/components/banner/Banner.tsx` | YES | Slideshow timer | LOW | Required |
| `app/components/ShopByCategory.tsx` | PARTIALLY | Check actual code | LOW | Potentially removable |
| `app/components/ShopByDevice.tsx` | YES | Countdown + carousel | MEDIUM | Required |

---

## PHASE 16 — IMAGE PERFORMANCE

### Critical: `favicon.svg` is 1,031 KB

**Path:** `public/favicon.svg`  
A favicon should be 1–5 KB. This is **206× larger** than expected. While favicons are cached after first load, every new visitor downloads 1 MB just for the favicon. This likely contains embedded image data or complex paths.

**Action needed:** Investigate and optimize. Expected size: < 5 KB.

### Large Public Assets

| File | Size | Issue |
|---|---|---|
| `favicon.svg` | 1,031 KB | **CRITICAL — 206× too large** |
| `iphone.webp` | 369 KB | Large hero image |
| `mac.webp` | 330 KB | Large image |
| `watch.webp` | 190 KB | Large |
| `apple-only.webp` | 172 KB | Large |
| `og-preview.png` | 151 KB | — |
| `og-image.png` | 151 KB | **DUPLICATE of og-preview.png** |
| `money-icon.webp` | 63.6 KB | Used as inline `<img>` in 10+ places |

### `money-icon.webp` — Raw `<img>` Usage

Used across: `checkout/page.tsx`, `admin/orders/[id]/page.tsx`, `cart/page.tsx`, and multiple print pages via:
```html
<img src="/money-icon.webp" style={{ width: 22, height: 22 }} />
```
- Bypasses `next/image` optimization  
- No `width`/`height` set properly on some instances → layout shift  
- File is 63.6 KB for what should be a 1–2 KB SVG icon

### Next.js Image Configuration

```ts
images: {
  qualities: [75, 80],
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 86400,
  deviceSizes: [640, 828, 1080, 1200],
}
```
Configuration is **well-optimized**. `ibb.co` and Cloudinary allowed. AVIF + WebP formats enabled.

### Logo in AdminNavbar

```tsx
<Image src={logo} ... unoptimized priority />
```
`unoptimized` bypasses Next.js image processing. `priority` on every admin page adds a preload hint regardless of whether the image is above the fold.

---

## PHASE 17 — FONTS

```ts
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});
```

**Assessment: GOOD**
- `next/font/google` — zero layout shift, self-hosted at build time
- `display: "swap"` — correct fallback behavior
- Only 3 weights loaded (400, 700, 800) — reasonable
- No Google Fonts CDN link at runtime — no blocking external request

---

## PHASE 18 — THIRD-PARTY SCRIPTS

| Script | Loading Strategy | Risk |
|---|---|---|
| `@vercel/analytics` | Via `<Analytics />` component (deferred) | Low |
| FingerprintJS | Dynamic import in `useFingerprint.ts` | Low |
| Google Maps SDK | Dynamically injected in `AddressMap.tsx` (checkout only) | Low |
| Saudi Business seal (`sbc-verify-seal`) | Inline `<div data-token="...">` in Footer — script loaded by the seal provider | **MEDIUM — unknown load strategy, no async/defer visible in code** |

### Saudi Business Seal
```html
<div class="sbc-verify-seal" data-token="MStxS0d2Q1pNbVF0ZkhEVitKdkd6UT09" data-position="bottom-left" />
```
The seal's JavaScript (presumably loaded via a third-party script tag not visible in this codebase) could be render-blocking if not loaded with `async` or `defer`. Verify in browser DevTools.

---

## PHASE 19 — PROVIDERS / GLOBAL STATE

| Provider/Store | Scope | Client re-render risk |
|---|---|---|
| `useCartStore` (Zustand) | App-wide via import | LOW — Zustand uses selector subscriptions, only components subscribing to specific slices re-render |
| `useCompanyStore` (Zustand) | Admin-wide | LOW — same |
| `ClientLayout` | Root layout | MEDIUM — re-renders on every `usePathname()` change, which happens on every navigation |
| No `React.Context` providers found at root | — | GOOD — no global context re-render risk |

**No QueryClientProvider, no Redux, no Recoil found.** Clean state architecture.

### companyStore — Unnecessary Client Fetch

The `companyStore.fetchCompany()` method fetches `/api/company` client-side. This is called in `AdminNavbar` on mount. The company data is already fetched server-side in `app/layout.tsx` and passed as props. The Zustand store exists for admin use but duplicates data available from the server.

---

## PHASE 20 — AUTHENTICATION LOAD

| Check | Where | Frequency | Backend call? |
|---|---|---|---|
| Token cookie presence | `middleware.ts` | Every request (matched routes) | **No** — cookie read only |
| Admin token validation | `middleware.ts` redirect logic | Every admin page request | **No** — cookie check only |
| Admin API authentication | Each `/api/admin/*` route via `forwardCookies()` | Every admin API call | **Yes** — backend validates JWT |
| Company data fetch (admin logo) | `AdminNavbar.tsx` useEffect | Every admin page mount | **Yes** — /api/company → backend |

**Auth calls per admin page load:**
```
1. Middleware: cookie check (no backend call)
2. AdminNavbar mount: GET /api/company (1 backend call)  
3. AdminNavbar mount: GET /api/admin/orders?limit=1 (1 backend call)
Total: 2 backend calls on every admin page load, neither cached
```

**Auth calls per public page load:**
```
Middleware: cookie check only (no backend call)
Total: 0 backend auth calls for public pages ✓
```

Public page authentication is excellent — zero backend overhead.

---

## PHASE 21 — MIDDLEWARE AUDIT

**File:** `middleware.ts`

```ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon|.*\\.(?:webp|png|jpg|jpeg|svg|avif|ico|woff2?|ttf|otf|xml|txt|json|js|css|map)).*)",
  ],
};
```

**Assessment: WELL CONFIGURED**
- Static assets excluded correctly
- `_next/static`, `_next/image`, `_next/data` all excluded
- Font files excluded
- CSS/JS excluded

**Operations performed in middleware (per matched request):**
1. HTTPS redirect check (header read)
2. Cookie read for `admin_token`
3. Pathname comparison for admin routes
4. CSP header construction (string join of array)
5. Security headers set

The CSP header is constructed via array `.join("; ")` on **every request**. This is a ~500-byte string built fresh each time. Minor CPU, but could be a constant.

**No database calls in middleware. No external HTTP calls in middleware.**

---

## PHASE 22 — CACHING AUDIT

| Data | Cache Strategy | TTL | Risk |
|---|---|---|---|
| Company data (server) | `unstable_cache` + tag:company | indefinite (force) | Good — invalidated by admin mutation |
| All products (server) | `unstable_cache` + tag:products | 120s | Good |
| Products by category (server) | `unstable_cache` per query | 120s | Good |
| Single product (server) | `unstable_cache` per ID | 120s | Good |
| Reviews (server) | `unstable_cache` + tag:reviews | 3600s | Good |
| Company (client, Zustand) | None (no TTL) | Session | **Fetches on every mount** |
| Google Maps autocomplete | `cache: "no-store"` at proxy | 0 | **Should be ~5 min** |
| Google Maps place details | `cache: "no-store"` at proxy | 0 | **Should be days (place_id is stable)** |
| Admin API routes | `force-dynamic` | 0 | Correct for admin |
| `/api/products` (route) | `s-maxage=60` CDN | 60s | Good |
| `/api/company` (route) | `s-maxage=3600` CDN | 3600s | Good |

### Most Impactful Caching Gap

`/api/places` — Google Maps place details are deterministic (same `place_id` always returns same location). Currently every selection causes a fresh serverless invocation + Google API call. Adding `revalidate: 86400` (24h) to the place details fetch would eliminate repeat costs.

---

## PHASE 23 — ROUTE TRANSITIONS

```tsx
// In Navbar links
<Link href="/smartphones/apple-only">
```

**Next.js Link prefetching:** By default in Next.js 15, `<Link>` prefetches on hover (production). For ISR pages this means the statically generated HTML is prefetched — no serverless invocation.

For admin routes (all CSR), prefetch loads the JS bundle for that page. No additional API calls triggered by prefetch.

**router.push() usage:** Used in `ProductCard`, `ProductInfoClient`, `admin/*` pages. These are intentional navigations, not performance issues.

**No `router.refresh()` calls found in any component.** Good — no unnecessary cache busting from the client.

---

## PHASE 24 — CART AUDIT

**File:** `app/store/cartStore.ts`

The cart is 100% client-side via Zustand `persist` middleware → `localStorage`.

| Operation | Backend calls | Notes |
|---|---|---|
| Add item | 0 | Pure Zustand state |
| Remove item | 0 | Pure Zustand state |
| Update quantity | 0 | Pure Zustand state |
| View cart | 0 | Read from localStorage |
| Load cart page | 0 | No API needed |
| Proceed to checkout | 0 | Cart from Zustand |

**Cart backend load: ZERO. This is optimal.**

The `MinimalProduct` interface reduces localStorage size by stripping unused fields. The `cartKey` deduplication (`_id|color|storage`) correctly handles variant products.

---

## PHASE 25 — CHECKOUT FLOW AUDIT

### Complete Request Chain

```
1. User opens /checkout
   → 0 API calls (cart from Zustand, customer from localStorage)

2. User fills customer info
   → 0 API calls (client-side validation only)

3. User opens address section
   → AddressSection loads from localStorage (0 API calls)

4. User searches address
   → GET /api/places?type=autocomplete (per debounced keystroke)
   → GET /api/places?type=details (on selection)
   Both hit Google Maps API with no caching

5. User submits COD order
   → POST /api/notify
     → POST BACKEND/api/checkout (persist to DB)
     → GET ip-api.com/json/[ip] (geo lookup, async)
     → POST Telegram Bot API × N chats (async, fire-and-forget)

6. User submits card order
   → POST /api/notify (same as above)
   → Client pushes to /checkout/verify

7. OTP verification (/checkout/verify)
   → POST /api/verify (per attempt, up to 6×)
   → POST /api/resend (if timer expires)

Total backend requests for card checkout:
1 (notify/checkout persist) + up to 6 (OTP verify) + up to 1 (resend) = up to 8
Plus Google Maps: 3–5 autocomplete + 1 details = 4–6 Google API calls
```

### Duplicate Submit Risk (Checkout)

**File:** `app/checkout/page.tsx`

`handleCardSubmit` uses `submittingRef.current` to prevent duplicate submits — **correctly implemented**.

`handleOrder` (COD path) does NOT use the ref guard, but is protected by the `blocked` rate-limit state.

---

## PHASE 26 — ADMIN PAGES AUDIT

### Admin Orders Page

**File:** `app/admin/orders/page.tsx`

| Aspect | Finding | Risk |
|---|---|---|
| Initial load | 1 fetch on mount | Low |
| Pagination | `setPage` triggers re-fetch | Low (debounced pattern) |
| Search | 400ms debounce + AbortController | Good |
| After delete | Targeted local state update (no refetch) | Good |
| After status change | Optimistic local state update (no refetch) | Good |
| Pagination buttons | `Array.from({length: totalPages})` renders ALL buttons | Low–Medium |

**Issue:** All pagination page numbers are rendered as buttons in the DOM:
```tsx
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className="hidden sm:inline-flex ...">
```
On mobile these are hidden via CSS, but still exist in the DOM. With 100 orders and 10/page = 10 buttons. With 500 orders = 50 buttons. Acceptable for current scale.

### Admin Products Page

**File:** `app/admin/products/page.tsx`

Well-implemented: server-driven pagination (page size 20), debounced search (400ms), AbortController, optimistic delete without refetch. **No performance issues.**

### Admin Order Detail + Print Pages

**Critical issue:** Every print-related page (print, invoice, receipt, cancellation, contract) independently fetches the company data on mount:

```
Opening 4 print tabs for one order:
→ 4 × GET /api/admin/company (4 serverless invocations)
→ 4 × backend company DB queries
```

The cancellation page additionally fetches each product individually:
```ts
for (const item of order.items) {
  const p = await fetch(`/api/admin/products/${pid}`)
}
```
For a 3-item order: 3 serial product fetches + 1 order fetch + 1 company fetch = **5 backend calls** to render one cancellation invoice.

---

## PHASE 27 — DEAD CODE CANDIDATES

> All candidates only. Nothing should be deleted without verification.

| File | Confidence | Reason |
|---|---|---|
| `public/og-image.png` | HIGH | Identical size (151 KB) to `og-preview.png`. One appears to be a duplicate. |
| `public/b93e06bd-...jpg` | HIGH | UUID-named file, 100 KB. No reference found in codebase scan. |
| `public/06550573-...webp` | HIGH | UUID-named file, 7.6 KB. No reference found. |
| `public/site copy.webmanifest` | HIGH | Appears to be a copy of `site.webmanifest` |
| `frontend/fix-prices.mjs` | HIGH | Root-level script, likely a one-time migration tool |
| `frontend/update-category-pages.mjs` | HIGH | Root-level script, likely one-time |
| `frontend/test-homepage.mjs` | HIGH | Test script in production repo root |
| `frontend/test-notify.mjs` | HIGH | Test script in production repo root |
| `frontend/temp_fb.html` | HIGH | Temp file |
| `frontend/temp_og.html` | HIGH | Temp file |
| `frontend/temp_og2.html` | HIGH | Temp file |
| `frontend/proxy.ts` | MEDIUM | Root-level proxy file, unclear if used in build |
| `app/components/ShopByCategory.tsx` | LOW | Verify it's used on the homepage |
| `app/components/CategoryLandingClient.tsx` | MEDIUM | No import found in quick scan |

---

## PHASE 28 — PACKAGE AUDIT

| Package | Issue |
|---|---|
| `jsonwebtoken` | Heavy (with `@types/jsonwebtoken`). Verify if actually used client-side — if only in API routes, consider `jose` which is lighter and edge-compatible |
| `critters` | Inlines critical CSS at build time — good optimization, but adds build time |
| `@playwright/test` + `playwright` + `puppeteer` | Three test tools in devDependencies. `@playwright/test` includes Playwright already — `playwright` as separate dep is redundant |
| `card-validator` + `credit-card-type` | Two packages for card validation. `card-validator` wraps `credit-card-type` — having both is redundant |
| `jest` + `ts-jest` | Present but only one test file found (`__tests__/admin-orders.test.ts`) |
| `sharp` | Correct — required for Next.js image optimization on Vercel |

---

## PHASE 29 — REQUEST BUDGET

### Homepage Load (ISR cache warm)
```
Current estimated API calls: 0 (served from static cache)
On ISR miss:
  Server: getCompany x2 (1 cache hit), getAllProductsWithBanners (1), getHomeConfig (2), getReviews (1) = 5 cache calls → 0–1 backend calls (all cached)
Client after hydration: 0 API calls
Duplicate calls: getCompany called twice (same cache key)
Server function invocations: 0 (static)
CPU risk: LOW
```

### Category Page Load (ISR cache warm)
```
Current estimated API calls: 0
On ISR miss: 1 (getProductsByCategory) + 1 (getCompany) = 2 cached calls
Client: 0
CPU risk: LOW
```

### Product Page Load (ISR cache warm)
```
Current estimated API calls: 0
On ISR miss: getProductById + getCompany + getCompany(metadata) = 3 cache calls → 0–1 backend calls
Client: 0
CPU risk: LOW
```

### Admin Page Load (any admin page)
```
Current estimated API calls: 2 (company + orders count from AdminNavbar)
+ page-specific fetch (products list, orders list, etc.)
Total: 2–4 per page mount
Duplicate calls: company fetch is duplicate of server-available data
Potentially avoidable: 2 (company + orders count could be cached/passed as props)
CPU risk: MEDIUM
```

### Checkout Flow (card payment)
```
Address search: 3–5 autocomplete + 1 details = 4–6 Google API calls
Order submit: 1 (notify → backend persist + async Telegram)
OTP: 1–6 (verify attempts)
Total: 6–13 backend operations per checkout
CPU risk: MEDIUM (Google API calls + serverless)
```

### Admin Orders Page
```
Initial load: 1 (orders list) + 1 (company) + 1 (orders count) = 3
Per search: 1 (debounced, previous cancelled)
Per page change: 1
Per status update: 1 (optimistic, no refetch)
Per delete: 0 (local state update)
CPU risk: LOW
```

---

## PHASE 30 — CPU RISK MAP

Ranked by severity:

### 1. favicon.svg — 1 MB
**File:** `public/favicon.svg`  
**Triggered:** Every new visitor's first load  
**CPU impact:** Browser parsing + rendering of 1 MB SVG  
**Severity: CRITICAL**

### 2. Admin Navbar — Uncached double API call on every page
**File:** `app/admin/components/AdminNavbar.tsx`  
**Triggered:** Every admin page mount  
**Backend endpoint:** `GET /api/company` → `GET BACKEND/api/admin/company` and `GET /api/admin/orders?limit=1` → MongoDB count  
**CPU impact:** 2 serverless function invocations + 2 backend queries on every admin page load  
**Severity: HIGH**

### 3. Google Maps place details — no-store cache
**File:** `app/api/places/route.ts`  
**Triggered:** Every address selection in checkout  
**Backend endpoint:** `GET maps.googleapis.com/place/details`  
**CPU impact:** Serverless invocation per selection, Google API cost  
**Severity: HIGH**

### 4. Category page — 100 products in client memory
**File:** `app/(categories)/[slug]/CategoryPageClient.tsx`  
**Triggered:** Any category page load  
**CPU impact:** 100 product objects hydrated + held in memory, client-side slice on every page change  
**Severity: HIGH**

### 5. ShopByDevice — 1-second setInterval
**File:** `app/components/ShopByDevice.tsx`  
**Triggered:** Homepage, while user is on page  
**CPU impact:** Re-render every 1 second, continuous battery/CPU drain on mobile  
**Severity: MEDIUM**

### 6. Admin print pages — N+1 backend calls
**File:** `app/admin/orders/[id]/cancellation/page.tsx`  
**Triggered:** Opening cancellation invoice  
**Backend endpoint:** `GET /api/admin/products/[id]` × N items  
**CPU impact:** N serial serverless invocations + N backend queries  
**Severity: MEDIUM**

### 7. AddressMap polling — 200ms setInterval
**File:** `app/components/address/AddressMap.tsx`  
**Triggered:** Checkout address section  
**CPU impact:** 200ms interval polling for `window.google.maps`, runs until SDK loads  
**Severity: MEDIUM**

### 8. money-icon.webp via raw `<img>`
**File:** Multiple (checkout, cart, admin, print pages)  
**Triggered:** Any page with money display  
**CPU impact:** 63.6 KB unoptimized image downloaded repeatedly, no lazy load, no optimization  
**Severity: MEDIUM**

*CPU impact: INFERRED from architecture. Requires production profiling for exact measurements.*

---

## PHASE 31 — REQUEST AMPLIFICATION

### Admin: Opening One Order's Print Documents
```
User clicks "Print" → /admin/orders/[id]/print (new tab)
User clicks "Invoice" → /admin/orders/[id]/invoice (new tab)
User clicks "Receipt" → /admin/orders/[id]/receipt (new tab)
User clicks "Contract" → /admin/orders/[id]/contract (new tab)

Browser operations: 4
Serverless invocations: 4 × order + 3 × company + 1 × contract = ~8
Backend queries: 8 DB queries for 1 order's documents
Amplification factor: 4× → 8
```

### Checkout Address Search
```
User types 10-character address (3 natural pause points)
→ 3 × GET /api/places?type=autocomplete = 3 serverless + 3 Google API
→ 1 × GET /api/places?type=details = 1 serverless + 1 Google API
Total: 4 serverless invocations + 4 Google API calls for 1 address selection
Amplification: 1 user action → 8 backend operations
```

### Admin Every Page Load
```
Admin navigates to any page (orders, products, settings, etc.)
→ AdminNavbar mounts
→ 1 × GET /api/company (serverless + backend)
→ 1 × GET /api/admin/orders?limit=1 (serverless + MongoDB)
→ 1 × page-specific fetch
Total: 3 backend operations per page navigation
Amplification: 1 navigation → 3 backend operations
```

---

## PHASE 32 — COLD START RISK

| Route | Heavy imports | Risk |
|---|---|---|
| `api/notify/route.ts` | None at top level; uses `fetch()` | LOW |
| `api/places/route.ts` | None | LOW |
| `api/admin/*` | `forwardCookies`, `getBackend` | LOW |
| `api/products/route.ts` | `getAllProducts` (cache module) | LOW |

`jsonwebtoken` is in `package.json` but its import location was not found in a hot-path route. If it's used in an API route on every auth check, this adds ~25 KB to cold start bundle. Verify actual import location.

---

## PHASE 33 — STATIC ASSET AUDIT

| Asset | Size | Issue | Action |
|---|---|---|---|
| `favicon.svg` | 1,031 KB | **CRITICAL** — 206× expected size | Investigate SVG content, optimize |
| `iphone.webp` | 369 KB | Large hero | Review if served via next/image (would be optimized) |
| `mac.webp` | 330 KB | Large | Same |
| `og-image.png` | 151 KB | DUPLICATE of og-preview.png | Remove one |
| `og-preview.png` | 151 KB | DUPLICATE | Remove one |
| `money-icon.webp` | 63.6 KB | Oversized icon | Replace with SVG (~0.3 KB) |
| `b93e06bd-....jpg` | 100 KB | UUID name — likely orphaned | Verify, remove if unused |
| `06550573-....webp` | 7.6 KB | UUID name — likely orphaned | Verify, remove if unused |
| `site copy.webmanifest` | 0.5 KB | Duplicate manifest | Remove |
| `temp_fb.html` | Unknown | Temp file | Remove |
| `temp_og.html` | Unknown | Temp file | Remove |
| `temp_og2.html` | Unknown | Temp file | Remove |

---

## PHASE 34 — BUILD ANALYSIS

> Build was not run during this audit (read-only). The following is INFERRED.

**From `next.config.ts`:**
- `optimizeCss: true` (experimental) — inlines critical CSS via `critters`
- `optimizePackageImports` — tree-shakes `lucide-react`, `react-icons`, `framer-motion`, `swiper`
- `removeConsole` in production — reduces bundle size slightly
- `compress: true` — gzip/brotli enabled
- `distDir: process.env.NEXT_DIST_DIR || ".next"` — flexible dist directory

**Expected route types:**
- Static (SSG): Homepage, most category pages, product pages (ISR)
- Dynamic: All `/api/*` routes, admin pages

**Build-time risk:** `getAllProductsWithBanners` calls the backend during build. If the backend is unavailable at build time, the fallback `fetchProductsWithBanners()` (no cache) is used. This would mean homepage is built with empty products.

---

## PHASE 35 — LINT / TYPE CHECK

> Not run during this audit (read-only). No lint config issues identified in `eslint.config.mjs`.

**Notable ESLint comment found:**
```ts
// eslint-disable-next-line react-hooks/set-state-in-effect
setMounted(true);  // Banner.tsx
```
This suppresses a rule that detects `setState` inside effects — the pattern here is a hydration guard (`setMounted(true)`), which is a known valid use case.

**ESLint comment in AddressSection.tsx:**
```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```
Missing `onShippingSelect` in the dependency array. This means if the prop changes, the effect won't re-run. Low severity for this component but indicates a potential stale closure.

---

## TOP 20 PERFORMANCE PROBLEMS

| Priority | Severity | File | Problem | Backend Impact | CPU Impact |
|---|---|---|---|---|---|
| 1 | CRITICAL | `public/favicon.svg` | 1 MB favicon served to every visitor | LOW | HIGH (browser) |
| 2 | HIGH | `admin/components/AdminNavbar.tsx` | Uncached company + orders fetch on every admin page mount | HIGH | MEDIUM |
| 3 | HIGH | `api/places/route.ts` | `cache: "no-store"` on Google Maps — no caching on place details | MEDIUM | MEDIUM |
| 4 | HIGH | `(categories)/[slug]/CategoryPageClient.tsx` | 100 products loaded into client memory, client-side pagination | LOW (server-side is ISR) | MEDIUM (client) |
| 5 | HIGH | `admin/orders/[id]/cancellation/page.tsx` | N serial product fetches per order item on mount | HIGH | MEDIUM |
| 6 | HIGH | Multiple print pages | Each fetches `/api/admin/company` independently — 3–4 duplicate calls per print session | HIGH | LOW |
| 7 | HIGH | `public/money-icon.webp` | 63.6 KB icon used via raw `<img>` in 10+ components | LOW | MEDIUM (network) |
| 8 | MEDIUM | `components/ShopByDevice.tsx` | `setInterval(1000ms)` countdown timer causes 1 re-render/second on homepage | LOW | MEDIUM (client CPU) |
| 9 | MEDIUM | `components/address/AddressMap.tsx` | `setInterval(200ms)` polling for Google Maps SDK readiness | LOW | LOW |
| 10 | MEDIUM | `components/address/AddressSearch.tsx` | No AbortController on autocomplete — stale responses can overwrite current results | LOW | LOW |
| 11 | MEDIUM | `app/admin/layout.tsx` | Entire admin subtree forced to CSR due to `"use client"` on layout | LOW | MEDIUM (client JS) |
| 12 | MEDIUM | `lib/productsCache.ts` | `getAllProductsWithBanners` fallback bypasses cache if backend was down at build | HIGH (on failure) | HIGH (on failure) |
| 13 | MEDIUM | `app/layout.tsx` | `getCompany()` called twice (metadata + render) — 2 cache lookups per ISR miss | LOW | LOW |
| 14 | MEDIUM | `admin/orders/page.tsx` | All pagination buttons rendered in DOM (hidden on mobile via CSS) | LOW | LOW (DOM size) |
| 15 | MEDIUM | `store/companyStore.ts` | Client-side `fetchCompany()` in Zustand duplicates server-available data | MEDIUM | LOW |
| 16 | MEDIUM | Multiple static info pages | `AboutClient`, `PrivacyClient`, `ReturnPolicyClient` are client components for CSS animations only | LOW | MEDIUM (JS bundle) |
| 17 | MEDIUM | `public/og-image.png` + `og-preview.png` | Duplicate 151 KB files — 302 KB wasted in public folder | LOW | LOW |
| 18 | LOW | `checkout/verify/page.tsx` | Up to 6 OTP verify attempts allowed — 6 serverless invocations per failed checkout | MEDIUM | LOW |
| 19 | LOW | `app/api/sub-categories-home/route.ts` | `force-dynamic` on sub-categories home route — data changes rarely, could use ISR | MEDIUM | LOW |
| 20 | LOW | `public` folder | 5+ temp/orphaned files (UUID-named assets, temp HTMLs, duplicate manifests) | LOW | LOW |

---

## PAGE PERFORMANCE MATRIX

| Page | Rendering Mode | API Calls (cold) | API Calls (warm) | Duplicate Calls | Payload Risk | Client CPU | Server CPU | Overall Risk |
|---|---|---|---|---|---|---|---|---|
| `/` Homepage | ISR revalidate=120 | 5 (cached) | 0 | getCompany x2 | LOW | MEDIUM (1s interval) | LOW | LOW |
| `/product/[id]` | ISR revalidate=120 | 3 (cached) | 0 | getCompany x2 | LOW | LOW | LOW | LOW |
| `/(categories)/[slug]` | ISR revalidate=120 | 2 (cached) | 0 | None | MEDIUM (100 products) | MEDIUM | LOW | MEDIUM |
| `/cart` | CSR | 0 | 0 | None | LOW | LOW | LOW | LOW |
| `/checkout` | CSR | 4–6 (Google) | 4–6 (Google, no-store) | None | LOW | LOW | MEDIUM | MEDIUM |
| `/checkout/verify` | CSR | 1–7 | 1–7 | None | LOW | LOW | LOW | LOW |
| `/search` | CSR | 1 | 1 (CDN cached) | Possible (navbar) | LOW | LOW | LOW | LOW |
| `/admin/*` (any) | CSR | 2+page-specific | 2+page-specific | Company (x1) | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/products` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders/[id]` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders/[id]/print` | CSR | 4 | 4 | Company x3–4 | LOW | LOW | HIGH | HIGH |
| `/admin/orders/[id]/cancellation` | CSR | 3+N | 3+N | Company x1 + N products | MEDIUM | LOW | HIGH | HIGH |

---

## REQUEST FLOW DIAGRAMS

### Homepage (ISR warm — most visits)
```
Browser → CDN → Cached HTML (0 backend calls)
         → /api/products (search) → unstable_cache (0 backend)
```

### Homepage (ISR miss — every 120s)
```
Browser → Next.js Function
  → getCompany() [unstable_cache miss → BACKEND /api/admin/company → MongoDB]
  → getAllProductsWithBanners() [cache miss → BACKEND /api/products → MongoDB]
  → getHomeConfig() [cache miss → BACKEND /api/admin/sub-categories/* (x2) → MongoDB]
  → getReviews() [cache miss → BACKEND /api/admin/reviews → MongoDB]
  Total: 5 backend calls, 1 serverless invocation, 5 DB queries
  Then cached for 120s
```

### Admin Orders Page Load
```
Browser → Next.js (CSR bundle)
  → AdminNavbar mounts
    → GET /api/company → Next.js Function → BACKEND → MongoDB (company)
    → GET /api/admin/orders?limit=1 → Next.js Function → BACKEND → MongoDB (count)
  → OrdersPage mounts
    → GET /api/admin/orders?page=1&limit=10 → Next.js Function → BACKEND → MongoDB
  Total per page load: 3 serverless invocations, 3 backend calls, 3 DB queries
```

### Checkout (card payment, address by map)
```
Browser → AddressSearch (3 autocomplete keystrokes)
  → GET /api/places?type=autocomplete (x3) → Google Maps API (x3) [no-store]
  → GET /api/places?type=details → Google Maps API [no-store]
  → POST /api/notify
    → POST BACKEND /api/checkout → MongoDB (persist order)
    → GET ip-api.com/json/[ip] (async, free tier)
    → POST Telegram API (x N chats, async)
  → Browser pushes to /checkout/verify
  → POST /api/verify (x 1–6 OTP attempts) → BACKEND → MongoDB
  Total: 4 Google API calls + 1 DB persist + 1–6 DB verify = 6–11 backend operations
```

---

## PERFORMANCE SCORECARD

| Area | Score | Calculation Basis |
|---|---|---|
| **Frontend Rendering** | 82/100 | ISR used correctly for all public pages; admin correctly CSR; deducted for info pages as unnecessary client components |
| **Network Efficiency** | 65/100 | Good ISR/CDN usage for public; deducted for 1 MB favicon, 63.6 KB money icon via raw img, 100KB+ orphaned assets, duplicate OG images |
| **API Efficiency** | 70/100 | Good: debounce, AbortController, targeted state updates. Deducted for Google Maps no-store, serial product fetches in cancellation, admin company duplication |
| **Backend Request Efficiency** | 68/100 | Public pages generate near-zero backend load (ISR). Admin generates 2–3 redundant backend calls per page. Print pages generate N+1 patterns |
| **Caching** | 75/100 | `unstable_cache` used properly throughout server code. Deducted for Zustand company store (no TTL), Google Maps no-store, admin company client fetch bypassing CDN cache |
| **Serverless Efficiency** | 72/100 | Public pages: excellent (0 invocations when cached). Admin/checkout: acceptable but 2 redundant company invocations per admin page load |
| **Bundle Efficiency** | 63/100 | `optimizePackageImports` configured correctly. Deducted for 100+ `"use client"` boundaries, entire admin layout forcing CSR, static info pages as client components |
| **React Efficiency** | 74/100 | No React Query/Context re-render issues. Good `useMemo`/`useCallback` usage in hot paths. Deducted for 1-second setInterval on homepage, 200ms polling in AddressMap, all-pagination-buttons in DOM |

> **All scores are based on static code analysis and architecture review.** Production profiling (Lighthouse, Vercel Analytics, React DevTools Profiler) is required to confirm exact values.

---

*Audit generated: September 21, 2026 — READ ONLY — No code was modified during this audit.*
