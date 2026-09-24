import { Suspense } from "react";
import { sortProducts, sortByPriceAsc } from "./lib/sortProducts";
import { Banner } from "./components/banner";
import { ProductGrid } from "./components/products";
import { getAllProductsWithBanners, BACKEND } from "./lib/productsCache";
import { getCompany } from "./lib/config";

import CustomerReviews from "./components/CustomerReviews";
import ShopByCategory from "./components/ShopByCategory";

const SITE_URL = "https://lamsasmart.com";

async function getHomeConfig() {
  try {
    const [settingsRes, maxRes] = await Promise.all([
      fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, { next: { revalidate: 300, tags: ["home-config"] } }),
      fetch(`${BACKEND}/api/admin/sub-categories/max`, { next: { revalidate: 300, tags: ["home-config"] } }),
    ]);
    const settings = settingsRes.ok ? await settingsRes.json() : [];
    const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
    return { settings, max: maxData.max ?? 4 };
  } catch {
    return { settings: [], max: 4 };
  }
}

// Enable static generation with ISR
export const revalidate = 120; // Revalidate every 2 minutes
export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function Home() {
  const [c, { products, bannerMap }, homeConfig] = await Promise.all([
    getCompany(),
    getAllProductsWithBanners(),
    getHomeConfig(),
  ]);

  const selectedCategories = homeConfig.settings
    .filter((s: { showInHome: boolean }) => s.showInHome)
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .slice(0, Math.max(0, homeConfig.max));
  const homeProducts = selectedCategories.flatMap((setting: { category: string; subCategory: string }) => {
    const cat = setting.category || setting.subCategory;
    const filtered = products.filter((p) => (p.category || p.subCategory) === cat);
    const isIPhone18Cat = cat.includes("18");
    return (isIPhone18Cat ? sortByPriceAsc(filtered) : sortProducts(filtered)).slice(0, 4);
  }).filter((p: { _id: string }, i: number, all: { _id: string }[]) => all.findIndex((other) => other._id === p._id) === i);
  const homeBanners = Object.fromEntries(Object.entries(bannerMap).filter(([category]) => homeProducts.some((p: { category?: string; subCategory?: string }) => (p.category || p.subCategory) === category)));

  const siteName = c.nameAr || "لمسه للاجهزه الذكيه";
  const logoUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${BACKEND}${c.logo}`)
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: c.nameEn || "Lamsah Smart Devices",
    url: SITE_URL,
    logo: logoUrl,
    contactPoint: [
      c.phone && {
        "@type": "ContactPoint",
        telephone: c.phone,
        contactType: "customer service",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
      c.whatsapp && {
        "@type": "ContactPoint",
        telephone: c.whatsapp,
        contactType: "sales",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
    ].filter(Boolean),
    address: c.addressAr ? {
      "@type": "PostalAddress",
      addressLocality: c.addressAr,
      addressCountry: "SA",
    } : undefined,
    email: c.email || undefined,
    sameAs: c.website ? [c.website] : [],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-[#f5f0e8]/30">
        <Banner />
        <ShopByCategory />
        <div id="products">
          <ProductGrid initialProducts={homeProducts} initialHomeConfig={homeConfig} initialBannerMap={homeBanners} companyLogo={logoUrl} />
        </div>
        <Suspense fallback={<div className="min-h-80" />}><CustomerReviews /></Suspense>
      </main>
    </>
  );
}
