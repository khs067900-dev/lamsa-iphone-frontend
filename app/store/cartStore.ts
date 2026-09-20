import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

// Minimal product interface for cart - reduces localStorage size by 60-80%
export interface MinimalProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  salePrice?: number;
  image?: string;
  images?: string[];
  color?: string;
  storage?: string;
  discountPercent?: number;
}

export interface CartItem {
  product: MinimalProduct;
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
  addItem: (product: Product | MinimalProduct) => void;
  removeItem: (cartKey: string) => void;
  updateQty: (cartKey: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// Helper to convert full Product to MinimalProduct
function toMinimalProduct(product: Product | MinimalProduct): MinimalProduct {
  return {
    _id: product._id,
    name: product.name,
    price: product.price || product.salePrice || product.originalPrice,
    originalPrice: product.originalPrice,
    salePrice: product.salePrice,
    image: product.image,
    images: product.images,
    color: product.color,
    storage: product.storage,
    discountPercent: product.discountPercent,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      addItem: (product) =>
        set((s) => {
          const minimalProduct = toMinimalProduct(product);
          const cartKey = `${minimalProduct._id}|${minimalProduct.color ?? ""}|${minimalProduct.storage ?? ""}`;
          const existing = s.items.find((i) => i.cartKey === cartKey);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          return { items: [...s.items, { product: minimalProduct, qty: 1, cartKey }] };
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
