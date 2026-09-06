import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "عن لمسه للاجهزه الذكيه",
  description: "تعرف على نشاط المتجر ورؤيتنا والخدمات التي نقدمها لعملائنا",
};

export default function AboutPage() {
  return <AboutClient />;
}
