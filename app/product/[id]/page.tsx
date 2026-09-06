import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";
import { getProductById } from "../../lib/productsCache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://lamsah-aldhaqiah.com";

async function getProduct(id: string) {
  return getProductById(id);
}

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 3600 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  if (!product) {
    return { title: "المنتج غير موجود" };
  }

  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  const title = product.name;

  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.storage) parts.push(product.storage);
  if (product.color) parts.push(product.color);
  if (product.salePrice || product.price) {
    const price = product.salePrice || product.price;
    parts.push(`${price} ريال`);
  }
  if (product.installment?.available) parts.push("بالأقساط");

  const description = product.description
    ? product.description.slice(0, 160)
    : `${title}${parts.length ? " - " + parts.join(" | ") : ""} - متوفر في ${siteName}`;

  const rawImg = product.images?.[0] || product.image || "";
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand || "",
      product.category || "",
      "أقساط", "شراء", siteName,
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/product/${id}`,
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: title }] : [],
      siteName,
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  const price = product?.salePrice || product?.price || 0;
  const rawImg = product?.images?.[0] || product?.image || "";
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: imageUrl,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${id}`,
      priceCurrency: "SAR",
      price: price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteName },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient id={id} initialProduct={product} />
    </>
  );
}
