"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import { Toaster } from "react-hot-toast";

interface ClientLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  initialLogo?: string;
  whatsapp?: string;
}

export default function ClientLayout({ children, footer, initialLogo, whatsapp }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isFilePage = pathname.startsWith("/file");
  const isSecretPanel = pathname.startsWith("/secret-panel");
  const hideLayout = isAdmin || isFilePage || isSecretPanel;

  return (
    <>
      <Toaster position="top-center" />
      {!hideLayout && <Navbar companyLogo={initialLogo} />}
      {children}
      {!hideLayout && footer}
      {!hideLayout && <WhatsappButton whatsapp={whatsapp} />}
    </>
  );
}
