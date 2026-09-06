"use client";

import { useState } from "react";
import { IoPersonOutline } from "react-icons/io5";
import type { CustomerInfo } from "../../store/cartStore";

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

export default function CustomerForm({ initialData, onSubmit }: CustomerFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "مطلوب";
    if (!nationalId.trim()) newErrors.nationalId = "مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) newErrors.nationalId = "يبدأ بـ 1 أو 2 (10 أرقام)";
    if (!whatsapp.trim()) newErrors.whatsapp = "مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) newErrors.whatsapp = "05XXXXXXXX";
    if (!address.trim()) newErrors.address = "مطلوب";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({ name, nationalId, whatsapp, address, installmentType: "installment", months: 24, downPayment: 0 });
  };

  const inputBase = "w-full h-10 rounded-lg px-3 text-sm focus:outline-none transition";
  const getInputStyle = (field: string) => ({
    backgroundColor: "#faf7f2",
    border: errors[field] ? "1.5px solid #ef4444" : "1.5px solid rgba(188,146,85,0.2)",
    color: "#0A1825",
  });

  return (
    <div>
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid rgba(188,146,85,0.12)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.12)" }}>
          <IoPersonOutline size={14} style={{ color: "#BC9255" }} />
          <span className="text-xs font-bold" style={{ color: "#0A1825" }}>بياناتك</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2.5">
          <div id="field-name">
            <Label text="الاسم" error={errors.name} />
            <input
              value={name}
              onChange={(e) => { setName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="الاسم الكامل"
              className={inputBase}
              style={getInputStyle("name")}
            />
          </div>
          <div id="field-nationalId">
            <Label text="رقم الهوية" error={errors.nationalId} />
            <input
              value={nationalId}
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyDown={(e) => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault(); }}
              onChange={(e) => { setNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setErrors((p) => ({ ...p, nationalId: "" })); }}
              placeholder="10XXXXXXXX"
              maxLength={10}
              className={inputBase}
              style={getInputStyle("nationalId")}
            />
          </div>
          <div id="field-whatsapp">
            <Label text="واتساب" error={errors.whatsapp} />
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={whatsapp}
              onKeyDown={(e) => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault(); }}
              onChange={(e) => { setWhatsapp(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setErrors((p) => ({ ...p, whatsapp: "" })); }}
              placeholder="05XXXXXXXX"
              className={inputBase}
              style={getInputStyle("whatsapp")}
              dir="ltr"
            />
          </div>
          <div id="field-address">
            <Label text="العنوان" error={errors.address} />
            <input
              value={address}
              onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
              placeholder="المدينة - الحي"
              className={inputBase}
              style={getInputStyle("address")}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-3 py-3.5 rounded-xl font-black text-sm transition hover:scale-[1.01] active:scale-[0.98] shadow-lg"
        style={{ backgroundColor: "#BC9255", color: "#0A1825" }}
      >
        التالي ←
      </button>
    </div>
  );
}

function Label({ text, error }: { text: string; error?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <span className="text-[11px] font-bold" style={{ color: "#0A1825" }}>{text}</span>
      {error && <span className="text-red-500 text-[9px] font-bold mr-auto">{error}</span>}
    </div>
  );
}
