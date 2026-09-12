import type { Metadata } from "next";
import ComingSoon from "../iphone-18/ComingSoon";

export const metadata: Metadata = {
  title: "iPhone 18 Pro | لمسه للاجهزه الذكيه",
  description: "iPhone 18 Pro — أداء احترافي من Apple قريباً حصرياً على لمسه",
};

const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00"
);

const SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

export default function IPhone18ProPage() {
  const isOver = RESERVATION_DATE.getTime() <= Date.now();
  if (isOver) return null;
  return (
    <ComingSoon
      modelName="iPhone 18 Pro"
      slides={SLIDES}
      reservationDate={RESERVATION_DATE.toISOString()}
    />
  );
}
