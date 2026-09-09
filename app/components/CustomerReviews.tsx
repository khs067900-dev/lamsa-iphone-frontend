import { unstable_cache } from "next/cache";
import { BACKEND } from "../lib/productsCache";
import CustomerReviewsClient from "./CustomerReviewsClient";

const getReviews = unstable_cache(
  async () => {
    try {
      const r = await fetch(`${BACKEND}/api/admin/reviews`, {
        next: { tags: ["reviews"] },
      });
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  ["reviews"],
  { revalidate: 3600, tags: ["reviews"] }
);

export default async function CustomerReviews() {
  const reviews = await getReviews();
  return <CustomerReviewsClient initialReviews={reviews} />;
}
