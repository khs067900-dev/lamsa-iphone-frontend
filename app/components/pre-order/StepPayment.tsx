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
