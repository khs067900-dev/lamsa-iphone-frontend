import ContactSection from "../components/ContactSection";

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

export default function ReturnPolicyClient({ whatsapp, email, phone }: Company) {
  return (
    <main className="min-h-screen bg-[#faf7f2] overflow-x-hidden" dir="rtl">
      {/* ══ HERO ══ */}
      <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0A1825 0%, #122a42 50%, #0A1825 100%)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #BC9255, transparent)" }} />
        </div>

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6" style={{ backgroundColor: "rgba(188,146,85,0.15)", color: "#BC9255", border: "1px solid rgba(188,146,85,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC9255] animate-pulse" />
            سياسة واضحة وعادلة
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
            سياسة{" "}
            <span className="text-[#BC9255]">الاستبدال</span> والاسترجاع
          </h1>

          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل متجر لمسه للأجهزة الذكية
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "linear-gradient(to right, transparent, #BC9255, transparent)" }} />
      </section>

      {/* ══ SECTIONS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-6 border border-[#BC9255]/15 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#BC9255]/10 flex items-center justify-center text-[#BC9255]">
                <s.Icon />
              </div>
              <h2 className="text-lg font-bold text-[#0A1825]">{s.title}</h2>
            </div>
            <div className="space-y-1.5 text-gray-600 text-sm leading-relaxed pr-13">
              {s.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <ContactSection
            title="تحتاج مساعدة بشأن طلبك؟"
            phone={phone || whatsapp}
            whatsapp={whatsapp}
            email={email}
          />
        </div>
      </section>
    </main>
  );
}
