"use client";

import { IoCartOutline, IoCardOutline, IoCheckmarkCircleOutline, IoWalletOutline } from "react-icons/io5";

const steps = [
  { key: "cart", label: "السلة", icon: IoCartOutline },
  { key: "method", label: "السداد", icon: IoWalletOutline },
  { key: "payment", label: "الدفع", icon: IoCardOutline },
  { key: "confirm", label: "التأكيد", icon: IoCheckmarkCircleOutline },
];

export default function CheckoutStepper({ active }: { active: "cart" | "method" | "payment" | "confirm" }) {
  const activeIdx = steps.findIndex(s => s.key === active);

  return (
    <div className="flex items-center justify-center gap-0 py-4" dir="rtl">
      {steps.map((step, i) => {
        const done = i < activeIdx;
        const current = i === activeIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: current ? "rgba(188,146,85,0.12)" : done ? "rgba(188,146,85,0.08)" : "rgba(188,146,85,0.04)",
                  border: current ? "2px solid #BC9255" : done ? "2px solid rgba(188,146,85,0.4)" : "2px solid rgba(188,146,85,0.15)",
                  color: current ? "#BC9255" : done ? "#A77D4B" : "rgba(167,125,75,0.4)",
                  transform: current ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Icon size={current ? 22 : 20} />
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold"
                style={{ color: current ? "#0A1825" : done ? "#A77D4B" : "rgba(167,125,75,0.4)" }}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="w-12 sm:w-20 h-0.5 rounded-full mx-2 sm:mx-3 mb-5"
                style={{ backgroundColor: i < activeIdx ? "#BC9255" : "rgba(188,146,85,0.15)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
