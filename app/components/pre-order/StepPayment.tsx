"use client";

import { useState } from "react";
import { PRE_ORDER_DEPOSIT, fmt } from "./types";
import CheckoutPayment from "../../checkout/CheckoutPayment";

export function StepPayment({
  loading,
  onSubmit,
  onBack,
}: {
  loading: boolean;
  onSubmit: (cardNumber: string, expiry: string, cvv: string, holder: string) => void;
  onBack: () => void;
}) {
  const [selectedPayment, setSelectedPayment] = useState<"mada" | "mastercard" | "applepay" | null>("mada");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");

  const handleCardSubmit = () => {
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length !== 16) { setCardNumberError("رقم البطاقة يجب أن يكون 16 رقمًا"); return; }
    let sum = 0, shouldDouble = false;
    for (let i = rawCard.length - 1; i >= 0; i--) {
      let digit = parseInt(rawCard[i]);
      if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit; shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) { setCardNumberError("رقم البطاقة غير صحيح"); return; }
    if (cardExpiry.replace(/\D/g, "").length !== 4) { setCardExpiryError("صيغة غير صحيحة (MM/YY)"); return; }
    if (cardCvv.length !== 3) return;
    if (!cardHolder.trim()) return;
    onSubmit(cardNumber, cardExpiry, cardCvv, cardHolder);
  };

  return (
    <div className="flex flex-col">
      {/* نفس CheckoutPayment بالضبط */}
      <CheckoutPayment
        shippingConfirmed={true}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        cardExpiry={cardExpiry}
        setCardExpiry={setCardExpiry}
        cardCvv={cardCvv}
        setCardCvv={setCardCvv}
        cardHolder={cardHolder}
        setCardHolder={setCardHolder}
        cardNumberError={cardNumberError}
        setCardNumberError={setCardNumberError}
        cardExpiryError={cardExpiryError}
        setCardExpiryError={setCardExpiryError}
        loading={loading}
        blocked={false}
        fmtTime=""
        onCardSubmit={handleCardSubmit}
        submitLabel={`تأكيد ودفع ${fmt(PRE_ORDER_DEPOSIT)} ريال`}
      />

      <button
        onClick={onBack}
        className="text-xs text-gray-400 text-center py-3 hover:text-gray-600 transition"
      >
        → العودة للمراجعة
      </button>
    </div>
  );
}
