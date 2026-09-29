import { unstable_cache } from "next/cache";
import dynamic from "next/dynamic";
import { BACKEND } from "../lib/productsCache";

const CustomerReviewsClient = dynamic(() => import("./CustomerReviewsClient"), {
  loading: () => <div className="min-h-80" />,
});

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
