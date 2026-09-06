import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع",
  description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل لمسه للاجهزه الذكيه",
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
