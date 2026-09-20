import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";
import { getCompany, SITE_URL } from "../lib/config";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع",
  description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل لمسه للاجهزه الذكيه",
  alternates: { canonical: `${SITE_URL}/return-policy` },
  openGraph: {
    title: "سياسة الاستبدال والاسترجاع | لمسه للأجهزة الذكية",
    description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل لمسه للاجهزه الذكيه",
    url: `${SITE_URL}/return-policy`,
    locale: "ar_SA",
  },
  robots: { index: true, follow: true },
};

export default async function ReturnPolicyPage() {
  const company = await getCompany();
  return (
    <ReturnPolicyClient
      whatsapp={company.whatsapp || ""}
      email={company.email || ""}
      phone={company.phone || ""}
    />
  );
}
