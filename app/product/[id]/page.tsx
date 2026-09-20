import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductById, BACKEND } from "../../lib/productsCache";
import { SITE_URL, getCompany } from "../../lib/config";
import ProductHeader from "./components/ProductHeader";
import ProductGallery from "./components/ProductGallery";
import ProductInfoClient from "./components/ProductInfoClient";
import ProductDetails from "./components/ProductDetails";
import ProductSections from "./components/ProductSections";
import { notFound } from "next/navigation";

function validateId(id: string) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

async function getProduct(id: string) {
  if (!validateId(id)) return null;
  return getProductById(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // Both calls hit unstable_cache — no duplicate DB queries
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
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  return {
    title,
    description,
    keywords: [product.name, product.brand || "", product.category || "", "أقساط", "شراء", siteName].filter(Boolean),
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
    alternates: { canonical: `${SITE_URL}/product/${id}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Parallel fetch — both hit cache, zero extra DB queries vs generateMetadata
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  if (!product) notFound();

  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  const price = product.salePrice || product.price || 0;
  const rawImg = product.images?.[0] || product.image || "";
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  const jsonLd = {
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
      price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteName },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-4">

          {/* ── Header: Server Component (no JS) ── */}
          <ProductHeader productName={product.name} category={product.category} />

          {/* ── Critical Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

            {/* Images */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-4 shadow-xl" style={{ border: "1px solid #EBE6E2" }}>
                <ProductGallery product={product} hasVariants={Boolean(product.variants?.length)} />
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-5">
              <h2 className="hidden lg:block text-2xl xl:text-3xl font-black mb-5 leading-snug" style={{ color: "#1F2C3E" }}>
                {product.name}
              </h2>
              {/* Single Client Component — handles variants, cart, price */}
              <ProductInfoClient product={product} />
            </div>
          </div>

          {/* ── Secondary Content (non-blocking) ── */}
          {!/ايفون 18|iphone 18/i.test(product.category ?? "") && (
            <div className="mt-6">
              <ProductDetails
                installment={product.installment}
                description={product.description}
                specs={product.specs}
                specGroups={product.specGroups}
              />
            </div>
          )}

          <Suspense fallback={<div className="h-20" />}>
            <ProductSections sections={product.sections} />
          </Suspense>
        </div>

        <div className="h-10" />
      </main>
    </>
  );
}
