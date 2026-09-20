import { unstable_cache } from "next/cache";
import { BACKEND } from "./productsCache";

export const SITE_URL = "https://lamsasmart.com";

export const getCompany = unstable_cache(
  async () => {
    try {
      const r = await fetch(`${BACKEND}/api/admin/company`, {
        next: { revalidate: false, tags: ["company"] },
      });
      return r.ok ? r.json() : {};
    } catch {
      return {};
    }
  },
  ["company"],
  { revalidate: false, tags: ["company"] }
);
