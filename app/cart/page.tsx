"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoCartOutline, IoChevronBack } from "react-icons/io5";
import { useCartStore } from "../store/cartStore";
import CartItem from "./components/CartItem";

const fmt = (n: number) => n.toLocaleString("en-US");
const subscribe = (cb: () => void) => { cb(); return () => {}; };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCartStore();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const total = mounted ? totalPrice() : 0;
  const count = mounted ? totalItems() : 0;

  if (!mounted) return null;

  if (items.length === 0)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" dir="rtl" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
        <div className="text-center space-y-5">
          <div className="w-28 h-28 mx-auto rounded-3xl rotate-6 flex items-center justify-center" style={{ backgroundColor: "rgba(188,146,85,0.08)", border: "2px dashed rgba(188,146,85,0.3)" }}>
            <IoCartOutline size={48} style={{ color: "#BC9255" }} className="-rotate-6" />
          </div>
          <h2 className="text-2xl font-black" style={{ color: "#0A1825" }}>سلتك فاضية!</h2>
          <p className="text-sm" style={{ color: "#A77D4B" }}>ابدأ التسوق واضف منتجاتك المفضلة</p>
          <button
            onClick={() => router.push("/")}
            className="px-10 py-3.5 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#BC9255", color: "#fff" }}
          >
            ابدأ التسوق
          </button>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen pb-4 lg:pb-8" dir="rtl" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(188,146,85,0.15)" }}>
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs font-bold transition hover:opacity-70" style={{ color: "#A77D4B" }}>
            <IoChevronBack size={16} />
            رجوع
          </button>
          <h1 className="text-xs font-black" style={{ color: "#0A1825" }}>سلة التسوق</h1>
          <Link href="/" className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}>
            الرئيسية
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 py-3 space-y-3">

        {/* Cart Items */}
        <div className="flex items-center gap-2 mb-1">
          <IoCartOutline size={16} style={{ color: "#BC9255" }} />
          <h2 className="text-sm font-black" style={{ color: "#0A1825" }}>منتجاتك</h2>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}>{count}</span>
        </div>
        <div className="space-y-2">
          {items.map(({ product, qty }) => (
            <CartItem key={product._id} product={product} qty={qty} onUpdateQty={updateQty} onRemove={removeItem} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: "#faf7f2", border: "1px solid rgba(188,146,85,0.15)" }}>
          <p className="text-xs font-bold" style={{ color: "#A77D4B" }}>ملخص الطلب</p>
          {items.map(({ product, qty }) => {
            const price = product.salePrice ?? product.originalPrice ?? product.price;
            return (
              <div key={product._id} className="flex justify-between text-xs" style={{ color: "#0A1825" }}>
                <span className="truncate max-w-[60%]">{product.name}{qty > 1 && <span className="mr-1" style={{ color: "#A77D4B" }}>×{qty}</span>}</span>
                <span className="font-bold flex items-center gap-0.5">{fmt(price * qty)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
              </div>
            );
          })}
          <div className="flex justify-between text-xs pt-2" style={{ borderTop: "1px solid rgba(188,146,85,0.2)", color: "#A77D4B" }}>
            <span>الشحن</span>
            <span className="font-bold" style={{ color: "#BC9255" }}>مجاني</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-black" style={{ color: "#0A1825" }}>الإجمالي</span>
            <span className="text-lg font-black flex items-center gap-1" style={{ color: "#BC9255" }}>{fmt(total)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-5 h-5" /></span>
          </div>
        </div>

        <button
          onClick={() => router.push("/payment-method")}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#BC9255", color: "#fff" }}
        >
          إتمام الطلب
        </button>

      </div>

    </main>
  );
}
