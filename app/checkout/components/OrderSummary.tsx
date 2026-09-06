const fmt = (n: number) => n.toLocaleString("en-US");

export default function OrderSummary({ total, downPayment }: { total: number; downPayment: number }) {
  const remaining = total - downPayment;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid rgba(188,146,85,0.15)" }}>
      {/* Header */}
      <div className="p-4 text-center" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.1)" }}>
        <p className="text-xs mb-1" style={{ color: "#A77D4B" }}>ملخص الطلب</p>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: "#A77D4B" }}>مجموع السلة</span>
          <span className="font-bold flex items-center gap-0.5" style={{ color: "#0A1825" }}>{fmt(total)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
        </div>
        {downPayment > 0 && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: "#A77D4B" }}>الدفعة الأولى</span>
              <span className="font-bold flex items-center gap-0.5" style={{ color: "#0A1825" }}>{fmt(downPayment)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: "#A77D4B" }}>المتبقي للأقساط</span>
              <span className="font-bold flex items-center gap-0.5" style={{ color: "#0A1825" }}>{fmt(remaining > 0 ? remaining : 0)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: "#A77D4B" }}>التوصيل</span>
          <span className="font-bold text-xs" style={{ color: "#BC9255" }}>مجاني</span>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 flex justify-between items-center" style={{ backgroundColor: "#faf7f2", borderTop: "1px solid rgba(188,146,85,0.1)" }}>
        <span className="font-bold text-sm" style={{ color: "#0A1825" }}>المطلوب الآن</span>
        <span className="text-2xl font-black flex items-center gap-1" style={{ color: "#BC9255" }}>
          {fmt(downPayment > 0 ? downPayment : total)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-5 h-5" />
        </span>
      </div>
    </div>
  );
}
