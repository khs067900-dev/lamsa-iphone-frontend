"use client";
import { useCompany } from "./hooks/useCompany";
import CompanyFields from "./components/CompanyFields";
import CompanyImages from "./components/CompanyImages";

export default function CompanyPage() {
  const {
    data,
    loading,
    saving,
    uploadingKey,
    handleChange,
    handleImageChange,
    handleImageDelete,
    handleSave,
  } = useCompany();

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">بيانات الشركة</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-5 sm:space-y-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ) : (
          <>
            <CompanyFields data={data} onChange={handleChange} />
            <div className="pt-2 border-t border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">شعارات وصور الشركة</h2>
              <CompanyImages
                data={data}
                uploadingKey={uploadingKey}
                onImageChange={handleImageChange}
                onImageDelete={handleImageDelete}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold py-3 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? "جاري الحفظ..." : "حفظ البيانات"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
