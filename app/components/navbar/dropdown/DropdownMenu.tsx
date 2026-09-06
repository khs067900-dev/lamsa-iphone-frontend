"use client";

import Link from "next/link";
import { NavGroup } from "../data";

interface DropdownMenuProps {
  items?: { label: string; href: string }[];
  groups?: NavGroup[];
}

export default function DropdownMenu({ items, groups }: DropdownMenuProps) {
  return (
    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style={{ border: '1px solid rgba(188,146,85,0.3)' }}>
      {groups?.map((group, gi) => (
        <div key={gi}>
          <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide border-b" style={{ color: '#A77D4B', borderColor: 'rgba(188,146,85,0.2)' }}>
            {group.groupLabel}
          </div>
          {group.items.map((item, ci) => (
            <Link
              key={`${item.href}-${ci}`}
              href={item.href}
              className="block px-4 py-2 text-sm text-[#0A1825]/70 hover:bg-[#BC9255]/10 hover:text-[#A77D4B] transition-colors text-right"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
      {items?.map((item, index) => (
        <Link
          key={`${item.href}-${index}`}
          href={item.href}
          className="block px-4 py-2 text-sm text-[#0A1825]/70 hover:bg-[#BC9255]/10 hover:text-[#A77D4B] transition-colors text-right"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
