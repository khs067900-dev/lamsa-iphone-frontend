"use client";

import Link from "next/link";
import { NavItem } from "./data";
import { DropdownMenu } from "./dropdown";
import { ChevronDownIcon } from "./icons";

interface DesktopNavProps {
  items: NavItem[];
}

export default function DesktopNav({ items }: DesktopNavProps) {
  return (
    <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
      {items.map((item) => (
        <div key={item.label} className="relative group">
          <Link
            href={item.href}
            className="flex items-center gap-1 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-[#0A1825] hover:text-[#BC9255] rounded-md hover:bg-[#BC9255]/10 transition-colors whitespace-nowrap"
          >
            {item.label}
          {(item.children || item.groups) && <ChevronDownIcon />}
          </Link>
          {(item.children || item.groups) && (
            <DropdownMenu items={item.children} groups={item.groups} />
          )}
        </div>
      ))}
    </div>
  );
}
