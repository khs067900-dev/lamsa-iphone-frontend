import type { ProductVariant } from "../products/types";

export const PRE_ORDER_DEPOSIT = 1000;

export const fmt = (n: number) => n.toLocaleString("en-US");
export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const resolveImg = (src: string) => src?.startsWith("http") ? src : `${API}${src}`;

export const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#BC9255] transition bg-white";

export interface PreOrderProduct {
  _id: string;
  name: string;
  image?: string;
  variants?: ProductVariant[];
  price: number;
}

export type Step = "variant" | "info" | "deposit" | "paying" | "payment" | "verify";
