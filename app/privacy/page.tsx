import type { Metadata } from "next";
import { getCompany, SITE_URL } from "../lib/config";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "الشروط العامة المنظمة لاستخدام موقع لمسه للاجهزه الذكيه وسياسة حماية بيانات العملاء",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "سياسة الخصوصية | لمسه للأجهزة الذكية",
    description: "الشروط العامة المنظمة لاستخدام موقع لمسه للاجهزه الذكيه وسياسة حماية بيانات العملاء",
    url: `${SITE_URL}/privacy`,
    locale: "ar_SA",
  },
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const company = await getCompany();
  return (
    <PrivacyClient
      nameAr={company.nameAr || ""}
      addressAr={company.addressAr || ""}
      phone={company.phone || ""}
      whatsapp={company.whatsapp || ""}
      email={company.email || ""}
      taxNumber={company.taxNumber || ""}
    />
  );
}
