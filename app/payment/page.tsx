import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCompany, SITE_URL } from "../lib/config";

export const metadata: Metadata = {
  title: "طرق الدفع",
  description: "طرق دفع متعددة وآمنة في لمسه للأجهزة الذكية — مدى، بطاقات ائتمان، وأقساط بدون فوائد",
  alternates: { canonical: `${SITE_URL}/payment` },
  openGraph: {
    title: "طرق الدفع | لمسه للأجهزة الذكية",
    description: "طرق دفع متعددة وآمنة — مدى، بطاقات ائتمان، وأقساط بدون فوائد",
    url: `${SITE_URL}/payment`,
    locale: "ar_SA",
  },
  robots: { index: true, follow: true },
};

export default async function PaymentPage() {
  const company = await getCompany();
  return <PaymentClient company={company} />;
}
