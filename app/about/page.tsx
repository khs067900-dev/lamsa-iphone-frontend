import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getCompany, SITE_URL } from "../lib/config";

export const metadata: Metadata = {
  title: "عن لمسه للاجهزه الذكيه",
  description: "تعرف على نشاط المتجر ورؤيتنا والخدمات التي نقدمها لعملائنا في لمسه للأجهزة الذكية",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "عن لمسه للاجهزه الذكيه",
    description: "تعرف على نشاط المتجر ورؤيتنا والخدمات التي نقدمها لعملائنا في لمسه للأجهزة الذكية",
    url: `${SITE_URL}/about`,
    locale: "ar_SA",
  },
  robots: { index: true, follow: true },
};

export default async function AboutPage() {
  const company = await getCompany();
  return <AboutClient whatsapp={company.whatsapp || ""} email={company.email || ""} />;
}
