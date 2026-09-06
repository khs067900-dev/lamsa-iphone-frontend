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
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round"/>
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
  </svg>
);

const sections = [
  {
    Icon: IconDoc,
    title: "استخدام الموقع",
    content: [
      "باستخدامك لهذا الموقع فإنك توافق على الالتزام بالشروط والأحكام والسياسات المعمول بها داخل لمسه للاجهزه الذكيه.",
    ],
  },
  {
    Icon: IconShield,
    title: "الخصوصية وحماية البيانات",
    content: [
      "نلتزم بالحفاظ على خصوصية بيانات العملاء وعدم استخدامها إلا في حدود معالجة الطلبات وتحسين الخدمة والتواصل عند الحاجة.",
    ],
  },
  {
    Icon: IconInfo,
    title: "دقة المعلومات",
    content: [
      "نحرص على عرض المعلومات والمنتجات والأسعار بأكبر قدر ممكن من الدقة، ومع ذلك قد تحدث تحديثات أو تعديلات دون إشعار مسبق.",
    ],
  },
  {
    Icon: IconChat,
    title: "الطلبات والتواصل",
    content: [
      "يحق للمتجر مراجعة أو تأكيد الطلبات والتواصل مع العميل عند الحاجة لإتمام البيانات أو تأكيد تفاصيل الشحن والدفع.",
    ],
  },
];

type Company = { nameAr?: string; addressAr?: string; phone?: string; whatsapp?: string; email?: string; taxNumber?: string };

export default function PrivacyPage() {
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
            <span className="text-[#BC9255]">الخصوصية</span>
            <span className="block text-white/90 text-2xl sm:text-4xl lg:text-5xl mt-2">واتفاقية الاستخدام</span>
          </h1>

          <p {...anim(350)} className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            الشروط العامة المنظمة لاستخدام موقع لمسه للاجهزه الذكيه
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

        {/* ════════ STORE INFO ════════ */}
        {company && (
          <FadeUp delay={sections.length * 100}>
            <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300" style={{ border: "1px solid rgba(188,146,85,0.2)" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-1 sm:w-1 sm:h-auto shrink-0" style={{ background: "linear-gradient(to bottom, #0A1825, #1a3a5c)" }} />
                <div className="flex-1 p-4 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-[#0A1825] group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: "rgba(10,24,37,0.08)" }}>
                      <IconLock />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-[#0A1825]">معلومات المتجر</h2>
                      <div className="h-0.5 w-8 mt-1 rounded-full" style={{ background: "linear-gradient(to left, #0A1825, #1a3a5c)" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {company.nameAr    && <p className="text-gray-600 text-sm sm:text-base"><span className="font-semibold text-[#0A1825]">اسم الجهة:</span> {company.nameAr}</p>}
                    {company.addressAr && <p className="text-gray-600 text-sm sm:text-base"><span className="font-semibold text-[#0A1825]">العنوان:</span> {company.addressAr}</p>}
                    {company.phone     && <p className="text-gray-600 text-sm sm:text-base"><span className="font-semibold text-[#0A1825]">الهاتف:</span> {company.phone}</p>}
                    {company.email     && <p className="text-gray-600 text-sm sm:text-base break-all"><span className="font-semibold text-[#0A1825]">البريد الإلكتروني:</span> {company.email}</p>}
                    {company.taxNumber && <p className="text-gray-600 text-sm sm:text-base"><span className="font-semibold text-[#0A1825]">الرقم الضريبي:</span> {company.taxNumber}</p>}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        <ContactSection
          title="وسائل التواصل"
          phone={company?.whatsapp}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}
