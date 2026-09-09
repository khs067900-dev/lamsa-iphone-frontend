import type { Metadata } from "next";
import IPhone18Hero from "./IPhone18Hero";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 18 | لمسه للاجهزه الذكيه",
  description:
    "iPhone 18 الجيل الجديد كلياً من أبل — تصميم ثوري وأداء لا مثيل له مع أحدث معالج A19 وكاميرات من الجيل القادم",
};

export default async function IPhone18Page() {
  const products = await getAllProducts();
  return (
    <>
      <IPhone18Hero />
      <PhoneHeroPage
        slug="iphone-18"
        heroImage=""
        nameEn="iPhone 18"
        tagline=""
        description=""
        features={[]}
        initialProducts={products}
        hideHero
      />
    </>
  );
}
