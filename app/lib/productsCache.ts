import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,network,price";

export const getAllProducts = unstable_cache(
  async () => {
    const r = await fetch(
      `${BACKEND}/api/products?page=1&limit=2000&fields=${FIELDS}`,
      { next: { tags: ["products"] } }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : (data.products ?? []);
  },
  ["all-products"],
  { revalidate: false, tags: ["products"] }
);

export async function getProductById(id: string) {
  const products = await getAllProducts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (products as any[]).find((p) => p._id === id) ?? null;
}
