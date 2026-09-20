"use client";

import { IoShareSocial } from "react-icons/io5";

export default function ShareButton({ productName }: { productName: string }) {
  const handleShare = async () => {
    try {
      await navigator.share({ 
        title: productName, 
        url: window.location.href 
      });
    } catch {
      // User cancelled or share not supported
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
      style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}
      aria-label="مشاركة"
    >
      <IoShareSocial size={17} />
    </button>
  );
}
