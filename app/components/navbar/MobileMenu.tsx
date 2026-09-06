import { useState } from "react";
import Link from "next/link";
import { NavItem } from "./data";
import { ChevronDownIcon } from "./icons";

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const hasChildren = (item: NavItem) => item.children || item.groups;

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-12 sm:top-16 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`lg:hidden fixed top-12 sm:top-16 right-0 w-[75vw] max-w-[320px] h-[calc(100dvh-3rem)] sm:h-[calc(100dvh-4rem)] z-50 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[110%]"
        }`}
        style={{ background: 'linear-gradient(to bottom, #ffffff, #f5f0e8)' }}
        dir="rtl"
      >
        <div className="py-2">
          <div className="px-4 py-4 text-base font-bold border-b" style={{ background: 'linear-gradient(135deg, #BC9255 0%, #A77D4B 100%)', borderColor: 'rgba(188,146,85,0.3)', color: '#fff' }}>
            أقسام المتجر
          </div>
          {items.map((item) => (
            <div key={item.label} className="border-b" style={{ borderColor: 'rgba(188,146,85,0.1)' }}>
              {hasChildren(item) ? (
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#0A1825] hover:bg-[#BC9255]/10 hover:text-[#A77D4B] transition-colors"
                >
                  {item.label}
                  <span className={`transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}>
                    <ChevronDownIcon />
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-[#0A1825] hover:bg-[#BC9255]/10 hover:text-[#A77D4B] transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )}

              <div
                className={`transition-all duration-300 ease-in-out ${
                  hasChildren(item) && openDropdown === item.label ? "max-h-[600px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="py-1" style={{ backgroundColor: 'rgba(188,146,85,0.05)' }}>
                  {/* groups mode */}
                  {item.groups?.map((group, gi) => (
                    <div key={gi}>
                      <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide border-b" style={{ color: '#A77D4B', borderColor: 'rgba(188,146,85,0.2)' }}>
                        {group.groupLabel}
                      </div>
                      {group.items.map((child, ci) => (
                        <Link
                          key={`${child.href}-${ci}`}
                          href={child.href}
                          className="block px-8 py-2.5 text-sm text-[#0A1825]/70 hover:text-[#A77D4B] hover:bg-[#BC9255]/10 transition-colors"
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  {/* children mode */}
                  {item.children?.map((child, index) => (
                    <Link
                      key={`${child.href}-${index}`}
                      href={child.href}
                      className="block px-8 py-2.5 text-sm text-[#0A1825]/70 hover:text-[#A77D4B] hover:bg-[#BC9255]/10 transition-colors"
                      onClick={onClose}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
