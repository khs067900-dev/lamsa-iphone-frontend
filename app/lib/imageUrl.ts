const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Checks if a URL is hosted on Cloudinary
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("res.cloudinary.com");
}

/**
 * Resolves any relative or backend path to a full URL
 */
export function resolveImageUrl(src?: string | null): string {
  if (!src || typeof src !== "string") return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  return `${BACKEND_API}${cleanSrc}`;
}

interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "pad" | "limit" | "scale" | string;
  quality?: string | number;
}

/**
 * Injects Cloudinary transformations directly at the CDN layer (f_auto, q_auto, w_*, etc.)
 * This offloads 100% of image resizing/compression from the hosting server to Cloudinary CDN.
 */
export function getOptimizedImageUrl(url?: string | null, options: ImageTransformOptions = {}): string {
  if (!url || typeof url !== "string") return "";
  const resolved = resolveImageUrl(url);
  if (!isCloudinaryUrl(resolved)) return resolved;

  // Match: https://res.cloudinary.com/<cloud_name>/image/upload/(optional existing transforms/)(optional v123/)(public_id)
  const regex = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:(?:c_[^,/]+|w_\d+|h_\d+|q_[^,/]+|f_[^,/]+)[^/]*\/)?(?:v\d+\/)?(.*)$/;
  const match = resolved.match(regex);
  if (!match) return resolved;

  const prefix = match[1];
  const publicId = match[2];

  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  transforms.push(`q_${options.quality || "auto"}`);
  transforms.push("f_auto");

  return `${prefix}${transforms.join(",")}/${publicId}`;
}

export function getThumbnailUrl(url?: string | null, size = 140): string {
  return getOptimizedImageUrl(url, { width: size, height: size, crop: "pad" });
}

export function getMainImageUrl(url?: string | null, width = 900): string {
  return getOptimizedImageUrl(url, { width, crop: "limit" });
}
