"use client";

import { IoShieldCheckmark, IoCardOutline, IoCubeOutline } from "react-icons/io5";
import { fmt, PRE_ORDER_DEPOSIT } from "./types";

export function StepDeposit({ productPrice, onNext, onBack }: {
  productPrice: number;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
      {/* Amount hero */}
      <div
        className="flex flex-col items-center gap-1 py-3 sm:py-5 rounded-2xl"
        style={{ background: "linear-gradient(135deg,#FDF6EC,#FEF3E2)", border: "1px solid #F5DEB3" }}
      >
        <p className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-widest">الدفعة المطلوبة الآن</p>
        <p className="text-3xl sm:text-5xl font-black mt-1 sm:mt-2" style={{ color: "#BC9255" }}>
          {fmt(PRE_ORDER_DEPOSIT)}
        </p>
        <p className="text-sm sm:text-base font-bold text-amber-800 mt-0.5 sm:mt-1">ريال سعودي</p>
        <p className="text-[10px] sm:text-[11px] text-amber-600 mt-1 sm:mt-2 text-center px-3 sm:px-4 leading-relaxed">
          لتأكيد حجز جهازك، يلزم دفع دفعة مقدمة قدرها {fmt(PRE_ORDER_DEPOSIT)} ريال.
        </p>
      </div>

      {/* Breakdown */}
      <div className="rounded-xl overflow-hidden border border-gray-100">
        {[
          ["قيمة الحجز المسبق", `${fmt(PRE_ORDER_DEPOSIT)} ر.س`],
          ["المبلغ المطلوب الآن", `${fmt(PRE_ORDER_DEPOSIT)} ر.س`],
          ["المتبقي عند الاستلام", `${fmt(productPrice - PRE_ORDER_DEPOSIT)} ر.س`],
        ].map(([k, v], i) => (
          <div
            key={k}
            className="flex justify-between px-3 py-2 sm:px-4 sm:py-2.5"
            style={{
              background: i % 2 === 0 ? "#F9FAFB" : "#fff",
              borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
            }}
          >
            <span className="text-[11px] sm:text-sm text-gray-500 font-medium">{k}</span>
            <span className="text-[11px] sm:text-sm font-bold text-gray-800">{v}</span>
          </div>
        ))}
      </div>

      {/* Refund notice */}
      <div
        className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl"
        style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
      >
        <IoShieldCheckmark size={15} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] sm:text-xs font-bold text-green-800 mb-0.5">مبلغ الدفعة قابل للاسترداد</p>
          <p className="text-[10px] sm:text-[11px] text-green-700 leading-relaxed">
            في حال إلغاء الحجز وفقاً لسياسة المتجر، يتم رد الدفعة المقدمة حسب شروط وأحكام الحجز.
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-col gap-1.5 sm:gap-2 px-1">
        {[
          { Icon: IoShieldCheckmark, text: "الدفع يتم عبر بوابة دفع آمنة خاصه بمتجرنا" },
          { Icon: IoCardOutline,     text: "لن يتم خصم أي مبلغ إضافي غير موضح قبل تأكيد الدفع" },
          { Icon: IoCubeOutline,     text: "الدفعة مخصصة لتأكيد الحجز المسبق فقط" },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={12} style={{ color: "#BC9255", flexShrink: 0 }} />
            <p className="text-[10px] sm:text-[11px] text-gray-500">{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm mt-0.5"
        style={{ background: "linear-gradient(135deg,#BC9255,#A77D4B)" }}
      >
        المتابعة إلى الدفع
      </button>
      <button onClick={onBack} className="text-[10px] sm:text-xs text-gray-400 text-center py-1 hover:text-gray-600 transition">
        → العودة إلى البيانات
      </button>
    </div>
  );
}
