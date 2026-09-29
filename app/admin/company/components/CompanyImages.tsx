"use client";
import { memo } from "react";
import { imageFields, withCacheBust } from "../constants";
import type { CompanyData } from "../types";

interface CompanyImagesProps {
  data: CompanyData;
  uploadingKey?: string | null;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}

export default memo(function CompanyImages({
  data,
  uploadingKey,
  onImageChange,
  onImageDelete,
}: CompanyImagesProps) {
  return (
    <div>
      <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs sm:text-sm w-full mb-4">
        <span className="shrink-0 text-base">ℹ️</span>
        <span>رفع الصورة قد يستغرق بضع ثوانٍ حسب حجمها — يتم حفظ الصورة تلقائياً وتحديث الموقع مباشرة.</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
        {imageFields.map(({ key, label }) => {
          const isUploading = uploadingKey === key;
          const hasImage = Boolean(data[key]);

          return (
            <div key={key} className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-200/80">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">{label}</label>

              <div className="h-16 flex items-center justify-center mb-2">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-blue-600 font-medium">جاري الرفع...</span>
                  </div>
                ) : hasImage ? (
                  <div className="relative inline-block">
                    <img
                      src={withCacheBust(data[key])}
                      alt={label}
                      className="h-14 max-w-[120px] object-contain rounded border border-gray-200 bg-white p-0.5 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onImageDelete(key)}
                      disabled={isUploading}
                      className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none shadow transition-colors disabled:opacity-50"
                      title="حذف الصورة"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs text-center border-2 border-dashed border-gray-200 rounded-lg w-full h-full flex items-center justify-center">
                    لا توجد صورة
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => e.target.files?.[0] && onImageChange(key, e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-1 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
