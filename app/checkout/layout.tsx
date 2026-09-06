import type { Metadata } from "next";

const SITE_URL = "https://lamsah-aldhaqiah.com";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل عملية الشراء وادفع بأمان.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/checkout` },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
