import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCompany } from "../lib/config";

export const metadata: Metadata = { title: "طرق الدفع" };

export default async function PaymentPage() {
  const company = await getCompany();
  return <PaymentClient company={company} />;
}
