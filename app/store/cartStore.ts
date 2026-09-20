import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  product: Product;
  qty: number;
  cartKey: string; // _id|color|storage
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  months: number;
  downPayment: number;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  addItem: (product: Product) => void;
  removeItem: (cartKey: string) => void;
  updateQty: (cartKey: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      addItem: (product) =>
        set((s) => {
          const cartKey = `${product._id}|${product.color ?? ""}|${product.storage ?? ""}`;
          const existing = s.items.find((i) => i.cartKey === cartKey);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          return { items: [...s.items, { product, qty: 1, cartKey }] };
        }),
      removeItem: (cartKey) =>
        set((s) => ({ items: s.items.filter((i) => i.cartKey !== cartKey) })),
      updateQty: (cartKey, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.cartKey !== cartKey)
              : s.items.map((i) =>
                  i.cartKey === cartKey ? { ...i, qty } : i
                ),
        })),
      setCustomer: (info) => set({ customer: info }),
      clear: () => set({ items: [], customer: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.salePrice ?? i.product.originalPrice ?? i.product.price) * i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
