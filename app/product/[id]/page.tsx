import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getProductById, BACKEND } from "../../lib/productsCache";
import { SITE_URL, getCompany } from "../../lib/config";
import { getMainImageUrl } from "../../lib/imageUrl";
import ProductHeader from "./components/ProductHeader";
import ProductClientWrapper from "./components/ProductClientWrapper";
import ProductDetails from "./components/ProductDetails";

// Code-split heavy interactive marketing sections (with framer-motion)
const ProductSections = dynamic(() => import("./components/ProductSections"), {
  ssr: true,
  loading: () => <div className="h-20" />,
});

function validateId(id: string) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

async function getProduct(id: string) {
  if (!validateId(id)) return null;
  return getProductById(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // Memoized via React cache — concurrent deduplication with ProductPage
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  if (!product) return { title: "المنتج غير موجود" };

  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  const title = product.name;
  const price = product.salePrice || product.price;
  const parts = [
    product.brand,
    product.storage,
    product.color,
    price ? `${price} ريال` : null,
    product.installment?.available ? "بالأقساط" : null,
  ].filter(Boolean);

  const description = product.description
    ? product.description.slice(0, 160)
    : `${title}${parts.length ? " - " + parts.join(" | ") : ""} - متوفر في ${siteName}`;

  const rawImg = product.images?.[0] || product.image || "";
  const resolvedImg = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";
  const imageUrl = getMainImageUrl(resolvedImg, 1200);

  return {
    title,
    description,
    keywords: [product.name, product.brand || "", product.category || "", "أقساط", "شراء", siteName].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/product/${id}`,
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
      siteName,
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: { canonical: `${SITE_URL}/product/${id}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Parallel fetch — hits React request cache, 0 duplicate DB or network calls
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  if (!product) notFound();

  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  const price = product.salePrice || product.price || 0;
  const rawImg = product.images?.[0] || product.image || "";
  const resolvedImg = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";
  const imageUrl = getMainImageUrl(resolvedImg, 1000);

  const hasDetails = Boolean(
    product.description ||
    (product.specs && Object.values(product.specs).some(Boolean)) ||
    (product.specGroups && product.specGroups.length > 0) ||
    product.installment?.available
  );

  const hasSections = Boolean(product.sections && product.sections.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: imageUrl,
    sku: product._id,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${id}`,
      priceCurrency: "SAR",
      price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteName },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-4">

          {/* ── Header: Server Component (no client JS) ── */}
          <ProductHeader productName={product.name} category={product.category} />

          {/* ── Critical Above-The-Fold Grid (LCP priority) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            <ProductClientWrapper product={product} />
          </div>

          {/* ── Specifications, Description & Installment Tabs ── */}
          {hasDetails && (
            <div className="mt-6">
              <ProductDetails
                installment={product.installment}
                description={product.description}
                specs={product.specs}
                specGroups={product.specGroups}
              />
            </div>
          )}

          {/* ── Visual Marketing Sections (Dynamically code-split, rendered only when available) ── */}
          {hasSections && (
            <Suspense fallback={<div className="h-20" />}>
              <ProductSections sections={product.sections} />
            </Suspense>
          )}
        </div>

        <div className="h-10" />
      </main>
    </>
  );
}
