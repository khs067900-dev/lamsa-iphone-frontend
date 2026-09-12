"use client";

import { IoWarning } from "react-icons/io5";

export function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
      <IoWarning size={11} />{msg}
    </p>
  );
}
