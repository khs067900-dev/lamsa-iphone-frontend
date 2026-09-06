"use client";
import { useBanners } from "./hooks/useBanners";
import BannersHeader from "./components/BannersHeader";
import BannerCard from "./components/BannerCard";

export default function BannersPage() {
  const {
    banners, loading, addingBanner, inputRefs,
    handleUpload, handleDeleteImage, handleDeleteSlot, handleToggle, handleAddBanner,
  } = useBanners();

  const filled = banners.filter((b) => b.url).length;
  const activeCount = banners.filter((b) => b.url && b.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mx-3 -mt-0 sm:-mx-5 md:-mx-6">
      <BannersHeader
        activeCount={activeCount}
        filled={filled}
        total={banners.length}
        addingBanner={addingBanner}
        onAdd={handleAddBanner}
      />
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {banners.map((banner, i) => (
          <BannerCard
            key={i}
            banner={banner}
            index={i}
            isLoading={loading === i}
            inputRef={(el) => { inputRefs.current[i] = el; }}
            onUpload={handleUpload}
            onToggle={handleToggle}
            onDeleteImage={handleDeleteImage}
            onDeleteSlot={handleDeleteSlot}
          />
        ))}
      </div>
    </div>
  );
}
