"use client";

import { useRouter } from "next/navigation";
import { IoArrowForward } from "react-icons/io5";

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
      style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}
      aria-label="العودة"
    >
      <IoArrowForward size={18} />
    </button>
  );
}
