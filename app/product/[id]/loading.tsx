export default function ProductLoading() {
  return (
    <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(188,146,85,0.15)" }} />
            <div className="hidden sm:flex gap-2 items-center">
              <div className="w-16 h-3 rounded animate-pulse" style={{ backgroundColor: "rgba(188,146,85,0.2)" }} />
              <div className="w-24 h-3 rounded animate-pulse" style={{ backgroundColor: "rgba(188,146,85,0.15)" }} />
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(188,146,85,0.15)" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* Image skeleton */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-4 shadow-xl" style={{ border: "1px solid #EBE6E2" }}>
              <div className="aspect-square rounded-2xl animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
              <div className="flex gap-2.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-[68px] h-[68px] rounded-2xl animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Info skeleton */}
          <div className="lg:col-span-5">
            <div className="hidden lg:block h-8 w-3/4 rounded-xl mb-5 animate-pulse" style={{ backgroundColor: "#e8e0d5" }} />
            <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #EBE6E2", background: "#fff" }}>
              {/* Brand + stock */}
              <div className="px-5 pt-5 pb-4 flex gap-2" style={{ borderBottom: "1px solid #f0ebe4" }}>
                <div className="w-16 h-6 rounded-full animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                <div className="w-20 h-6 rounded-full animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
              </div>
              {/* Colors */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
                <div className="w-24 h-3 rounded mb-3 animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                <div className="flex gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                  ))}
                </div>
              </div>
              {/* Storage */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
                <div className="w-16 h-3 rounded mb-3 animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-20 h-9 rounded-xl animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
                  ))}
                </div>
              </div>
              {/* Price */}
              <div className="px-5 py-5" style={{ borderBottom: "1px solid #f0ebe4" }}>
                <div className="w-32 h-10 rounded-xl animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
              </div>
              {/* CTA */}
              <div className="p-4">
                <div className="w-full h-14 rounded-2xl animate-pulse" style={{ backgroundColor: "#f0ebe4" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
