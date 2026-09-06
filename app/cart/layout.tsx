import type { Metadata } from "next";

const SITE_URL = "https://lamsah-aldhaqiah.com";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "راجع منتجاتك وأكمل طلبك بسهولة.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/cart` },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
