"use client";

import { IoShieldCheckmark } from "react-icons/io5";

export function StepPaying() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-8 min-h-[280px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#BC9255] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <IoShieldCheckmark size={22} style={{ color: "#BC9255" }} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-base font-black text-gray-800">جاري الانتقال إلى بيانات الدفع</p>
        <p className="text-sm text-gray-400 mt-1">نجهز لك خطوة الدفع الآمنة...</p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "#BC9255",
              animation: `po-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
