import Image from "next/image";
import ContactSection from "../components/ContactSection";

const IconMada = () => (
  <Image src="/mada975b.png" alt="مدى" width={72} height={44} loading="lazy" sizes="72px" className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
);
const IconVisa = () => (
  <Image src="/cc975b.png" alt="بطاقات ائتمان" width={72} height={44} loading="lazy" sizes="72px" className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
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
  { title: "ملاحظة هامة", Icon: IconInfo, content: ["نحرص في لمسه للأجهزة الذكية على توفير تجربة دفع واضحة وآمنة.", "بعد إتمام الطلب سيتم مراجعة البيانات والتواصل مع العميل عند الحاجة لتأكيد التفاصيل أو استكمال إجراءات الطلب."] },
];

interface Company { phone?: string; whatsapp?: string; email?: string; [k: string]: string | undefined; }

export default function PaymentClient({ company }: { company: Company }) {
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
            دفع آمن ومعتمد
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
            طرق{" "}
            <span className="text-[#BC9255]">الدفع</span>
          </h1>

          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            طرق دفع متعددة وآمنة لتسهيل تجربة الشراء داخل المتجر
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "linear-gradient(to right, transparent, #BC9255, transparent)" }} />
      </section>

      {/* ══ PAYMENT METHOD CARDS ══ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentMethods.map((m) => (
            <div key={m.title} className="bg-white rounded-2xl p-6 shadow-sm border border-[#BC9255]/15 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-[#BC9255] to-[#A77D4B] shadow-md">
                <m.Icon />
              </div>
              <h2 className="text-lg font-bold text-[#0A1825] mb-2">{m.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ POLICY DETAILS ══ */}
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
            title="هل لديك استفسار عن الدفع؟"
            phone={company.phone || company.whatsapp}
            whatsapp={company.whatsapp}
            email={company.email}
          />
        </div>
      </section>
    </main>
  );
}
