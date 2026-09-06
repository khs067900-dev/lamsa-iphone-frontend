"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import ContactSection from "../components/ContactSection";

function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const IconMada = () => (
  <Image src="/mada975b.png" alt="مدى" width={72} height={44} className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
);
const IconVisa = () => (
  <Image src="/cc975b.png" alt="بطاقات ائتمان" width={72} height={44} className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
);
const IconInstallment = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="36" height="32" rx="4"/>
    <path d="M16 24h16M16 30h10"/>
    <path d="M24 8v4M16 8v4M32 8v4"/>
    <circle cx="34" cy="30" r="5" fill="white" fillOpacity=".2" stroke="white"/>
    <path d="M32 30l1.5 1.5L35 28.5" strokeWidth="1.5"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4l16 6v12c0 9-7 17-16 20C8 39 1 31 1 22V10l16-6z" fill="white" fillOpacity=".15"/>
    <path d="M17 24l5 5 9-10"/>
  </svg>
);
const IconCurrency = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18"/>
    <path d="M24 10v28M18 16h9a5 5 0 010 10h-9v-10zM18 26h10a5 5 0 010 10h-10"/>
  </svg>
);
const IconShipping = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="14" width="28" height="20" rx="2"/>
    <path d="M30 20h8l6 8v6h-14V20z"/>
    <circle cx="12" cy="36" r="4"/>
    <circle cx="36" cy="36" r="4"/>
    <path d="M2 22h28"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18"/>
    <line x1="24" y1="16" x2="24" y2="16" strokeWidth="3"/>
    <line x1="24" y1="22" x2="24" y2="34"/>
  </svg>
);

const paymentMethods = [
  { title: "بطاقة مدى", desc: "ادفع بسهولة عبر بطاقة مدى المحلية.", imgBg: true, Icon: IconMada },
  { title: "بطاقات الائتمان", desc: "نقبل فيزا وماستركارد وجميع البطاقات الائتمانية.", imgBg: true, Icon: IconVisa },
  { title: "الأقساط", desc: "اشتري الآن وادفع على دفعات شهرية مريحة بدون فوائد.", imgBg: false, Icon: IconInstallment },
];

const sections = [
  { title: "الدفع المعتمد", Icon: IconShield, content: ["يتم توفير طرق دفع متعددة وآمنة تناسب احتياجات العملاء."] },
  { title: "العملة المستخدمة", Icon: IconCurrency, content: ["العملة الرسمية المستخدمة في جميع المعاملات هي الريال السعودي (SAR)."] },
  { title: "التحويل والشحن", Icon: IconShipping, content: ["يتم تنسيق الشحن بعد تأكيد الطلب حسب بيانات العميل."] },
  { title: "ملاحظة هامة", Icon: IconInfo, content: ["نحرص في مؤسسة بصمة هاتفي المعتمد  على توفير تجربة دفع واضحة وآمنة.", "بعد إتمام الطلب سيتم مراجعة البيانات والتواصل مع العميل عند الحاجة لتأكيد التفاصيل أو استكمال إجراءات الطلب."] },
];

interface Company { phone?: string; whatsapp?: string; email?: string; [k: string]: string | undefined; }

export default function PaymentClient({ company }: { company: Company }) {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    },
  });

  return (
    <main className="min-h-screen bg-[#faf7f2] overflow-x-hidden" dir="rtl">

      {/* ══ HERO ══ */}
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
            مؤسسة بصمة هاتفي المعتمد
          </div>

          <h1 {...anim(200)} className="text-2xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
            تعرف على وسائل{" "}
            <span className="text-[#BC9255]">الدفع</span>
            <span className="block text-white/90 text-xl sm:text-4xl lg:text-5xl mt-2">المتاحة</span>
          </h1>

          <p {...anim(350)} className="text-white/70 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            طرق دفع متعددة وآمنة تناسب احتياجات عملائنا
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "linear-gradient(to right, transparent, #BC9255, transparent)" }} />
      </section>

      {/* ══ PAYMENT METHODS ══ */}
      <section className="w-full px-3 sm:px-8 lg:px-20 pt-10 pb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {paymentMethods.map((m, i) => (
            <FadeUp key={m.title} delay={i * 80}>
              <div className="group relative bg-white rounded-2xl p-4 sm:p-5 text-center overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center" style={{ border: "1px solid rgba(188,146,85,0.2)" }}>
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(to right, #BC9255, #A77D4B)" }} />
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md group-hover:scale-110 transition-transform duration-300 ${
                  m.imgBg ? "bg-white border p-2 sm:p-3" : "text-white"
                }`} style={m.imgBg ? { borderColor: "rgba(188,146,85,0.3)" } : { background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>
                  <m.Icon />
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0A1825] mb-1">{m.title}</p>
                <p className="text-[10px] sm:text-xs text-[#A77D4B]/80 leading-relaxed">{m.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══ INFO SECTIONS ══ */}
      <section className="w-full px-3 sm:px-8 lg:px-20 py-8 sm:py-10 max-w-5xl mx-auto space-y-4 sm:space-y-5">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 100}>
            <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300" style={{ border: "1px solid rgba(188,146,85,0.2)" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-1 sm:w-1 sm:h-auto shrink-0" style={{ background: "linear-gradient(to bottom, #BC9255, #A77D4B)" }} />
                <div className="flex-1 p-4 sm:p-7">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md group-hover:scale-105 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>
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
          title="التواصل بخصوص الدفع"
          phone={company.phone}
          whatsapp={company.whatsapp}
          email={company.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-10 sm:h-16" />
    </main>
  );
}
