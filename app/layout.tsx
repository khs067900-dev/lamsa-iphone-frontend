import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCompany } from "./lib/config";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://lamsasmart.com";
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompany();

  const siteName = c.nameAr || "لمسه للاجهزه الذكيه";
  const description = c.details || "متجر لمسه للاجهزه الذكيه - أجهزة إلكترونية بالأقساط داخل المملكة العربية السعودية. أفضل الأسعار على الجوالات، اللابتوبات، الأجهزة اللوحية والإكسسوارات.";
  const ogImage = `${SITE_URL}/og-preview.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      siteName,
      c.nameEn || "Lamsah Smart Devices",
      "أقساط", "جوالات", "لابتوب", "أجهزة إلكترونية",
      "سامسونج", "آبل", "أيفون", "شاومي", "هواوي", "أوبو",
      "السعودية", "الرياض", "جدة", "مكة", "الدمام",
      "شراء بالتقسيط", "أقساط بدون فوائد", "متجر إلكتروني",
      "لمسه للاجهزه الذكيه", "لمسة الذكية",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: siteName,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical: SITE_URL,
      languages: { "ar-SA": SITE_URL },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
    category: "electronics",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const c = await getCompany();
  
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="antialiased" suppressHydrationWarning>
        <ClientLayout initialLogo={c.logo || ""} whatsapp={c.whatsapp} footer={<Footer />}>{children}</ClientLayout>

        <Analytics />
      </body>
    </html>
  );
}
