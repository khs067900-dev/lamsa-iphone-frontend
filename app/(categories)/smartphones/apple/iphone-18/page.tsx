import type { Metadata } from "next";
import IPhone18StandardHero from "./IPhone18StandardHero";
import IPhone18StandardProducts from "./IPhone18StandardProducts";
import ComingSoon from "../../iphone-18/ComingSoon";
import { getProductsByCategory } from "../../../../lib/productsCache";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "iPhone 18 | لمسه للاجهزه الذكيه",
  description:
    "iPhone 18 الجيل الجديد — تصميم Unibody ثوري، معالج A20 Pro، وكاميرا 48MP Fusion حصرياً على لمسه",
};

const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00"
);

const SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

// الـ slugs للمنتجات الثلاثة المعروضة في الصفحة
const FEATURED_SLUGS = ["iphone-18-pro-max", "iphone-18-pro", "iphone-18-duo"] as const;

export default async function IPhone18StandardPage() {
  const isOver = RESERVATION_DATE.getTime() <= new Date().getTime();

  if (!isOver) {
    return (
      <ComingSoon
        modelName="iPhone 18"
        slides={SLIDES}
        reservationDate={RESERVATION_DATE.toISOString()}
      />
    );
  }

  // Fetch all iPhone 18 products (pro max, pro, duo) — IPhone18StandardProducts
  // filters client-side per slug so we fetch the parent category broadly
  const result = await getProductsByCategory({
    category: "ابل ايفون 18",
    limit: 100,
    sort: "storage-asc",
  });
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }} dir="rtl">
      <IPhone18StandardHero />
      <IPhone18StandardProducts
        allProducts={result.products}
        featuredSlugs={FEATURED_SLUGS}
      />
    </main>
  );
}
