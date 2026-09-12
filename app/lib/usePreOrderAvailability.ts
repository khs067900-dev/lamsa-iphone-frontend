"use client";

import { useState, useEffect } from "react";

export type ReservationStatus = "not_started" | "open" | "ended";

export function usePreOrderAvailability(): ReservationStatus {
  const [status, setStatus] = useState<ReservationStatus>("not_started");

  useEffect(() => {
    const dateStr = process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00";
    const openAt = new Date(dateStr).getTime();

    const calc = () => {
      const now = Date.now();
      if (now >= openAt) setStatus("open");
      else setStatus("not_started");
    };

    calc();
    const id = setInterval(calc, 5000);
    return () => clearInterval(id);
  }, []);

  return status;
}

export function isIPhone18PreOrder(productName: string): boolean {
  return /iphone\s*18\s*(pro\s*(max)?|duo)?/i.test(productName) ||
    /آيفون\s*18|ايفون\s*18/i.test(productName) ||
    /آيفون\s*(Duo|دو)\b/i.test(productName);
}
