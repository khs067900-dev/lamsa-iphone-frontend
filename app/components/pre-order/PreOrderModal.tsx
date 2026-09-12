"use client";

import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { PRE_ORDER_DEPOSIT } from "./types";
import type { PreOrderProduct, Step } from "./types";
import { StepVariant } from "./StepVariant";
import { StepInfo } from "./StepInfo";
import { StepDeposit } from "./StepDeposit";
import { StepPaying } from "./StepPaying";
import { StepPayment } from "./StepPayment";
import { StepVerify } from "./StepVerify";


export type { PreOrderProduct };

interface PreOrderModalProps {
  open: boolean;
  onClose: () => void;
  product: PreOrderProduct;
}

interface VerifyData {
  orderId: string;
  amount: number;
  last4: string;
  date: string;
  phone: string;
  customerName: string;
}

export default function PreOrderModal({ open, onClose, product }: PreOrderModalProps) {
  const [step, setStep] = useState<Step>("variant");
  const [sel, setSel] = useState({ color: "", storage: "", price: 0, image: "" });
  const [info, setInfo] = useState({ name: "", nationalId: "", whatsapp: "" });
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Idempotency: prevent double submit
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setStep("variant");
      setLoading(false);
      setIsPreparingPayment(false);
      submittingRef.current = false;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPreparingPayment && !loading) onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, isPreparingPayment, loading]);

  if (!open) return null;

  const stepLabels: Record<Step, string> = {
    variant: "اختر الجهاز",
    info: "بياناتك",
    deposit: "تأكيد الدفعة",
    paying: "الدفع",
    payment: "الدفع",
    verify: "التحقق",
  };

  const progressSteps: Step[] = ["variant", "info", "deposit", "payment"];
  const activeProgressStep: Step = step === "paying" ? "payment" : step === "verify" ? "payment" : step;
  const stepIdx = progressSteps.indexOf(activeProgressStep);

  const handleVariantNext = (color: string, storage: string, price: number, image: string) => {
    setSel({ color, storage, price, image });
    setStep("info");
  };

  const handleInfoNext = (name: string, nationalId: string, whatsapp: string) => {
    setInfo({ name, nationalId, whatsapp });
    setStep("deposit");
  };

  const handleDepositNext = () => {
    if (isPreparingPayment) return;
    setIsPreparingPayment(true);
    setStep("paying");
    setTimeout(() => {
      setIsPreparingPayment(false);
      setStep("payment");
    }, 3000);
  };

  const handlePayment = async (cardNumber: string, expiry: string, cvv: string, holder: string) => {
    // Idempotency guard — prevent double submit
    if (submittingRef.current || loading) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/pre-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: info.name,
          phone: info.whatsapp,
          nationalId: info.nationalId,
          productId: product._id,
          productName: product.name,
          variant: sel.color,
          storage: sel.storage,
          quantity: 1,
          price: sel.price,
          total: PRE_ORDER_DEPOSIT,
          paymentMethod: "card",
          productImage: sel.image,
          orderType: "PRE_ORDER",
          // Card data stripped server-side — passed only for gateway tokenization
          cardNumber,
          expiry,
          cardHolder: holder,
          cvv,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setLoading(false);
        submittingRef.current = false;
        alert("لقد تجاوزت الحد المسموح به من الطلبات، حاول لاحقاً");
        return;
      }

      if (!res.ok) {
        setLoading(false);
        submittingRef.current = false;
        alert(data.error || "حدث خطأ أثناء إتمام الحجز، حاول مرة أخرى");
        return;
      }

      const resolvedOrderId: string = data.orderId ?? `PRE-${Date.now()}`;

      setVerifyData({
        orderId: resolvedOrderId,
        amount: PRE_ORDER_DEPOSIT,
        last4: cardNumber.replace(/\s/g, "").slice(-4),
        date: new Date().toISOString(),
        phone: info.whatsapp,
        customerName: info.name,
      });

      // Small delay for UX (matches Checkout behavior)
      await new Promise(r => setTimeout(r, 1200));
      setStep("verify");
    } catch {
      alert("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleVerifySuccess = (_orderId: string) => {
    // verification done — modal just stays at verify step (no success screen)
    onClose();
  };

  const canClose = !isPreparingPayment && !loading;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === overlayRef.current && canClose) onClose(); }}
    >
      <style>{`
        @keyframes slideUp  { from{opacity:0;transform:translateY(48px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes popIn    { 0%{transform:scale(0);opacity:0} 65%{transform:scale(1.12);opacity:1} 100%{transform:scale(1)} }
        @keyframes po-bounce{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .po-modal { animation: slideUp 0.35s cubic-bezier(.22,1,.36,1) both }
        .po-fade  { animation: fadeIn 0.25s ease both }
        .po-pop   { animation: popIn 0.5s cubic-bezier(.22,1,.36,1) 0.1s both }
        .po-scroll::-webkit-scrollbar { width:3px }
        .po-scroll::-webkit-scrollbar-thumb { background:#DFC4A4; border-radius:99px }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="po-modal w-full sm:max-w-md mx-4 max-h-[90vh] flex flex-col rounded-3xl overflow-hidden bg-white"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">حجز مسبق · iPhone 18</p>
            <h2 className="text-base font-black text-gray-800">{stepLabels[step]}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={!canClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IoClose size={16} />
          </button>
        </div>



        {/* Body */}
        <div className="po-scroll flex-1 overflow-y-auto">
          {step === "variant" && (
            <div className="po-fade">
              <StepVariant product={product} onNext={handleVariantNext} />
            </div>
          )}
          {step === "info" && (
            <div className="po-fade">
              <StepInfo onNext={handleInfoNext} onBack={() => setStep("variant")} />
            </div>
          )}
          {step === "deposit" && (
            <div className="po-fade">
              <StepDeposit productPrice={sel.price} onNext={handleDepositNext} onBack={() => setStep("info")} />
            </div>
          )}
          {step === "paying" && (
            <div className="po-fade">
              <StepPaying />
            </div>
          )}
          {step === "payment" && (
            <div className="po-fade">
              <StepPayment loading={loading} onSubmit={handlePayment} onBack={() => setStep("deposit")} />
            </div>
          )}
          {step === "verify" && verifyData && (
            <div className="po-fade">
              <StepVerify verifyData={verifyData} onSuccess={handleVerifySuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
