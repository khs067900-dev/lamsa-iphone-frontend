import { slugConfigs } from "./categoryConfig";

/**
 * Convert slug config to API parameters for the new optimized endpoint
 */
export function getApiParamsForSlug(slug: string) {
  const config = slugConfigs[slug];
  if (!config) return null;
  
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  
  return {
    category,
    brand,
    nameIncludes,
    nameExcludes,
  };
}
