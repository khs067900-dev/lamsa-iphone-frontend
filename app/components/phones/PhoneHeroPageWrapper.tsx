import PhoneHeroPage, { PhoneHeroPageProps } from "./PhoneHeroPage";
import { getProductsByCategory } from "../../lib/productsCache";
import { slugConfigs } from "../../lib/categoryConfig";

/**
 * Server Component wrapper for PhoneHeroPage that fetches filtered products
 * This eliminates the need to fetch ALL products and filter client-side
 */
export default async function PhoneHeroPageWrapper(
  props: Omit<PhoneHeroPageProps, "initialProducts"> & { slug: string }
) {
  const { slug, ...rest } = props;
  const config = slugConfigs[slug];
  const filters = config?.filters || {};

  // Fetch only the products we need, already filtered and sorted
  const result = await getProductsByCategory({
    category: filters.category,
    brand: filters.brand,
    nameIncludes: filters.nameIncludes,
    nameExcludes: filters.nameExcludes,
    limit: 100,
    sort: "storage-asc",
  });

  return <PhoneHeroPage {...rest} slug={slug} initialProducts={result.products} />;
}
