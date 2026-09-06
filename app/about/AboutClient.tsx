"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
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

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* Icons */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHeadset = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPercent = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <rect x="1" y="3" width="15" height="13" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 8h4l3 5v4h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* Data */
const stats = [
  { value: "١٠٠٪", label: "ضمان الجودة", Icon: IconShield },
  { value: "٢٤/٧", label: "دعم فني", Icon: IconHeadset },
  { value: "٠٪", label: "بدون فوائد", Icon: IconPercent },
  { value: "سريع", label: "توصيل", Icon: IconTruck },
];

const sections = [
  {
    Icon: IconStore,
    title: "من نحن",
    content: [
      "لمسه للاجهزه الذكيه هو متجر إلكتروني متخصص في تقديم المنتجات والخدمات بجودة عالية وتجربة شراء سهلة وآمنة تناسب احتياجات العملاء.",
      "نحن نحرص على توفير أفضل الحلول والعروض مع الاهتمام بالتفاصيل التي تمنح العميل تجربة احترافية بداية من تصفح المنتجات وحتى إتمام الطلب.",
      "لمسه للاجهزه الذكيه هو اختيارك الأول لشراء أحدث الأجهزة الإلكترونية بأقساط سهلة وبدون فوائد، وتلقى عندنا تجربة مختلفة تبدأ من جودة الخدمة وسرعة التوصيل إلى اهتمام كبير بخدمة ما بعد البيع — نتابعك خطوة بخطوة ونوفّر لك دعم فني وضمان يخليك واثق إنك تتعامل مع متجر يحط رضاك فوق كل اعتبار.",
    ],
  },
  {
    Icon: IconTarget,
    title: "رؤيتنا",
    content: [
      "تقديم تجربة تسوق إلكترونية موثوقة وسريعة ومريحة، مع الحفاظ على أعلى معايير الجودة وخدمة العملاء.",
    ],
  },
  {
    Icon: IconStar,
    title: "رسالتنا",
    content: [
      "نسعى إلى بناء ثقة طويلة الأمد مع عملائنا من خلال منتجات مميزة، دعم سريع، وشفافية كاملة في التعامل.",
    ],
  },
];

export default function AboutClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [company, setCompany] = useState<{ whatsapp?: string; email?: string; addressAr?: string } | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/api/admin/company")
      .then((r) => r.json())
      .then((d) => setCompany(d))
      .catch(() => {});
  }, []);

  const anim = (delay: number, extra = "") =>
    ({
      style: {
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      },
      className: extra,
    } as React.HTMLAttributes<HTMLElement>);

  return (
    <main className="min-h-screen bg-[#faf7f2] overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0A1825 0%, #122a42 50%, #0A1825 100%)" }}>
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ border: "1px solid #BC9255" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ border: "1px solid #BC9255" }} />
        </div>

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-20 sm:py-28 text-center">
          <div {...anim(100)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6" style={{ backgroundColor: "rgba(188,146,85,0.15)", color: "#BC9255", border: "1px solid rgba(188,146,85,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC9255] animate-pulse" />
            تعرف علينا
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
            عن{" "}
            <span className="text-[#BC9255]">لمسه</span>
            <span className="block text-white/90 text-2xl sm:text-4xl lg:text-5xl mt-2">للأجهزة الذكية</span>
          </h1>

          <p {...anim(350)} className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            تعرف على نشاط المتجر ورؤيتنا والخدمات التي نقدمها لعملائنا
          </p>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "linear-gradient(to right, transparent, #BC9255, transparent)" }} />
      </section>

      {/* ════════ STATS ════════ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-10 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 80}>
              <div className="group relative bg-white rounded-2xl border p-4 sm:p-5 text-center overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ borderColor: "rgba(188,146,85,0.2)" }}>
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(to right, #BC9255, #A77D4B)" }} />
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 text-white group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>
                  <s.Icon />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#0A1825] mb-0.5">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-[#A77D4B] font-semibold">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════ SECTIONS ════════ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-4 sm:space-y-5">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 100}>
            <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300" style={{ border: "1px solid rgba(188,146,85,0.2)" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-1 sm:w-1 sm:h-auto shrink-0" style={{ background: "linear-gradient(to bottom, #BC9255, #A77D4B)" }} />
                <div className="flex-1 p-5 sm:p-7">
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
          title="وسائل التواصل"
          phone={company?.whatsapp}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-16" />
      <div className="sbc-verify-seal" data-token="MStxS0d2Q1pNbVF0ZkhEVitKdkd6UT09" data-position="bottom-left" />
      <Script src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js" strategy="afterInteractive" />
    </main>
  );
}
