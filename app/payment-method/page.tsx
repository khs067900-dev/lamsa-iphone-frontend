"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoChevronBack, IoWalletOutline, IoCalendarOutline, IoCheckmarkCircle } from "react-icons/io5";
import CheckoutStepper from "../components/CheckoutStepper";
import { useCartStore } from "../store/cartStore";
import { LoadingOverlay } from "../checkout/CheckoutModals";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function PaymentMethodPage() {
  const router = useRouter();
  const { items, customer, totalPrice, totalItems, setCustomer } = useCartStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const total = mounted ? totalPrice() : 0;
  const itemCount = mounted ? totalItems() : 0;
  const installmentMonths = mounted ? Math.max(...items.map((i) => i.product.installment?.months ?? 0)) || 24 : 24;

  const MONTHS_OPTIONS = Array.from({ length: installmentMonths }, (_, i) => i + 1);
  const minDownPayment = 1000 * itemCount;
  const DOWN_PAYMENT_OPTIONS = [minDownPayment, minDownPayment + 500, minDownPayment + 1000];

  const [installmentType, setInstallmentType] = useState<"full" | "installment">(customer?.installmentType ?? "installment");
  const [months, setMonths] = useState(customer?.months ?? 24);
  const [downPaymentExtra, setDownPaymentExtra] = useState<number>(0);
  const downPayment = minDownPayment + downPaymentExtra;
  const [transitioning, setTransitioning] = useState(false);

  const monthlyPayment = useMemo(() => {
    if (installmentType === "full") return 0;
    const remaining = total - downPayment;
    return remaining > 0 ? Math.ceil(remaining / months) : 0;
  }, [total, months, installmentType, downPayment]);

  const schedule = useMemo(() => {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return { index: i + 1, date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, amount: monthlyPayment };
    });
  }, [months, monthlyPayment]);

  if (!mounted) return null;

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleNext = async () => {
    setCustomer({ name: "", nationalId: "", whatsapp: "", address: "", ...customer, installmentType, months, downPayment });
    setTransitioning(true);
    await new Promise(r => setTimeout(r, 2500));
    router.push("/checkout");
  };

  const inputBase = "w-full h-11 rounded-lg px-4 text-sm font-medium focus:outline-none transition";

  return (
    <main className="min-h-screen pb-10" dir="rtl" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
      <LoadingOverlay show={transitioning} title="جاري الانتقال للطلب" />
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(188,146,85,0.15)" }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1 text-sm font-bold transition hover:opacity-70" style={{ color: "#A77D4B" }}>
            <IoChevronBack size={18} />
            السلة
          </Link>
          <h1 className="text-sm font-black flex items-center gap-1.5" style={{ color: "#0A1825" }}>
            <IoWalletOutline size={14} style={{ color: "#BC9255" }} />
            طريقة السداد
          </h1>
          <Link href="/" className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}>
            الرئيسية
          </Link>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="max-w-5xl mx-auto px-4">
        <CheckoutStepper active="method" />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid rgba(188,146,85,0.12)" }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.12)" }}>
            <IoWalletOutline size={16} style={{ color: "#BC9255" }} />
            <span className="text-xs font-bold" style={{ color: "#0A1825" }}>طريقة السداد</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(188,146,85,0.25)" }}>
              <button
                type="button"
                onClick={() => setInstallmentType("full")}
                className="flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: installmentType === "full" ? "rgba(188,146,85,0.12)" : "#fff",
                  color: installmentType === "full" ? "#0A1825" : "#A77D4B",
                }}
              >
                {installmentType === "full" && <IoCheckmarkCircle size={14} style={{ color: "#BC9255" }} />}
                كاش
              </button>
              <button
                type="button"
                onClick={() => setInstallmentType("installment")}
                className="flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: installmentType === "installment" ? "rgba(188,146,85,0.12)" : "#fff",
                  color: installmentType === "installment" ? "#0A1825" : "#A77D4B",
                }}
              >
                {installmentType === "installment" && <IoCheckmarkCircle size={14} style={{ color: "#BC9255" }} />}
                تقسيط
              </button>
            </div>

            {installmentType === "installment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>عدد الأشهر</label>
                    <select
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                      className={`${inputBase} cursor-pointer`}
                      style={{ backgroundColor: "#faf7f2", border: "1.5px solid rgba(188,146,85,0.2)", color: "#0A1825" }}
                    >
                      {MONTHS_OPTIONS.map((m) => <option key={m} value={m}>{m} شهر</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>الدفعة الأولى</label>
                    <select
                      value={String(downPaymentExtra)}
                      onChange={(e) => setDownPaymentExtra(Number(e.target.value))}
                      className={`${inputBase} cursor-pointer`}
                      style={{ backgroundColor: "#faf7f2", border: "1.5px solid rgba(188,146,85,0.2)", color: "#0A1825" }}
                    >
                      {DOWN_PAYMENT_OPTIONS.map((v) => <option key={v} value={v - minDownPayment}>{fmt(v)} ر.س</option>)}
                      <option value={total - minDownPayment}>كامل ({fmt(total)})</option>
                    </select>
                  </div>
                </div>

                {/* Monthly highlight */}
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(188,146,85,0.08)", border: "1.5px solid rgba(188,146,85,0.2)" }}>
                  <p className="text-[10px] mb-1" style={{ color: "#A77D4B" }}>القسط الشهري</p>
                  <p className="text-2xl font-black flex items-center justify-center gap-1" style={{ color: "#0A1825" }}>{fmt(monthlyPayment)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-5 h-5" /></p>
                </div>

                {/* Schedule */}
                {months > 0 && (
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(188,146,85,0.15)" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.1)" }}>
                      <IoCalendarOutline size={13} style={{ color: "#BC9255" }} />
                      <span className="text-xs font-bold" style={{ color: "#0A1825" }}>جدول السداد</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {schedule.map((row, i) => (
                        <div
                          key={row.index}
                          className="flex items-center justify-between px-4 py-2 text-xs"
                          style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.06)" }}
                        >
                          <span className="font-bold w-6" style={{ color: "#A77D4B" }}>{row.index}</span>
                          <span style={{ color: "#0A1825" }}>{row.date}</span>
                          <span className="font-bold flex items-center gap-0.5" style={{ color: "#0A1825" }}>{fmt(row.amount)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => router.push("/cart")}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold transition hover:opacity-80"
            style={{ backgroundColor: "rgba(188,146,85,0.08)", color: "#A77D4B", border: "1px solid rgba(188,146,85,0.2)" }}
          >
            السابق
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: "#BC9255", color: "#fff" }}
          >
            التالي ←
          </button>
        </div>
      </div>
    </main>
  );
}
