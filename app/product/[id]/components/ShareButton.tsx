"use client";

import { useState } from "react";
import { IoShareSocial, IoCheckmark } from "react-icons/io5";

export default function ShareButton({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ 
          title: productName, 
          url: window.location.href 
        });
        return;
      } catch {
        // User cancelled or share not permitted
      }
    }

    // Fallback: clipboard copy
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard access denied
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: copied ? "rgba(16,185,129,0.15)" : "rgba(188,146,85,0.1)",
          color: copied ? "#059669" : "#A77D4B",
        }}
        aria-label="مشاركة"
        title={copied ? "تم نسخ الرابط!" : "مشاركة"}
      >
        {copied ? <IoCheckmark size={18} /> : <IoShareSocial size={17} />}
      </button>

      {copied && (
        <span
          className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none z-20 animate-fade-in"
        >
          تم نسخ الرابط!
        </span>
      )}
    </div>
  );
}
