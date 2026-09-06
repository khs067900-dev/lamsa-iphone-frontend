"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { IoStarSharp, IoChatbubbleEllipsesOutline } from "react-icons/io5";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: string;
  createdAt: string;
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetch(`/api/reviews`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setReviews(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: "", comment: "", rating: 5 });
    } catch {}
    setSubmitting(false);
  }

  const avatarGradient = (gender: string) =>
    gender === "female"
      ? "from-[#DFC4A4] to-[#A77D4B]"
      : "from-[#1F2C3E] to-[#2d4a6f]";

  return (
    <section className="w-full py-14 relative overflow-hidden" dir="rtl" style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, #ffffff 100%)', fontFamily: "'Cairo', sans-serif" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #A77D4B, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #1F2C3E, transparent)' }} />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(to left, #A77D4B, transparent)' }} />
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ backgroundColor: '#1F2C3E' }}>
              <IoChatbubbleEllipsesOutline size={18} style={{ color: '#DFC4A4' }} />
              <span className="text-sm sm:text-base font-bold" style={{ color: '#DFC4A4' }}>آراء عملائنا</span>
            </div>
            <div className="flex-1 h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(to right, #A77D4B, transparent)' }} />
          </div>
          <p className="text-[13px] opacity-60" style={{ color: '#1F2C3E' }}>ثقة عملائنا هي أغلى ما نملك</p>
        </div>

        {/* Reviews Swiper */}
        {reviews.length > 0 ? (
          <div className="mb-10">
            <Swiper
              modules={[Autoplay, Keyboard, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              keyboard={{ enabled: true }}
              pagination={{ clickable: true }}
              loop={reviews.length > 3}
              className="pb-10!"
            >
              {reviews.map((r) => (
                <SwiperSlide key={r._id}>
                  <div
                    onClick={() => setSelectedReview(r)}
                    className="relative rounded-2xl p-5 flex flex-col gap-3 hover:shadow-xl transition-all duration-300 h-full cursor-pointer group overflow-hidden border"
                    style={{ backgroundColor: '#ffffff', borderColor: 'rgba(167,125,75,0.15)' }}
                  >
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-40" style={{ background: 'linear-gradient(to bottom-left, rgba(223,196,164,0.3), transparent)' }} />

                    {/* Quote icon */}
                    <div className="absolute top-3 left-3 text-3xl opacity-10 font-serif" style={{ color: '#A77D4B' }}>&ldquo;</div>

                    {/* Stars */}
                    <div className="flex gap-0.5 relative z-10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <IoStarSharp key={s} size={16} style={{ color: s <= r.rating ? '#A77D4B' : '#e5e7eb' }} />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-[13px] leading-relaxed flex-1 relative z-10 line-clamp-3" style={{ color: '#374151' }}>
                      {r.comment}
                    </p>
                    {r.comment.length > 120 && (
                      <span className="text-[11px] font-medium transition-colors" style={{ color: '#A77D4B' }}>اضغط لقراءة المزيد...</span>
                    )}

                    {/* Divider */}
                    <div className="h-[1px]" style={{ background: 'linear-gradient(to left, transparent, rgba(167,125,75,0.2), transparent)' }} />

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient(r.gender)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                        {r.name.trim().charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: '#1F2C3E' }}>{r.name}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <p className="text-center text-sm mb-6" style={{ color: 'rgba(31,44,62,0.4)' }}>لا توجد آراء بعد، كن أول من يعلق!</p>
        )}

        {/* Modal */}
        {selectedReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setSelectedReview(null)}
          >
            <div
              className="rounded-3xl shadow-2xl p-6 max-w-md w-full flex flex-col gap-4 relative border"
              style={{ backgroundColor: '#ffffff', borderColor: 'rgba(167,125,75,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
                style={{ backgroundColor: '#f5f0e8', color: '#1F2C3E' }}
              >✕</button>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IoStarSharp key={s} size={20} style={{ color: s <= selectedReview.rating ? '#A77D4B' : '#e5e7eb' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{selectedReview.comment}</p>
              <div className="h-[1px]" style={{ background: 'linear-gradient(to left, transparent, rgba(167,125,75,0.2), transparent)' }} />
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(selectedReview.gender)} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
                  {selectedReview.name.trim().charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold" style={{ color: '#1F2C3E' }}>{selectedReview.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add review button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to left, rgba(167,125,75,0.3), transparent)' }} />
          {submitted ? (
            <span className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full" style={{ color: '#1F2C3E', backgroundColor: 'rgba(167,125,75,0.1)', border: '1px solid rgba(167,125,75,0.3)' }}>
              ✓ تم إرسال تعليقك وسيظهر بعد المراجعة
            </span>
          ) : (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="text-xs sm:text-sm font-semibold whitespace-nowrap px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: showForm ? 'transparent' : '#1F2C3E',
                color: showForm ? '#1F2C3E' : '#DFC4A4',
                border: showForm ? '1px solid #1F2C3E' : '1px solid transparent',
              }}
            >
              {showForm ? "إلغاء" : "+ أضف تعليقك"}
            </button>
          )}
          <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, rgba(167,125,75,0.3), transparent)' }} />
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-5 rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(167,125,75,0.15)' }}>
            <input
              type="text"
              placeholder="اسمك"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{ border: '1px solid rgba(167,125,75,0.2)', backgroundColor: '#faf7f2' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#A77D4B')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(167,125,75,0.2)')}
              required
            />
            <textarea
              placeholder="اكتب تعليقك..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={3}
              className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none"
              style={{ border: '1px solid rgba(167,125,75,0.2)', backgroundColor: '#faf7f2' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#A77D4B')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(167,125,75,0.2)')}
              required
            />
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#1F2C3E' }}>التقييم:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                  className="text-xl transition-transform hover:scale-125">
                  <IoStarSharp size={20} style={{ color: s <= form.rating ? '#A77D4B' : '#d1d5db' }} />
                </button>
              ))}
            </div>
            <button type="submit" disabled={submitting}
              className="text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 hover:shadow-lg"
              style={{ backgroundColor: '#1F2C3E', color: '#DFC4A4' }}>
              {submitting ? "جاري الإرسال..." : "إرسال التعليق"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
