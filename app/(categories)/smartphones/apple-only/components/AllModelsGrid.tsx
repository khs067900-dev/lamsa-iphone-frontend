"use client";

import { useRef } from "react";
import { FaApple } from "react-icons/fa";
import { IoArrowForward, IoArrowBack } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../../../components/products/ProductCard";
import type { Product } from "../../../../components/products/types";

interface Props {
  products: Product[];
  loading: boolean;
  activeFilter: string | null;
  activeLabel: string;
  page: number;
  setPage: (p: number) => void;
  itemsPerPage: number;
  onClearFilter: () => void;
}

export default function AllModelsGrid({ products, loading, activeFilter, activeLabel, page, setPage, itemsPerPage, onClearFilter }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <section ref={ref} className="scroll-mt-4 mb-16">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "#DFC4A4" }}>
          <span className="text-lg">📱</span>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>
            {activeFilter ? activeLabel : "جميع الطرازات"}
          </h2>
          {!loading && products.length > 0 && (
            <p className="text-[11px] text-gray-400">صفحة {page} من {totalPages || 1}</p>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#EBE6E2]">
              <div className="w-full aspect-square bg-gradient-to-br from-[#F5EBE0] to-[#EBE6E2] animate-pulse" />
              <div className="p-3 sm:p-4 space-y-2.5">
                <div className="h-3.5 bg-[#F5EBE0] animate-pulse rounded-full w-3/4" />
                <div className="h-3.5 bg-[#F5EBE0] animate-pulse rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !products.length ? (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center border" style={{ backgroundColor: "#F5EBE0", borderColor: "#DFC4A4" }}>
            <FaApple size={40} style={{ color: "#1F2C3E" }} />
          </div>
          <p className="text-lg font-black" style={{ color: "#1F2C3E" }}>لا توجد منتجات حالياً</p>
          {activeFilter && (
            <button onClick={onClearFilter} className="text-sm font-bold flex items-center gap-1.5 px-5 py-2.5 rounded-full" style={{ backgroundColor: "#F5EBE0", color: "#1F2C3E" }}>
              عرض جميع المنتجات
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            <AnimatePresence mode="wait">
              {products.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-12">
              <button onClick={() => { setPage(Math.max(1, page - 1)); ref.current?.scrollIntoView({ behavior: "smooth" }); }} disabled={page === 1} className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm font-bold disabled:opacity-30 transition-all shadow-sm hover:shadow-md" style={{ borderColor: "#DFC4A4", color: "#1F2C3E" }}>
                <IoArrowForward size={14} />السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => { setPage(n); ref.current?.scrollIntoView({ behavior: "smooth" }); }} className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs sm:text-sm font-black transition-all ${page === n ? "text-white shadow-lg scale-110" : "bg-white border shadow-sm"}`} style={page === n ? { backgroundColor: "#1F2C3E" } : { borderColor: "#EBE6E2", color: "#1F2C3E" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => { setPage(Math.min(totalPages, page + 1)); ref.current?.scrollIntoView({ behavior: "smooth" }); }} disabled={page === totalPages} className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm font-bold disabled:opacity-30 transition-all shadow-sm hover:shadow-md" style={{ borderColor: "#DFC4A4", color: "#1F2C3E" }}>
                التالي<IoArrowBack size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
