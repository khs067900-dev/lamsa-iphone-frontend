import { Banner } from "./components/banner";
import { ProductGrid } from "./components/products";
import dynamic from "next/dynamic";
import { getAllProductsWithBanners, BACKEND } from "./lib/productsCache";
import { getCompany } from "./lib/config";
import CustomerReviews from "./components/CustomerReviews";

const ShopByCategory = dynamic(() => import("./components/ShopByCategory"));

const SITE_URL = "https://lamsasmart.com";

async function getHomeConfig() {
  try {
    const [settingsRes, maxRes] = await Promise.all([
      fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, { next: { revalidate: 300 } }),
      fetch(`${BACKEND}/api/admin/sub-categories/max`, { next: { revalidate: 300 } }),
    ]);
    const settings = settingsRes.ok ? await settingsRes.json() : [];
    const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
    return { settings, max: maxData.max ?? 4 };
  } catch {
    return { settings: [], max: 4 };
  }
}

export default async function Home() {
  const [c, { products, bannerMap }, homeConfig] = await Promise.all([
    getCompany(),
    getAllProductsWithBanners(),
    getHomeConfig(),
  ]);

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
          <ProductGrid initialProducts={products} initialHomeConfig={homeConfig} initialBannerMap={bannerMap} />
        </div>
        <CustomerReviews />
      </main>
    </>
  );
}
