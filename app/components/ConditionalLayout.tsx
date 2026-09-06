import Footer from "./Footer";
import ClientLayout from "./ClientLayout";
import { headers } from "next/headers";

export default async function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
  const isAdmin = pathname.startsWith("/admin");
  const isSecretPanel = pathname.startsWith("/secret-panel");

  return (
    <ClientLayout footer={!isAdmin && !isSecretPanel ? <Footer /> : null}>
      {children}
    </ClientLayout>
  );
}
