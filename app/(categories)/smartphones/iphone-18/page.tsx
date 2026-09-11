import type { Metadata } from "next";
import IPhone18Hero from "./IPhone18Hero";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import ComingSoon from "./ComingSoon";
import { getAllProducts } from "../../../lib/productsCache";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "iPhone 18 | لمسه للاجهزه الذكيه",
  description:
    "iPhone 18 الجيل الجديد كلياً من أبل — تصميم ثوري وأداء لا مثيل له مع أحدث معالج A19 وكاميرات من الجيل القادم",
};

const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00"
);

const SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

export default async function IPhone18Page() {
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

  const products = await getAllProducts();
  return (
    <>
      <IPhone18Hero />
      <PhoneHeroPage
        slug="iphone-18"
        heroImage=""
        nameEn="iPhone 18"
        tagline="قوة جديدة. تجربة جديدة."
        description="iPhone 18 يجمع بين تصميم Unibody الثوري، معالج A20 Pro، وكاميرا 48MP Fusion — الجيل القادم من Apple."
        features={[
          { icon: "chip", label: "معالج A20 Pro" },
          { icon: "camera", label: "كاميرا 48MP Fusion" },
          { icon: "battery", label: "+6 ساعات بطارية" },
        ]}
        initialProducts={products}
        hideHero
      />
    </>
  );
}
