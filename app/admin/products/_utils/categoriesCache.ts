/**
 * In-memory client cache for admin product categories.
 * Prevents re-fetching the categories list on every navigation
 * between products listing, new product, and edit product pages.
 */

export type SubCat = { name: string; category: string; count: number };

let cachedCategories: SubCat[] | null = null;
let cacheTimestamp = 0;
let pendingFetch: Promise<SubCat[]> | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function getSubCategoriesCached(forceRefresh = false): Promise<SubCat[]> {
  const now = Date.now();
  if (!forceRefresh && cachedCategories && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCategories;
  }

  if (pendingFetch && !forceRefresh) {
    return pendingFetch;
  }

  pendingFetch = fetch("/api/admin/sub-categories", { credentials: "include" })
    .then((r) => (r.ok ? r.json() : []))
    .then((data: SubCat[]) => {
      const validData = Array.isArray(data) ? data : [];
      cachedCategories = validData;
      cacheTimestamp = Date.now();
      pendingFetch = null;
      return validData;
    })
    .catch(() => {
      pendingFetch = null;
      return cachedCategories || [];
    });

  return pendingFetch;
}

export function invalidateCategoriesCache() {
  cachedCategories = null;
  cacheTimestamp = 0;
  pendingFetch = null;
}
