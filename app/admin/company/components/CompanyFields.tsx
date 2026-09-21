"use client";
import { memo } from "react";
import { fieldLabelMap } from "../constants";
import type { CompanyData } from "../types";

interface CompanyFieldsProps {
  data: CompanyData;
  onChange: (key: string, value: string) => void;
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

const ltrFields = new Set(["phone", "whatsapp", "website", "email", "taxNumber"]);

// [PERF] Module-scope component — never redefined on parent re-render.
// Uses fieldLabelMap (O(1) lookup) instead of fields.find() O(n) per render.
function FieldInput({ fieldKey, data, onChange }: { fieldKey: string; data: CompanyData; onChange: (k: string, v: string) => void }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">
        {fieldLabelMap[fieldKey]}
      </label>
      <input
        value={data[fieldKey] || ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className={inputClass}
        dir={ltrFields.has(fieldKey) ? "ltr" : undefined}
      />
    </div>
  );
}

// [PERF] React.memo — skips re-render when saving/loading state changes in parent
// don't affect data or onChange (onChange is stable via useCallback in hook).
export default memo(function CompanyFields({ data, onChange }: CompanyFieldsProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["nameAr", "nameEn"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["addressAr", "addressEn"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["phone", "whatsapp"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["website", "email"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["currencyAr", "currencyEn"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {["taxNumber", "shippingCompany"].map((k) => <FieldInput key={k} fieldKey={k} data={data} onChange={onChange} />)}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">طريقة الدفع</label>
          <select
            value={data.paymentMethod || ""}
            onChange={(e) => onChange("paymentMethod", e.target.value)}
            className={inputClass}
          >
            <option value="حوالات بنكية فقط">حوالات بنكية فقط</option>
            <option value="بطاقة بنكية فقط">بطاقة بنكية فقط</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">التفاصيل</label>
        <textarea
          value={data.details || ""}
          onChange={(e) => onChange("details", e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  );
});
