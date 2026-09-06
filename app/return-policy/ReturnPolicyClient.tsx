"use client";
import { useEffect, useRef, useState } from "react";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* Icons */
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="22.08" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBan = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round"/>
  </svg>
);
const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/>
    <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/>
  </svg>
);

const sections = [
  {
    Icon: IconBox,
    title: "حالة المنتج",
    content: [
      "يشترط أن يكون المنتج في حالته الأصلية وغير مستخدم، مع الحفاظ على التغليف والملحقات والفاتورة إن وجدت.",
    ],
  },
  {
    Icon: IconClock,
    title: "مدة طلب الاسترجاع",
    content: [
      "يتم تقديم طلبات الاستبدال أو الاسترجاع خلال 14 يومًا من تاريخ استلام الطلب حسب سياسة المتجر، وبعد مراجعة حالة الطلب والمنتج.",
    ],
  },
  {
    Icon: IconBan,
    title: "المنتجات غير القابلة للاسترجاع",
    content: [
      "بعض المنتجات قد لا تكون قابلة للاسترجاع أو الاستبدال بعد فتحها أو استخدامها، وخاصة المنتجات الشخصية أو الرقمية أو التي تم تجهيزها بطلب خاص.",
    ],
  },
  {
    Icon: IconXCircle,
    title: "إلغاء الطلبات",
    content: [
      "يمكن إلغاء الطلب قبل التجهيز أو الشحن، أما إذا تم شحن الطلب فيتم التعامل معه وفق سياسة الاسترجاع المعتمدة.",
    ],
  },
];

type Company = { whatsapp?: string; email?: string; phone?: string };

export default function ReturnPolicyClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/api/admin/company").then((r) => r.json()).then(setCompany).catch(() => {});
  }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <main className="min-h-screen bg-[#faf7f2] overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0A1825 0%, #122a42 50%, #0A1825 100%)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ border: "1px solid #BC9255" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ border: "1px solid #BC9255" }} />
        </div>

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-20 sm:py-28 text-center">
          <div {...anim(100)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6" style={{ backgroundColor: "rgba(188,146,85,0.15)", color: "#BC9255", border: "1px solid rgba(188,146,85,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC9255] animate-pulse" />
            الشروط والسياسات
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
            سياسة{" "}
            <span className="text-[#BC9255]">الاستبدال</span>
            <span className="block text-white/90 text-2xl sm:text-4xl lg:text-5xl mt-2">والاسترجاع</span>
          </h1>

          <p {...anim(350)} className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل لمسه للاجهزه الذكيه
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "linear-gradient(to right, transparent, #BC9255, transparent)" }} />
      </section>

      {/* ════════ SECTIONS ════════ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-4 sm:space-y-5">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 100}>
            <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300" style={{ border: "1px solid rgba(188,146,85,0.2)" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-1 sm:w-1 sm:h-auto shrink-0" style={{ background: "linear-gradient(to bottom, #BC9255, #A77D4B)" }} />
                <div className="flex-1 p-4 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-[#A77D4B] group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: "rgba(188,146,85,0.1)" }}>
                      <s.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-[#0A1825]">{s.title}</h2>
                      <div className="h-0.5 w-8 mt-1 rounded-full" style={{ background: "linear-gradient(to left, #BC9255, #A77D4B)" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {s.content.map((p, j) => (
                      <p key={j} className="text-gray-600 leading-relaxed text-sm sm:text-base">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}

        <ContactSection
          title="التواصل بخصوص الطلبات"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={400}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}
