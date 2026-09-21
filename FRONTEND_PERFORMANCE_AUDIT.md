# FRONTEND PERFORMANCE AUDIT — LAMSA SMART STORE

**Date:** 2026-09-21 | **Framework:** Next.js 15 / React 19 / Zustand 5 / Tailwind CSS 4
**Method:** Static code analysis — READ ONLY. Nothing was modified.

> Where exact production measurements are unavailable, findings are marked **INFERRED**. Production profiling (Vercel Analytics, React DevTools Profiler, Lighthouse) is required to confirm exact values.

---

## EXECUTIVE SUMMARY

The frontend architecture is fundamentally sound for a Next.js ISR application. Public pages use `force-static` with 120–3600 s revalidation, `unstable_cache` deduplicates server fetches correctly, the cart is 100% client-side (zero backend calls per cart operation), and admin pages use proper server-driven pagination with debounce + AbortController.

**Identified strengths:**
- ISR applied correctly to all public-facing pages
- `unstable_cache` used for company, products, reviews, and per-product data
- Cart is Zustand + localStorage — zero backend pressure
- Search inputs use debounce (300–400 ms) + AbortController in all three locations
- Middleware reads only a cookie — no DB lookup per request
- Mutations correctly call `revalidateTag()` to purge ISR cache
- No polling anywhere in admin pages
- `@fingerprintjs/fingerprintjs` dynamically imported (no bundle size impact)
- `AddressMap` dynamically imported with `ssr: false`

**Critical problems:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | `favicon.svg` is **1,031 KB** — 206× expected size |
| 2 | HIGH | AdminNavbar fires **2 uncached API calls** on every admin page mount |
| 3 | HIGH | Admin print pages each independently fetch `/api/admin/company` |
| 4 | HIGH | Google Maps `/api/places` proxy uses `cache: "no-store"` on place-details |
| 5 | HIGH | `money-icon.webp` (63.6 KB) used via raw `<img>` in 10+ files |
| 6 | HIGH | Category pages load 100 products into client memory, then slice client-side |
| 7 | MEDIUM | `ShopByDevice` `setInterval(1000 ms)` runs continuously on homepage |

---

## PHASE 1 — ARCHITECTURE MAP

### Route Tree

```
app/
├── layout.tsx                    Server Component — force-static revalidate=3600
│                                 Calls getCompany() TWICE (generateMetadata + render)
├── page.tsx                      Server Component — force-static revalidate=120
│                                 3 parallel fetches: company, productsWithBanners, homeConfig
├── (categories)/
│   ├── [slug]/page.tsx           Server ISR — getProductsByCategory (limit=100)
│   └── smartphones/*/page.tsx    ~22 static sub-pages
├── product/[id]/page.tsx         Server ISR revalidate=120 — getProductById
├── cart/page.tsx                 CSR — Zustand only, 0 API calls
├── checkout/page.tsx             CSR — POST /api/notify on submit
├── checkout/verify/page.tsx      CSR — POST /api/verify per OTP attempt
├── search/page.tsx               Suspense → SearchClient (CSR)
├── admin/
│   ├── layout.tsx                "use client" — forces all admin children to client bundle
│   ├── components/AdminNavbar    Client — 2 uncached fetches on every mount
│   ├── orders/page.tsx           Client — paginated, debounced
│   ├── orders/[id]/page.tsx      Client — single order fetch on mount
│   ├── orders/[id]/print/        Client — order + company on mount
│   ├── orders/[id]/invoice/      Client — order + company on mount
│   ├── orders/[id]/receipt/      Client — order on mount
│   ├── orders/[id]/contract/     Client — order on mount
│   ├── orders/[id]/cancellation/ Client — order + company + N product fetches
│   ├── products/page.tsx         Client — paginated, debounced
│   └── dashboard/page.tsx        Server (static placeholder)
└── api/
    ├── products/route.ts         Loads all 100 products from cache, filters in memory
    ├── company/route.ts          Proxy — revalidate=3600
    ├── places/route.ts           Google Maps proxy — cache: "no-store"
    ├── notify/route.ts           Checkout POST — DB persist + async Telegram
    ├── verify/route.ts           OTP proxy
    ├── revalidate/route.ts       ISR tag invalidation
    └── admin/* (~30 routes)      All proxy routes — force-dynamic where needed
```

### State Management
- **Zustand** `cartStore` (persisted to localStorage) + `companyStore` (in-memory, no TTL)
- No React Query, no SWR, no Redux, no React Context providers at root
- **Cart:** fully client-side — zero backend calls for any cart operation

### Font Loading
- `Cairo` via `next/font/google` — subsets `arabic + latin`, weights `400/700/800`, `display: swap`
- **GOOD:** self-hosted at build time, no runtime Google Fonts CDN request

### Third-Party Scripts
| Script | Strategy | Risk |
|--------|-----------|------|
| `@vercel/analytics` | `<Analytics />` (deferred) | Low |
| FingerprintJS | Dynamic import | Low |
| Google Maps SDK | Injected lazily in `AddressMap.tsx` (checkout only) | Low |
| Saudi Business seal (`sbc-verify-seal`) | `<div data-token>` in Footer — external script strategy unknown | **MEDIUM** — verify `async`/`defer` in browser |

---

## PHASE 2 — BACKEND REQUEST INVENTORY

| File | Page | Endpoint | Method | Trigger | Location | Cache | Notes |
|------|------|----------|--------|---------|----------|-------|-------|
| `lib/config.ts` | All public | `BACKEND/api/admin/company` | GET | ISR miss | Server | `unstable_cache` indefinite | Called twice per layout render |
| `lib/productsCache.ts` | Homepage | `BACKEND/api/products` | GET | ISR miss | Server | `unstable_cache` 120s | limit=100 |
| `lib/productsCache.ts` | Homepage | `BACKEND/api/admin/category-banners-bulk` | GET | ISR miss | Server | `unstable_cache` 120s | Batched |
| `page.tsx` | Homepage | `BACKEND/api/admin/sub-categories/home-settings` | GET | ISR miss | Server | revalidate=300 | |
| `page.tsx` | Homepage | `BACKEND/api/admin/sub-categories/max` | GET | ISR miss | Server | revalidate=300 | |
| `lib/productsCache.ts` | Category | `BACKEND/api/products/by-category` | GET | ISR miss | Server | `unstable_cache` 120s | Per slug |
| `lib/productsCache.ts` | Product | `BACKEND/api/products/[id]` | GET | ISR miss | Server | `unstable_cache` 120s | |
| `CustomerReviews.tsx` | Homepage | `BACKEND/api/admin/reviews` | GET | ISR miss | Server | `unstable_cache` 3600s | |
| `companyStore.ts` | Every admin | `/api/company` | GET | AdminNavbar mount | Client | **None** | Duplicate of server data |
| `AdminNavbar.tsx` | Every admin | `/api/admin/orders?page=1&limit=1` | GET | Mount | Client | **None** | Count badge only |
| `Navbar.tsx` | All public | `/api/products?q=…` | GET | 300ms debounce | Client | CDN s-maxage=60 | AbortController ✓ |
| `SearchClient.tsx` | /search | `/api/products?q=…` | GET | URL param | Client | CDN s-maxage=60 | |
| `AddressSearch.tsx` | /checkout | `/api/places?type=autocomplete` | GET | 400ms debounce | Client | **no-store** | No abort |
| `AddressSearch.tsx` | /checkout | `/api/places?type=details` | GET | Address pick | Client | **no-store** | |
| `checkout/page.tsx` | /checkout | `/api/notify` | POST | Submit | Client | N/A | COD path |
| `checkout/page.tsx` | /checkout | `/api/notify` | POST | Card submit | Client | N/A | Card path |
| `checkout/verify/page.tsx` | /verify | `/api/verify` | POST | OTP submit | Client | N/A | Up to 6× |
| `checkout/verify/page.tsx` | /verify | `/api/resend` | POST | Resend click | Client | N/A | |
| `admin/orders/page.tsx` | /admin/orders | `/api/admin/orders` | GET | Mount + search + page | Client | None | Debounced 400ms |
| `admin/orders/[id]/page.tsx` | order detail | `/api/admin/orders/[id]` | GET | Mount | Client | None | |
| `admin/orders/[id]/page.tsx` | order detail | `/api/admin/orders/[id]` | PUT | Save/status | Client | N/A | |
| `admin/orders/[id]/print` | print | `/api/admin/orders/[id]` + `/api/admin/company` | GET | Mount | Client | None | **2 calls** |
| `admin/orders/[id]/invoice` | invoice | `/api/admin/orders/[id]` + `/api/admin/company` | GET | Mount | Client | None | **2 calls** |
| `admin/orders/[id]/cancellation` | cancellation | `/api/admin/orders/[id]` + `/api/admin/company` + `/api/admin/products/[id]`×N | GET | Mount | Client | None | **N+2 calls** |
| `admin/orders/[id]/contract` | contract | `/api/admin/orders/[id]/invoice` | GET | Mount | Client | None | |
| `admin/orders/[id]/receipt` | receipt | `/api/admin/orders/[id]/invoice` | GET | Mount | Client | None | |
| `admin/orders/ReceiptVoucher.tsx` | receipt | `/api/admin/orders/[id]/invoice` | GET | Render | Client | None | May duplicate receipt page |
| `admin/products/page.tsx` | /admin/products | `/api/admin/products` | GET | Mount+filter+search | Client | None | Debounced 400ms |
| `admin/products/page.tsx` | /admin/products | `/api/admin/sub-categories` | GET | Mount once | Client | None | |
| `admin/products/page.tsx` | /admin/products | `/api/admin/products/[id]` | DELETE | Delete | Client | N/A | |
| `admin/users/page.tsx` | /admin/users | `/api/admin/users` | GET | Mount | Client | None | 2× on mount |
| `api/notify/route.ts` | (server) | `BACKEND/api/checkout` | POST | Checkout | Server | N/A | |
| `api/notify/route.ts` | (server) | `ip-api.com/json/[ip]` | GET | Every checkout | Server | None | Geo lookup |
| `api/places/route.ts` | (server) | `maps.googleapis.com/autocomplete` | GET | Input | Server | **no-store** | |
| `api/places/route.ts` | (server) | `maps.googleapis.com/place/details` | GET | Pick | Server | **no-store** | |

---

## PHASE 3 — DUPLICATE REQUEST ANALYSIS

### DUP-1: `getCompany()` called twice in root layout (MEDIUM)

**File:** `app/layout.tsx`

`generateMetadata()` and `RootLayout` both call `getCompany()`. Both hit `unstable_cache` with key `["company"]` — they share the same cache entry and will NOT generate two backend calls after the cache warms. However during an ISR cold start or cache miss, two parallel cache lookups are initiated before deduplication settles.

```
Current:  generateMetadata → getCompany() + RootLayout → getCompany() = 2 cache calls
Ideal:    1 call, pass result down as a prop
Backend reduction: ~0 (cache deduplicates), but cleaner architecture
```

---

### DUP-2: AdminNavbar fetches company on every admin page mount (HIGH)

**File:** `app/admin/components/AdminNavbar.tsx` line 13

```tsx
useEffect(() => { fetchCompany(); }, [fetchCompany]);
// → GET /api/company → BACKEND /api/admin/company → MongoDB
```

Fires on **every admin page navigation**. The company data is already fetched server-side in `app/layout.tsx` and passed as `initialLogo` / `whatsapp` props to `ClientLayout`. The Zustand store has no TTL, so it re-fetches each session.

```
Current:  GET /api/company on every admin page mount (unbounded)
Ideal:    0 client fetches — pass company data from server layout
Reduction: 100% of admin company client requests
```

---

### DUP-3: Print pages independently fetch `/api/admin/company` (HIGH)

**Files:**
- `admin/orders/[id]/print/page.tsx` — line 23
- `admin/orders/[id]/invoice/page.tsx` — line 61
- `admin/orders/[id]/cancellation/page.tsx` — line 59
- `admin/orders/[id]/PrintPage.tsx` — line 22

Each opens in a new browser tab and independently calls `fetch("/api/admin/company")`.

```
Current:  4 × GET /api/admin/company when admin prints all documents for one order
Ideal:    1 request, or embed company data in the order API response
Reduction: 75%
```

---

### DUP-4: `/api/admin/users` fetched twice on mount (MEDIUM)

**File:** `app/admin/users/page.tsx` lines 60 and 65

Two separate `fetch(ADMIN_USERS_URL)` calls fire on component mount — one inside an async handler and one as a separate re-fetch effect.

```
Current:  2 × GET /api/admin/users on page mount
Ideal:    1 request
Reduction: 50%
```

---

### DUP-5: Navbar search and `/search` page both call `/api/products?q=` (LOW)

When a user searches in the Navbar and then navigates to `/search?q=`, `SearchClient` fires a second identical request. The CDN `s-maxage=60` cache may serve the second request without backend invocation, but the route handler still executes.

---

## PHASE 4 — BACKEND LOAD ANALYSIS

### BL-1: `/api/products` loads ALL 100 products for every search (HIGH)

**File:** `app/api/products/route.ts`

```ts
const products = await getAllProducts(); // 100 products from cache
const result = q ? products.filter(p => p.name?.toLowerCase().includes(q) ...) : products;
```

The cache serves 100 products. Filtering is done inside the Next.js serverless function — not the backend. On every search cache miss, the function deserializes ~70–80 KB of product data, runs `.filter()` over 100 objects, then serializes the result. The returned payload is always the full filtered set with no field stripping.

**Backend impact:** Backend only called on cache miss (every 120 s). But the serverless function does unnecessary CPU work on every client search request.

---

### BL-2: `cache: "no-store"` on Google Maps place details (HIGH)

**File:** `app/api/places/route.ts` line 23

```ts
const res = await fetch(url, { cache: "no-store" });
```

Every address selection during checkout:
1. Invokes the Next.js serverless function
2. Calls Google Maps Place Details API with no caching
3. Same `place_id` selected again = 2 identical API calls, 2 serverless invocations

Place details are deterministic — the same `place_id` always returns the same data. Adding `revalidate: 86400` would eliminate repeat calls entirely.

---

### BL-3: Cancellation page — serial product fetch per item (MEDIUM)

**File:** `app/admin/orders/[id]/cancellation/page.tsx` line 72

```ts
for (const item of order.items) {
  const p = await fetch(`/api/admin/products/${pid}`).then(r => r.json());
}
```

Serial fetches — each item is fetched sequentially. A 3-item order = 3 serial serverless invocations + 3 backend DB queries.

---

### BL-4: AdminNavbar orders count on every admin page (MEDIUM)

**File:** `app/admin/components/AdminNavbar.tsx` line 18

```ts
fetch("/api/admin/orders?page=1&limit=1")
```

Proxy → backend → MongoDB. Fires every time any admin page loads (AdminNavbar is in the shared layout). No caching at any layer.

```
10 admin navigations = 10 MongoDB count queries for one badge number
```

---

### BL-5: `getAllProductsWithBanners` cache-bypass fallback (MEDIUM)

**File:** `app/lib/productsCache.ts`

```ts
export async function getAllProductsWithBanners() {
  const result = await cachedFetch();
  if (!result.products.length) {
    return fetchProductsWithBanners(); // bypasses cache — hits backend directly
  }
  return result;
}
```

If the backend was down at build time (empty cache), **every homepage request** bypasses `unstable_cache` and hits the backend directly. Under traffic spikes this could overload the backend.

---

## PHASE 5 — CPU CONSUMPTION ANALYSIS

### Server-Side CPU

| Issue | File | Severity | Reason |
|-------|------|----------|--------|
| In-memory filter over 100 products | `api/products/route.ts` | MEDIUM | Deserializes + filters full list per cache miss |
| Google Maps no-store calls | `api/places/route.ts` | MEDIUM | Full function init + upstream HTTP on every call |
| Serial product fetches | `admin/orders/[id]/cancellation` | MEDIUM | N upstream HTTP calls, N DB queries, sequential |
| Cache-bypass fallback | `lib/productsCache.ts` | HIGH (failure mode) | Full backend load on every request |
| Telegram + geo-IP in notify | `api/notify/route.ts` | LOW | Async fire-and-forget — extends function lifetime |

### Client-Side CPU

| Issue | File | Severity | Reason |
|-------|------|----------|--------|
| `setInterval(1000ms)` countdown | `components/ShopByDevice.tsx` | MEDIUM | Re-renders the component every second while on homepage |
| `setInterval(200ms)` SDK polling | `components/address/AddressMap.tsx` | MEDIUM | Polls `window.google.maps` until SDK loads |
| 100 products in client memory | `(categories)/[slug]/CategoryPageClient.tsx` | MEDIUM | Full array hydrated; `.slice()` on every page change |
| All pagination buttons in DOM | `admin/orders/page.tsx` | LOW | `Array.from({length: N})` — hidden on mobile via CSS but in DOM |
| Inline `<style>` in JSX | `CategoryPageClient.tsx`, `Banner.tsx` | LOW | CSS string injected on every render |

*All CPU figures INFERRED from architecture. Production profiling required for exact measurements.*

---

## PHASE 6 — SERVERLESS / VERCEL FUNCTION ANALYSIS

| Route | Invocation Reason | Frequency | CPU Risk | Could be cached? |
|-------|-------------------|-----------|----------|-----------------|
| `GET /api/products` | Search | Per search (CDN may absorb) | Low | Yes — CDN s-maxage=60 already set |
| `GET /api/company` | AdminNavbar client fetch | Every admin page mount | Low | Yes — already cached, client bypasses it |
| `GET /api/places?autocomplete` | Debounced keystroke | 3–5 per address entry | Medium | Yes — cache by input ~5 min |
| `GET /api/places?details` | Address selection | 1 per checkout | Medium | Yes — place_id is deterministic, cache 24h |
| `POST /api/notify` | Checkout submit | Per order | High (geo + Telegram) | No |
| `POST /api/verify` | OTP submit | 1–6 per checkout | Low | No |
| `GET /api/admin/*` | Admin actions | Unbounded | Low–Medium | No (admin must be dynamic) |
| `GET /api/sub-categories-home` | force-dynamic | On call | Medium | Yes — data is rarely updated |

---

## PHASE 7 — RENDERING MODE CLASSIFICATION

| Page | Mode | Correct? | Notes |
|------|------|----------|-------|
| `/` | ISR force-static revalidate=120 | ✓ | |
| `/product/[id]` | ISR revalidate=120 | ✓ | |
| `/(categories)/[slug]` | ISR revalidate=120 | ✓ | |
| `/cart` | CSR | ✓ | No server data needed |
| `/checkout` | CSR | ✓ | Cart from localStorage |
| `/checkout/verify` | CSR | ✓ | sessionStorage only |
| `/search` | CSR (Suspense) | ✓ | Dynamic query param |
| `/about`, `/privacy`, `/return-policy` | CSR | ✗ | Static content — should be Server Components |
| `/payment`, `/payment-method` | CSR | PARTIAL | Could split interactive bits |
| `/admin/*` | CSR | ✓ | Auth-gated, correct |
| `app/layout.tsx` | ISR force-static revalidate=3600 | ✓ | |

---

## PHASE 8 — REACT RE-RENDER AUDIT

### Highest Risk Components

**1. `ShopByDevice.tsx` — 1-second forced re-render**
`setInterval(calc, 1000)` calls `setState` every second. The entire `ShopByDevice` subtree (including product cards) re-renders once per second on the homepage.

**2. `ClientLayout.tsx` — re-renders on every route change**
`usePathname()` triggers re-evaluation of the entire layout wrapper (Navbar + Footer + WhatsappButton) on every navigation. Navbar is a complex component with 5 `useEffect` hooks.

**3. `admin/orders/page.tsx` — all pagination buttons in DOM**
`Array.from({length: totalPages})` creates all page buttons. With 500 orders (50 pages) = 50 buttons, hidden on mobile via CSS but still in the DOM. On desktop they're all rendered regardless of range.

**4. `ProductCard.tsx` — `normalizeProductForCard()` in render**
`normalizeProductForCard(product)` is called directly inside the render body without `useMemo`. On every parent re-render (e.g., from `ProductGrid`'s `useMemo` triggering), each card re-normalizes its product data.

**5. `Navbar.tsx` — 5 concurrent `useEffect` hooks**
The Navbar is sticky and never unmounts. All 5 effects and their event listeners (`resize`, `mousedown`) persist for the full session.

---

## PHASE 9 — useEffect AUDIT

| File | Purpose | Dep Array | Classification | Risk |
|------|---------|-----------|---------------|------|
| `Navbar.tsx:26` | Focus search input | `[searchOpen]` | Required | Low |
| `Navbar.tsx:31` | Close on outside click | `[]` | Required | Low |
| `Navbar.tsx:58` | Debounced search | `[searchQuery, fetchResults]` | Required — AbortController ✓ | Low |
| `Navbar.tsx:68` | Close mobile on resize | `[]` | Required | Low |
| `Navbar.tsx:75` | Prevent body scroll | `[mobileOpen]` | Required | Low |
| `AdminNavbar.tsx:13` | `fetchCompany()` | `[fetchCompany]` | **DUPLICATE** — company available server-side | HIGH |
| `AdminNavbar.tsx:15` | Orders count badge | `[]` | Fires once — no caching | MEDIUM |
| `ShopByDevice.tsx:15` | Countdown timer | `[]` | `setInterval(1000ms)` — continuous CPU | HIGH |
| `AddressMap.tsx:91` | Poll for Google Maps SDK | `[]` | `setInterval(200ms)` — polling anti-pattern | MEDIUM |
| `AddressSection.tsx:67` | Restore from localStorage | `[]` | Required | Low |
| `checkout/page.tsx:47` | Restore customer from localStorage | `[]` | Required | Low |
| `checkout/page.tsx:61` | Hydration guard (`setMounted`) | `[]` | Standard pattern | Low |
| `checkout/verify/page.tsx:31` | Read sessionStorage | `[router]` | Required | Low |
| `checkout/verify/page.tsx:36` | OTP countdown (setTimeout) | `[timer]` | Recursive timeout — correct | Low |
| `admin/orders/[id]/page.tsx:18` | Fetch single order | `[id]` | Required | Low |
| `admin/products/page.tsx:107` | Fetch on filter/page change | `[currentPage, committedSearch, selectedCat]` | Required — AbortController ✓ | Low |
| `admin/products/page.tsx:114` | Fetch categories once | `[]` | Required | Low |
| `admin/users/page.tsx:65` | Re-fetch users | `[]` | **2nd duplicate fetch on mount** | MEDIUM |
| `AddressSection.tsx` | Missing dep `onShippingSelect` | `[]` | ESLint disable comment present — stale closure risk | LOW |

### Critical: AddressMap SDK Polling

```ts
const interval = setInterval(() => {
  if (window.google?.maps) { clearInterval(interval); initMap(); }
}, 200);
```
Runs every 200 ms waiting for the Google Maps JS SDK to load. If the SDK fails to load (blocked by browser extension, network issue), this runs indefinitely until the component unmounts.

---

## PHASE 10 — SEARCH / FILTER AUDIT

| Component | Debounce | Cancel on new | Risk |
|-----------|---------|--------------|------|
| `Navbar.tsx` search | 300 ms ✓ | AbortController ✓ | Good |
| `admin/products/page.tsx` search | 400 ms ✓ | AbortController ✓ | Good |
| `admin/orders/page.tsx` search | 400 ms ✓ | AbortController ✓ | Good |
| `AddressSearch.tsx` autocomplete | 400 ms ✓ | **No AbortController ✗** | MEDIUM |
| `SearchClient.tsx` | URL-param triggered | AbortController ✓ | Good |

### AddressSearch — Missing AbortController

```ts
debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 400);
// fetchSuggestions uses fetch() without AbortSignal
```

If the user types during the 400 ms window, the debounce correctly resets. But once `fetchSuggestions` fires, there is no way to cancel a slow in-flight request. A fast second request can complete before the first, then the first returns and overwrites the results with stale data.

**Request amplification (checkout address — INFERRED):**
```
User types 12-char address → 3 debounce firings
→ 3 × GET /api/places?type=autocomplete  → 3 serverless invocations
→ 3 × maps.googleapis.com/autocomplete   → 3 Google API calls (billed)
→ User selects suggestion
→ 1 × GET /api/places?type=details       → 1 serverless invocation
→ 1 × maps.googleapis.com/place/details  → 1 Google API call (billed, no-store)
Total: 4 serverless invocations + 4 Google API calls for 1 address selection
```

---

## PHASE 11 — LARGE API RESPONSE AUDIT

### Products — Field Selection (POSITIVE)

`productsCache.ts` requests only required fields via `fields=` query param:

```ts
const FIELDS = "name originalPrice salePrice image images color storage category subCategory brand inStock freeDelivery warrantyYears installment discountPercent network price";
```

Estimated payload: ~500–800 bytes/product × 100 = 50–80 KB total — acceptable.

### Orders List — Unused Fields (MEDIUM)

The admin orders list table displays: `orderId, customer, whatsapp, installmentType, months, total, downPayment, items[name], status, createdAt`.

Fields returned by the API but not displayed in the list: `cardNumber, expiry, cvv, cardHolder, nationalId, address, monthlyPayment, shippingCompany`.

**INFERRED** payload waste: ~30–40% of each order object unused in the list view.

### Cancellation Page — Full Product Objects (HIGH)

Fetches entire product detail objects (`/api/admin/products/[id]`) per line item to render a cancellation invoice. Only `name` and `price` fields are used in the invoice display.

---

## PHASE 12 — PAGINATION AUDIT

| Page | Pagination Type | Server-side | Page Size | Risk |
|------|----------------|-------------|-----------|------|
| Admin Products | Server-driven | ✓ | 20 | Good |
| Admin Orders | Server-driven | ✓ | 10 | Good |
| Category pages | **Client-side slice** | ✗ | 12 (of 100) | HIGH |
| Homepage ProductGrid | 4 per category row | N/A | 4 | Acceptable |

### Category Page Client-Side Pagination

**File:** `CategoryPageClient.tsx`

```ts
const products = initialProducts; // 100 products all in memory
// ...
products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) // show 12
```

The server fetches `limit: 100`. All 100 objects are:
1. Serialized into the SSR HTML
2. Sent over the wire
3. Hydrated into React state
4. Kept in memory for the session
5. Sliced to show 12 at a time

If a category has >100 products, only the first 100 are ever shown with no indication to the user.

**Estimated unnecessary payload:** ~70 KB transferred and hydrated but invisible on page 1.

---

## PHASE 13 — BUNDLE SIZE ANALYSIS

### Dependencies

| Package | Est. Size | Tree-shaken | Risk |
|---------|-----------|-------------|------|
| `framer-motion` ^12.38 | ~95 KB gz | `optimizePackageImports` ✓ | Low |
| `react-icons` ^5.6 | Large | `optimizePackageImports` ✓ | Low |
| `lucide-react` ^1.6 | ~1 KB/icon | `optimizePackageImports` ✓ | Low |
| `swiper` ^12.1 | ~35 KB gz | `optimizePackageImports` ✓ | Low |
| `@fingerprintjs/fingerprintjs` ^5.2 | ~15 KB | Dynamic import ✓ | Low |
| `jsonwebtoken` ^9.0 | ~25 KB | Server-only? Verify | MEDIUM |
| `react-phone-number-input` ^3.4 | ~30 KB | Not dynamically imported | MEDIUM |
| `card-validator` + `credit-card-type` | ~5 KB | Used in checkout only | Low (but redundant pair) |

### `optimizePackageImports` Configuration (POSITIVE)

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "react-icons", "framer-motion", "swiper"],
}
```

This enables tree-shaking for these libraries — only imported icons/components are bundled.

### Dynamic Imports (POSITIVE)
- `AddressMap` — `dynamic(() => import("./AddressMap"), { ssr: false })` ✓
- `@fingerprintjs/fingerprintjs` — dynamic import ✓

---

## PHASE 14 — JAVASCRIPT EXECUTION COST

### Admin Layout Forces Entire Admin Subtree to Client Bundle

**File:** `app/admin/layout.tsx`

```tsx
"use client"
// usePathname, useState (sidebar)
```

Because the layout is `"use client"`, all of its children — even those that could be Server Components — are included in the client JS bundle. `/admin/dashboard` renders a single `<h1>` tag but is shipped as client JS due to this boundary.

**Recommendation (do not implement):** Extract `usePathname` and sidebar state to a thin client wrapper, keeping the layout shell as a Server Component.

### Static Info Pages as Client Components

`AboutClient.tsx`, `PrivacyClient.tsx`, `ReturnPolicyClient.tsx`, `PaymentClient.tsx` — all marked `"use client"` for scroll-reveal animations using `useRef`/`useEffect`/`useState`. The actual content is static Arabic text. These pages could be Server Components with CSS-only animations, eliminating their client JS entirely.

---

## PHASE 15 — "USE CLIENT" AUDIT

Approximately 100+ files have `"use client"`. Selected suspicious boundaries:

| File | Necessary? | Why it exists | JS Impact | Notes |
|------|-----------|--------------|-----------|-------|
| `app/admin/layout.tsx` | PARTIALLY | `usePathname`, sidebar `useState` | HIGH | Forces all admin children to client bundle |
| `AboutClient.tsx` | NO | Scroll animations (`useRef`/`useEffect`) | MEDIUM | CSS animations would eliminate this |
| `PrivacyClient.tsx` | NO | Same | MEDIUM | Same |
| `ReturnPolicyClient.tsx` | NO | Same | MEDIUM | Same |
| `PaymentClient.tsx` | PARTIALLY | Some interactive elements | MEDIUM | Split needed |
| `ClientLayout.tsx` | YES | `usePathname` for layout hide/show | MEDIUM | Required |
| `Navbar.tsx` | YES | Search, cart, mobile menu | MEDIUM | Required |
| `ProductCard.tsx` | YES | `useState`, `useRouter` | MEDIUM | Required |
| `ProductGrid.tsx` | PARTIALLY | `useMemo` only | MEDIUM | Could pass computed data from server |
| `ShopByCategory.tsx` | VERIFY | — | LOW | Check if any interactivity is needed |
| `Footer.tsx` | NO | Static Server Component | None | **Already a Server Component ✓** |

---

## PHASE 16 — IMAGE PERFORMANCE

### CRITICAL: `favicon.svg` is 1,031 KB

**Path:** `public/favicon.svg`

Expected favicon size: 1–5 KB. This file is **206× larger than it should be**. Every new visitor downloads 1 MB just for the favicon before it is cached. The file likely contains embedded raster image data within the SVG.

### Public Asset Size Audit

| File | Size | Issue |
|------|------|-------|
| `favicon.svg` | 1,031 KB | **CRITICAL — investigate and optimize** |
| `iphone.webp` | 369 KB | Large hero — verify if served via `next/image` |
| `mac.webp` | 330 KB | Large |
| `watch.webp` | 190 KB | Large |
| `apple-only.webp` | 172 KB | Large |
| `og-preview.png` | 151 KB | — |
| `og-image.png` | 151 KB | **DUPLICATE of og-preview.png** |
| `money-icon.webp` | 63.6 KB | Oversized — should be SVG (~0.3 KB) |
| `b93e06bd-....jpg` | 100 KB | UUID name — likely orphaned |

### `money-icon.webp` — Raw `<img>` Usage

Used as:
```html
<img src="/money-icon.webp" style={{ width: 22, height: 22 }} />
```
Across: `checkout/page.tsx`, `cart/page.tsx`, `admin/orders/[id]/page.tsx`, multiple print pages.

Issues:
1. Bypasses Next.js image optimization (no AVIF/WebP conversion, no responsive sizes)
2. 63.6 KB for what should be a ~0.3 KB SVG icon
3. Some instances lack explicit `width`/`height` → potential layout shift

### Next.js Image Config (POSITIVE)

```ts
images: {
  qualities: [75, 80],
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 86400,
  deviceSizes: [640, 828, 1080, 1200],
}
```
Well configured. AVIF + WebP, 24-hour cache TTL.

### AdminNavbar Logo

```tsx
<Image src={logo} ... unoptimized priority />
```
`unoptimized` bypasses Next.js image processing. `priority` adds a preload hint on every admin page regardless of whether the logo is above the fold.

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
- `next/font/google` — self-hosted at build time, no runtime CDN request
- `display: "swap"` — correct fallback behavior
- Only 3 weights — reasonable for Arabic UI
- No blocking external font load

---

## PHASE 18 — THIRD-PARTY SCRIPTS

| Script | Strategy | Risk |
|--------|----------|------|
| `@vercel/analytics` | `<Analytics />` — deferred | Low |
| FingerprintJS | Dynamic import | Low |
| Google Maps SDK | Lazily injected in `AddressMap.tsx` (checkout only) | Low |
| Saudi Business seal | `<div data-token>` in Footer — external script strategy unknown | **MEDIUM** |

### Saudi Business Seal Risk

```html
<div class="sbc-verify-seal" data-token="MStxS0d2Q1pNbVF0ZkhEVitKdkd6UT09" data-position="bottom-left" />
```

The seal requires an external script to render. If that script is synchronous and not `async`/`defer`, it will block parsing of the footer. Verify with browser DevTools Network tab.

---

## PHASE 19 — PROVIDERS

| Provider | Scope | Re-render Risk |
|----------|-------|---------------|
| `useCartStore` (Zustand persist) | App-wide | LOW — selector subscriptions |
| `useCompanyStore` (Zustand) | Admin-wide | LOW — selector subscriptions |
| `ClientLayout` | Root | MEDIUM — `usePathname` re-renders on every navigation |
| No React Context at root | — | None |

**No `QueryClientProvider`, no Redux, no global Recoil.** Clean architecture.

### companyStore Redundancy

`companyStore.fetchCompany()` fetches `/api/company` client-side in AdminNavbar. The company data (logo, whatsapp) is already fetched server-side in `app/layout.tsx` and passed as props `initialLogo` and `whatsapp` to `ClientLayout`. The Zustand store is a client-side duplicate of server-available data.

---

## PHASE 20 — AUTHENTICATION LOAD

| Check | Where | Backend call? | Frequency |
|-------|-------|--------------|-----------|
| Token cookie presence | `middleware.ts` | **No** | Every matched request |
| Admin redirect | `middleware.ts` | **No** | Every admin request |
| JWT validation | Backend (via `forwardCookies`) | **Yes** | Every admin API call |
| Company logo fetch | `AdminNavbar.tsx` useEffect | **Yes** | Every admin page mount |
| Orders count | `AdminNavbar.tsx` useEffect | **Yes** | Every admin page mount |

**Backend calls per admin page load:**
```
Middleware:          0 backend calls (cookie read only) ✓
AdminNavbar mount:   1 × GET /api/company → backend
                     1 × GET /api/admin/orders?limit=1 → backend
Page-specific:       1 × page data fetch
Total:               3 backend calls per admin page navigation
```

**Backend calls per public page load:**
```
Middleware: 0
Page:       0 (all ISR cached)
Total:      0 ✓  Excellent
```

---

## PHASE 21 — MIDDLEWARE AUDIT

**File:** `middleware.ts`

```ts
matcher: ["/((?!api|_next/static|_next/image|_next/data|favicon|.*\\.(?:webp|png|...)).*)",]
```

**Assessment: WELL CONFIGURED**
- Static assets correctly excluded
- `_next/static`, `_next/image`, `_next/data` excluded
- Font, CSS, JS, image extensions excluded

**Operations per request:**
1. HTTPS redirect check (header read)
2. Cookie read for `admin_token`
3. Pathname comparison
4. CSP header array `.join("; ")` — ~500-byte string built fresh each request
5. Security headers written

The CSP string is constructed from an array on every request. This is minor but could be a module-level constant.

**No database calls. No HTTP calls in middleware.**

---

## PHASE 22 — CACHING AUDIT

| Data | Strategy | TTL | Risk |
|------|---------|-----|------|
| Company (server) | `unstable_cache` + tag:company | Indefinite (force) | Good — invalidated by admin mutation |
| All products (server) | `unstable_cache` + tag:products | 120 s | Good |
| Products by category (server) | `unstable_cache` per query key | 120 s | Good |
| Single product (server) | `unstable_cache` per ID | 120 s | Good |
| Reviews (server) | `unstable_cache` + tag:reviews | 3600 s | Good |
| Company (client, Zustand) | None | Session | **Refetches on every mount** |
| Google Maps autocomplete | `no-store` at proxy | 0 | **Should be ~5 min** |
| Google Maps place details | `no-store` at proxy | 0 | **Should be 24 h (place_id is stable)** |
| `/api/products` (CDN) | `s-maxage=60` | 60 s | Good |
| `/api/company` (CDN) | `s-maxage=3600` | 3600 s | Good |
| Admin routes | `force-dynamic` | 0 | Correct |
| `sub-categories-home` | `force-dynamic` | 0 | **Data rarely changes — could be ISR** |

---

## PHASE 23 — ROUTE TRANSITIONS

- `<Link>` prefetching: In Next.js 15, prefetch on hover loads the static HTML for ISR pages — no serverless invocation
- Admin routes (CSR): prefetch loads the JS bundle only, no API calls triggered
- `router.push()`: Used in `ProductCard`, `ProductInfoClient`, admin pages — intentional navigations
- **No `router.refresh()` calls found anywhere** ✓ — no client-initiated cache busting

---

## PHASE 24 — CART AUDIT

| Operation | Backend calls | Notes |
|-----------|-------------|-------|
| Add item | **0** | Zustand + localStorage |
| Remove item | **0** | Same |
| Update quantity | **0** | Same |
| View cart page | **0** | Read from localStorage |
| Load cart | **0** | Zustand persist |
| Proceed to checkout | **0** | Cart from Zustand |

**Cart backend load: ZERO. This is optimal.**

`MinimalProduct` interface strips unused fields before storing in localStorage — good for storage efficiency. `cartKey` deduplication (`_id|color|storage`) correctly handles product variants.

---

## PHASE 25 — CHECKOUT FLOW AUDIT

### Complete Request Chain

```
1. User opens /checkout
   → 0 API calls (cart from Zustand, customer from localStorage)

2. Customer info section
   → 0 API calls (client-side validation only)

3. Address section — map mode
   → User types address (3 natural pauses at 400ms debounce):
     → 3× GET /api/places?type=autocomplete  [3 serverless, 3 Google API, no-store]
   → User selects suggestion:
     → 1× GET /api/places?type=details  [1 serverless, 1 Google API, no-store]

4. Shipping company selection
   → 0 API calls (static list in SHIPPING_COMPANIES array)

5a. COD submit (handleOrder)
    → POST /api/notify
      → POST BACKEND/api/checkout  (DB persist)
      → GET ip-api.com/json/[ip]   (geo, async)
      → POST Telegram×N            (async fire-and-forget)

5b. Card submit (handleCardSubmit)
    → POST /api/notify  (same flow as 5a)
    → Push to /checkout/verify

6. OTP verification (/checkout/verify)
   → POST /api/verify  (per attempt, up to 6×)
   → POST /api/resend  (if timer expires, optional)

Total per card checkout:
  Google API: 3–5 autocomplete + 1 details = 4–6 calls
  Backend: 1 (DB persist) + 1–6 (OTP verify) + 0–1 (resend) = 2–8
  Grand total backend operations: 6–14
```

### Duplicate Submit Guard

`handleCardSubmit` uses `submittingRef.current` — **correctly prevents double-submit** ✓

`handleOrder` (COD) uses `blocked` rate-limit state — acceptable protection ✓

---

## PHASE 26 — ADMIN PAGES AUDIT

### Admin Orders Page

| Aspect | Finding | Risk |
|--------|---------|------|
| Initial load | 1 paginated fetch | Low |
| Pagination | Re-fetch per page change | Low |
| Search | 400ms debounce + AbortController | Good |
| After delete | Local state removal — **no refetch** ✓ | Good |
| After status change | Optimistic update — **no refetch** ✓ | Good |
| Pagination buttons | All buttons in DOM | Low–Medium |

### Admin Products Page

Server-driven pagination (page size 20), debounced search (400ms), AbortController, optimistic delete. **No performance issues identified.**

### Admin Order Detail

Single fetch on mount (`/api/admin/orders/[id]`). Two `PUT` calls for save/status — correct, no refetch needed.

### Admin Print / Invoice / Receipt / Contract Pages

**Critical issue:** Every document page independently fetches company data:

```
Opening all 4 documents for one order:
/print       → 1× order + 1× company = 2 serverless invocations
/invoice     → 1× order + 1× company = 2 serverless invocations
/receipt     → 1× order             = 1 serverless invocation
/contract    → 1× order             = 1 serverless invocation
Total: 7 serverless invocations, 6 backend calls for 1 order's documents
```

### Admin Cancellation Page (Worst Case)

```
/cancellation → 1× order + 1× company + N× product (serial)
For a 3-item order: 5 serial backend calls, 5 MongoDB queries
```

---

## PHASE 27 — DEAD CODE CANDIDATES

> Candidates only — do NOT delete without verification.

| File | Confidence | Reason |
|------|-----------|--------|
| `public/og-image.png` | HIGH | Same size (151 KB) as `og-preview.png` — likely duplicate |
| `public/b93e06bd-....jpg` | HIGH | UUID filename, 100 KB — no import found in codebase |
| `public/06550573-....webp` | HIGH | UUID filename, 7.6 KB — no import found |
| `public/site copy.webmanifest` | HIGH | Duplicate of `site.webmanifest` |
| `frontend/fix-prices.mjs` | HIGH | Root-level one-time migration script |
| `frontend/update-category-pages.mjs` | HIGH | Root-level one-time script |
| `frontend/test-homepage.mjs` | HIGH | Test script in repo root |
| `frontend/test-notify.mjs` | HIGH | Test script in repo root |
| `frontend/temp_fb.html` | HIGH | Temporary file |
| `frontend/temp_og.html` | HIGH | Temporary file |
| `frontend/temp_og2.html` | HIGH | Temporary file |
| `frontend/proxy.ts` | MEDIUM | Root-level proxy, unclear if used in build |
| `app/components/CategoryLandingClient.tsx` | MEDIUM | No import found in quick scan |

---

## PHASE 28 — PACKAGE AUDIT

| Package | Issue |
|---------|-------|
| `card-validator` + `credit-card-type` | `card-validator` already wraps `credit-card-type` — having both is redundant |
| `@playwright/test` + `playwright` (both in devDeps) | `@playwright/test` includes Playwright — separate `playwright` entry is redundant |
| `jsonwebtoken` | Heavy (~25 KB). If only used in API routes, `jose` is lighter and edge-compatible |
| `jest` + `ts-jest` | Present but only one test file found in the repository |
| `sharp` | Required for Next.js image optimization on Vercel — keep |
| `critters` | Inlines critical CSS at build — good optimization, correct |

---

## PHASE 29 — REQUEST BUDGET

### Homepage (ISR warm — most visits)
```
API calls:               0 (served from static/CDN)
Server invocations:      0
Duplicate calls:         0
CPU risk:                LOW
```

### Homepage (ISR miss — every 120 s)
```
Server:  getCompany (1 cache call), getAllProductsWithBanners (1), getHomeConfig (2), getReviews (1)
Backend: 0–5 (all unstable_cache — hits backend only on first miss)
Client:  0
Potentially avoidable:   getCompany called twice in layout
Server invocations:      1
CPU risk:                LOW (all cached after first miss)
```

### Category Page (warm)
```
API calls:               0
Client:                  0
Memory:                  100 products in JS heap
CPU risk:                LOW (server), MEDIUM (client memory)
```

### Product Page (warm)
```
API calls:               0
Client:                  0
CPU risk:                LOW
```

### Admin Page Load (any)
```
API calls:               3 (company + orders count + page data)
Duplicate calls:         1 (company already server-available)
Potentially avoidable:   2 (company + orders count)
Server invocations:      3
CPU risk:                MEDIUM
```

### Checkout (card + map address)
```
API calls:               4–6 Google + 1 order persist + 1–6 OTP = 6–13
Duplicate calls:         0
Potentially avoidable:   3–5 (Google Maps caching)
Server invocations:      6–13
CPU risk:                MEDIUM
```

### Admin Orders Page
```
Initial:                 3 (company + count + orders list)
Per search:              1 (debounced, previous cancelled)
Per page change:         1
Per status update:       1 (optimistic, no refetch)
Per delete:              0 (local state)
CPU risk:                MEDIUM
```

---

## PHASE 30 — CPU RISK MAP

### 1. favicon.svg — 1,031 KB
**File:** `public/favicon.svg`
**Triggered:** Every new visitor's first page load
**Impact:** Browser downloads, parses, and renders a 1 MB SVG
**Severity: CRITICAL** (INFERRED)

### 2. AdminNavbar — 2 uncached API calls on every admin page
**File:** `app/admin/components/AdminNavbar.tsx`
**Triggered:** Every admin page navigation
**Endpoints:** `GET /api/company`, `GET /api/admin/orders?limit=1`
**Impact:** 2 serverless invocations + 2 backend DB queries per page
**Severity: HIGH** (INFERRED)

### 3. Google Maps place details — no caching
**File:** `app/api/places/route.ts`
**Triggered:** Every address selection in checkout
**Impact:** Serverless invocation + Google API call per address (billed)
**Severity: HIGH** (INFERRED)

### 4. Category pages — 100 products in client memory
**File:** `app/(categories)/[slug]/CategoryPageClient.tsx`
**Triggered:** Any category page load
**Impact:** ~70–80 KB hydrated into memory, client-side computation on each page change
**Severity: HIGH** (INFERRED)

### 5. Admin print pages — company duplicates
**Files:** `print, invoice, cancellation, PrintPage`
**Triggered:** Opening print documents for any order
**Impact:** 3–4 serverless invocations + DB queries just for company logo/info
**Severity: HIGH** (INFERRED)

### 6. ShopByDevice — 1-second setInterval
**File:** `app/components/ShopByDevice.tsx`
**Triggered:** Homepage, while user is on page
**Impact:** React re-render every 1 second — continuous CPU and battery drain on mobile
**Severity: MEDIUM** (INFERRED)

### 7. AddressMap — 200ms SDK polling
**File:** `app/components/address/AddressMap.tsx`
**Triggered:** Checkout address section open
**Impact:** Fires every 200 ms until SDK loads; if SDK fails, runs indefinitely
**Severity: MEDIUM** (INFERRED)

### 8. money-icon.webp via raw `<img>`
**Files:** checkout, cart, admin pages (10+ locations)
**Triggered:** Any page with price display
**Impact:** 63.6 KB unoptimized image, no lazy loading, no AVIF/WebP conversion
**Severity: MEDIUM** (INFERRED)

---

## PHASE 31 — REQUEST AMPLIFICATION

### Admin — Opening One Order's Print Documents
```
1 order → open print + invoice + receipt + contract (4 new tabs)
  → print:      GET /api/admin/orders/[id] + GET /api/admin/company
  → invoice:    GET /api/admin/orders/[id] + GET /api/admin/company
  → receipt:    GET /api/admin/orders/[id]
  → contract:   GET /api/admin/orders/[id]
Backend operations: 7 (4 order fetches + 2 company fetches + 1 orders count from navbar)
User action → backend amplification: 1 → 7
```

### Checkout Address Selection
```
1 address typed (12 chars) → 3 autocomplete requests + 1 detail request
  → 4 serverless invocations
  → 4 Google Maps API calls (billed per call)
User action → amplification: 1 → 8 backend operations
```

### Admin Page Navigation
```
Admin navigates to any page
  → AdminNavbar: GET /api/company + GET /api/admin/orders?limit=1
  → Page: GET /api/admin/[resource]
User action → amplification: 1 → 3
```

---

## PHASE 32 — COLD START RISK

| Route | Heavy imports | Cold start risk |
|-------|--------------|----------------|
| `api/notify/route.ts` | None at top level; uses only `fetch()` | LOW |
| `api/places/route.ts` | None | LOW |
| `api/admin/*` | `forwardCookies`, `getBackend` (tiny) | LOW |
| `api/products/route.ts` | `productsCache` (cache module) | LOW |

`jsonwebtoken` is in dependencies. If imported in a hot API route, it adds ~25 KB to the cold start bundle. Verify actual import path — not found in hot-path routes during audit.

`react-phone-number-input` (~30 KB) is not dynamically imported. If used in checkout (CSR page), it is included in the checkout page JS bundle, not a server route — low cold start impact.

---

## PHASE 33 — STATIC ASSET AUDIT

| Asset | Size | Issue | Action Candidate |
|-------|------|-------|-----------------|
| `favicon.svg` | 1,031 KB | **CRITICAL** — 206× expected | Investigate, optimize to <5 KB |
| `iphone.webp` | 369 KB | Large public asset | Verify if served via `next/image` |
| `mac.webp` | 330 KB | Large | Same |
| `og-image.png` | 151 KB | **DUPLICATE** of og-preview.png | Remove one |
| `og-preview.png` | 151 KB | — | Keep the correct one |
| `money-icon.webp` | 63.6 KB | Should be SVG | Replace with inline SVG (~0.3 KB) |
| `b93e06bd-....jpg` | 100 KB | UUID-named, orphaned | Verify and remove if unused |
| `06550573-....webp` | 7.6 KB | UUID-named, orphaned | Verify and remove if unused |
| `site copy.webmanifest` | 0.5 KB | Duplicate manifest | Remove |
| `temp_fb.html` | — | Temp file | Remove |
| `temp_og.html` | — | Temp file | Remove |
| `temp_og2.html` | — | Temp file | Remove |

---

## PHASE 34 — BUILD ANALYSIS (INFERRED)

Build was not run during this audit (read-only). The following is inferred from `next.config.ts`:

**Optimizations active:**
- `optimizeCss: true` — inlines critical CSS via `critters`
- `optimizePackageImports` for 4 major libraries
- `removeConsole` in production
- `compress: true` — gzip/brotli
- `poweredByHeader: false`

**Expected route types:**
- Static/ISR: homepage, category pages, product pages
- Dynamic: all `/api/*`, all admin pages (CSR JS bundles)

**Build risk:** `getAllProductsWithBanners()` calls the backend during build. If the backend is unavailable at build time, the empty-products fallback path bypasses cache and would make every homepage request hit the backend directly.

---

## PHASE 35 — LINT / TYPE CHECK (INFERRED)

Build/lint not run during audit. Code-level findings:

**ESLint disable comments found:**
```ts
// eslint-disable-next-line react-hooks/set-state-in-effect
// Banner.tsx — setState inside effect (hydration guard pattern — valid)

// eslint-disable-next-line react-hooks/exhaustive-deps
// AddressSection.tsx — missing onShippingSelect in dep array (stale closure risk)
```

The `AddressSection.tsx` disabled exhaustive-deps suppresses a real warning. The `onShippingSelect` prop is not in the dependency array of the localStorage restore effect, meaning if the prop reference changes the effect will not re-run. This is low severity for the specific use case but indicates a technical debt.

---

## TOP 20 PERFORMANCE PROBLEMS

| Priority | Severity | File | Problem | Backend Impact | CPU Impact |
|----------|----------|------|---------|---------------|-----------|
| 1 | CRITICAL | `public/favicon.svg` | 1,031 KB favicon served to every visitor | LOW | HIGH (browser parse) |
| 2 | HIGH | `admin/components/AdminNavbar.tsx` | 2 uncached API calls on every admin page mount | HIGH | MEDIUM |
| 3 | HIGH | `api/places/route.ts` | `cache: "no-store"` on Google Maps — no caching on place details | MEDIUM | MEDIUM |
| 4 | HIGH | `(categories)/[slug]/CategoryPageClient.tsx` | 100 products loaded into client memory, client-side pagination | LOW | MEDIUM |
| 5 | HIGH | `admin/orders/[id]/cancellation/page.tsx` | N serial product fetches per order item on mount | HIGH | MEDIUM |
| 6 | HIGH | Print pages (print, invoice, cancellation, PrintPage) | Each independently fetches `/api/admin/company` — 3–4 duplicate calls per print session | HIGH | LOW |
| 7 | HIGH | `public/money-icon.webp` | 63.6 KB icon used via raw `<img>` in 10+ components, bypassing optimization | LOW | MEDIUM (network) |
| 8 | MEDIUM | `components/ShopByDevice.tsx` | `setInterval(1000ms)` — 1 re-render per second on homepage | LOW | MEDIUM (client CPU) |
| 9 | MEDIUM | `components/address/AddressMap.tsx` | `setInterval(200ms)` polling for Google Maps SDK readiness | LOW | LOW |
| 10 | MEDIUM | `components/address/AddressSearch.tsx` | No AbortController on autocomplete — stale responses can overwrite results | LOW | LOW |
| 11 | MEDIUM | `app/admin/layout.tsx` | `"use client"` forces entire admin subtree into client JS bundle | LOW | MEDIUM (JS bundle) |
| 12 | MEDIUM | `lib/productsCache.ts` | `getAllProductsWithBanners` cache-bypass fallback on empty result | HIGH (failure mode) | HIGH (failure mode) |
| 13 | MEDIUM | `app/layout.tsx` | `getCompany()` called twice (metadata + render) | LOW | LOW |
| 14 | MEDIUM | `admin/orders/page.tsx` | All pagination buttons rendered in DOM (hidden on mobile via CSS) | LOW | LOW |
| 15 | MEDIUM | `store/companyStore.ts` | Client-side `fetchCompany()` duplicates server-available data | MEDIUM | LOW |
| 16 | MEDIUM | `AboutClient, PrivacyClient, ReturnPolicyClient` | Static content pages using `"use client"` for CSS animations | LOW | MEDIUM (JS bundle) |
| 17 | MEDIUM | `public/og-image.png` + `og-preview.png` | Duplicate 151 KB files — 302 KB wasted | LOW | LOW |
| 18 | LOW | `checkout/verify/page.tsx` | Up to 6 OTP verify attempts — 6 serverless invocations per failed checkout | MEDIUM | LOW |
| 19 | LOW | `api/sub-categories-home/route.ts` | `force-dynamic` on rarely-changing data — could use ISR | MEDIUM | LOW |
| 20 | LOW | `public/` folder | 5+ temp/orphaned files (UUID assets, temp HTMLs, duplicate manifest) | LOW | LOW |

---

## PAGE PERFORMANCE MATRIX

| Page | Mode | API Calls (warm) | API Calls (cold) | Duplicate Calls | Payload Risk | Client CPU | Server CPU | Overall Risk |
|------|------|-----------------|-----------------|----------------|-------------|-----------|-----------|-------------|
| `/` Homepage | ISR 120s | 0 | 5 (cached) | getCompany ×2 | LOW | MEDIUM (1s interval) | LOW | LOW |
| `/product/[id]` | ISR 120s | 0 | 3 (cached) | getCompany ×2 | LOW | LOW | LOW | LOW |
| `/(categories)/[slug]` | ISR 120s | 0 | 2 (cached) | None | MEDIUM (100 products) | MEDIUM | LOW | MEDIUM |
| `/cart` | CSR | 0 | 0 | None | LOW | LOW | LOW | LOW |
| `/checkout` | CSR | 4–6 (Google) | 4–6 | None | LOW | LOW | MEDIUM | MEDIUM |
| `/checkout/verify` | CSR | 1–6 | 1–6 | None | LOW | LOW | LOW | LOW |
| `/search` | CSR | 1 | 1 | Navbar possible | LOW | LOW | LOW | LOW |
| `/admin/*` (any) | CSR | 3+ | 3+ | Company ×1 | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/products` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders/[id]` | CSR | 3 | 3 | Company | LOW | LOW | MEDIUM | MEDIUM |
| `/admin/orders/[id]/print` | CSR | 4 | 4 | Company ×1 | LOW | LOW | HIGH | HIGH |
| `/admin/orders/[id]/invoice` | CSR | 4 | 4 | Company ×1 | LOW | LOW | HIGH | HIGH |
| `/admin/orders/[id]/cancellation` | CSR | 3+N | 3+N | Company ×1, products serial | MEDIUM | LOW | HIGH | HIGH |

---

## REQUEST FLOW DIAGRAMS

### Homepage — ISR Warm (>99% of visits)
```
Browser ──► CDN / Edge ──► Cached HTML (static)
               │
               └──► Client hydrates ──► 0 API calls
```

### Homepage — ISR Miss (every 120 s)
```
Browser ──► Next.js Serverless Function
              │
              ├──► getCompany()                [unstable_cache miss]
              │      └──► BACKEND /api/admin/company ──► MongoDB
              │
              ├──► getAllProductsWithBanners()  [unstable_cache miss]
              │      ├──► BACKEND /api/products ──► MongoDB
              │      └──► BACKEND /api/admin/category-banners-bulk ──► MongoDB
              │
              └──► getHomeConfig()             [unstable_cache miss]
                     ├──► BACKEND /api/admin/sub-categories/home-settings ──► MongoDB
                     └──► BACKEND /api/admin/sub-categories/max ──► MongoDB
              
Total: 1 serverless invocation, 5 backend calls, 5 DB queries
Then cached for 120 s — next 119 s of requests: 0 backend calls
```

### Admin Orders Page Load
```
Browser ──► Next.js (CSR bundle loads)
              │
              ├── AdminNavbar mounts
              │     ├──► GET /api/company ──► Next.js Function ──► BACKEND ──► MongoDB
              │     └──► GET /api/admin/orders?limit=1 ──► Next.js Function ──► BACKEND ──► MongoDB
              │
              └── OrdersPage mounts
                    └──► GET /api/admin/orders?page=1&limit=10 ──► Next.js Function ──► BACKEND ──► MongoDB

Total per admin page load: 3 serverless invocations, 3 backend calls, 3 DB queries
```

### Checkout — Card Payment with Map Address
```
Browser ──► /checkout (CSR, 0 API calls)
              │
              ├── User types address (3 pauses)
              │     ├──► GET /api/places?autocomplete ──► Next.js ──► Google Maps API (×3)
              │
              ├── User selects address
              │     └──► GET /api/places?details ──► Next.js ──► Google Maps API (×1, no-store)
              │
              ├── User submits card
              │     └──► POST /api/notify
              │               ├──► POST BACKEND/api/checkout ──► MongoDB (persist)
              │               ├──► GET ip-api.com/json/[ip]   (async, geo)
              │               └──► POST Telegram Bot ×N       (async, fire-and-forget)
              │
              └── Browser ──► /checkout/verify
                    └── User enters OTP (up to 6 attempts)
                          └──► POST /api/verify ──► Next.js ──► BACKEND ──► MongoDB (×1–6)

Total: 4 Google API calls + 1 DB persist + 1–6 DB verifications = 6–11 backend operations
```

---

## PERFORMANCE SCORECARD

| Area | Score /100 | Basis |
|------|-----------|-------|
| **Frontend Rendering** | 82 | ISR correctly used for all public pages; admin correctly CSR. Deducted for static info pages (about, privacy) using `"use client"` unnecessarily |
| **Network Efficiency** | 63 | Good CDN/ISR coverage for public pages. Deducted for 1,031 KB favicon (-15), 63.6 KB icon via raw `<img>` (-8), 100 KB+ orphaned assets (-4), duplicate OG images (-4), unoptimized admin logo (-6) |
| **API Efficiency** | 70 | Good: debounce everywhere, AbortController on search, targeted state updates after mutations. Deducted for Google Maps no-store (-10), serial product fetches in cancellation (-8), admin company duplication (-7), users double-fetch (-5) |
| **Backend Request Efficiency** | 68 | Public pages generate near-zero backend load (excellent ISR). Deducted for 2 redundant admin calls per page (-12), print pages N+1 company fetches (-10), orders count on every page (-5), cache-bypass fallback (-5) |
| **Caching** | 75 | `unstable_cache` used properly server-side. CDN headers correct on public API routes. Deducted for Google Maps no-store (-12), Zustand company store no TTL (-8), `sub-categories-home` force-dynamic (-5) |
| **Serverless Efficiency** | 72 | Public pages: 0 invocations when warm (excellent). Admin reasonable. Deducted for 2 redundant admin navbar invocations per page (-12), Google Maps no-store invocations (-10), print page duplication (-6) |
| **Bundle Efficiency** | 63 | `optimizePackageImports` configured. Dynamic imports for AddressMap and FingerprintJS. Deducted for admin layout `"use client"` forcing all children to client (-15), 100+ client boundaries (-12), static pages as client components (-10) |
| **React Efficiency** | 74 | No global Context re-render issues. Good `useMemo`/`useCallback` in product components. Deducted for 1-second setInterval (-10), 200ms polling in AddressMap (-8), all pagination buttons in DOM (-5), `normalizeProductForCard` in render body (-3) |

> **All scores are based on static code analysis and architecture review.**  
> **Production profiling (Lighthouse, Vercel Speed Insights, React DevTools Profiler) is required to validate these scores with real data.**

---

*Audit completed: September 21, 2026 — READ ONLY — Zero code modifications made.*
