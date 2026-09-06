import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { IoStorefrontOutline, IoShieldCheckmarkOutline, IoCardOutline } from "react-icons/io5";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${API}/api/admin/company`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export default async function Footer() {
  const c = await getCompany();

  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return url;
    const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
    return `/file?url=${encodeURIComponent(rawUrl)}`;
  }

  const qrSrc: string = c.qrImage || "";
  const qrLinkType: string = c.qrLinkType || "link";
  const qrLink: string = qrLinkType === "file" ? toInlineUrl(c.qrFile || "") : ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const linkType1: string = c.linkType1 || c.link1Type || "link";
  const link1: string = linkType1 === "file" ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");
  const img2: string = c.img2 || "";
  const linkType2: string = c.linkType2 || c.link2Type || "link";
  const link2: string = linkType2 === "file" ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    return item.linkType === "link" ? ensureAbsolute(item.link) : toInlineUrl(item.file);
  }

  const links = [
    { label: "عن لمسه للاجهزه الذكيه", href: "/about" },
    { label: "طرق الدفع", href: "/payment" },
    { label: "سياسة الاستبدال والاسترجاع", href: "/return-policy" },
    { label: "سياسة الخصوصية", href: "/privacy" },
  ];

  return (
    <footer className="relative mt-16" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Curved top separator */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full overflow-hidden h-16">
        <svg viewBox="0 0 1440 64" fill="none" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0 64H1440V0C1440 0 1140 48 720 48C300 48 0 0 0 0V64Z" fill="#1F2C3E" />
        </svg>
      </div>

      {/* Main footer */}
      <div style={{ backgroundColor: '#1F2C3E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">

          {/* Top section - Logo & tagline */}
          <div className="flex flex-col items-center text-center mb-10 pb-8 border-b border-[#A77D4B]/20">
            <div className="flex items-center gap-3 mb-3">
              <IoStorefrontOutline size={28} style={{ color: '#DFC4A4' }} />
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#DFC4A4' }}>
                لمسه للأجهزة الذكية
              </h2>
            </div>
            <p className="text-sm max-w-md" style={{ color: '#e8ddd0' }}>
              {c.details || "اختيارك الأول لشراء أجهزتك بالأقساط داخل السعودية، ضمان موثوق وخدمة محلية"}
            </p>
            {/* Features badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              {[
                { icon: <IoShieldCheckmarkOutline size={14} />, text: "ضمان معتمد" },
                { icon: <IoCardOutline size={14} />, text: "تقسيط مريح" },
                { icon: <FaMapMarkerAlt size={12} />, text: "توصيل سريع" },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(167,125,75,0.15)', color: '#DFC4A4', border: '1px solid rgba(167,125,75,0.3)' }}>
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* Grid section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#DFC4A4' }}>
                <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: '#A77D4B' }} />
                روابط سريعة
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-[13px] transition-colors duration-200 hover:translate-x-1 inline-block text-[rgba(245,240,232,0.7)] hover:text-[#DFC4A4]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#DFC4A4' }}>
                <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: '#A77D4B' }} />
                تواصل معنا
              </h3>
              <ul className="space-y-3">
                {c.whatsapp && (
                  <li>
                    <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2.5 text-[13px] group" style={{ color: 'rgba(245,240,232,0.7)' }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(167,125,75,0.15)' }}>
                        <FaWhatsapp size={15} style={{ color: '#DFC4A4' }} />
                      </span>
                      <span dir="ltr" className="group-hover:text-[#DFC4A4] transition-colors">{c.whatsapp}</span>
                    </a>
                  </li>
                )}
                {c.phone && (
                  <li>
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2.5 text-[13px] group" style={{ color: 'rgba(245,240,232,0.7)' }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(167,125,75,0.15)' }}>
                        <FaMobileAlt size={15} style={{ color: '#DFC4A4' }} />
                      </span>
                      <span dir="ltr" className="group-hover:text-[#DFC4A4] transition-colors">{c.phone}</span>
                    </a>
                  </li>
                )}
                {c.email && (
                  <li>
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-[13px] group" style={{ color: 'rgba(245,240,232,0.7)' }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(167,125,75,0.15)' }}>
                        <FaEnvelope size={15} style={{ color: '#DFC4A4' }} />
                      </span>
                      <span dir="ltr" className="group-hover:text-[#DFC4A4] transition-colors">{c.email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Badges / Images */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#DFC4A4' }}>
                <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: '#A77D4B' }} />
                شركاؤنا
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                {qrSrc && (
                  qrLink
                    ? <a href={qrLink} target="_blank" rel="noreferrer" className="shrink-0 p-2 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={qrSrc} alt="qr" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </a>
                    : <span className="shrink-0 p-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={qrSrc} alt="qr" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </span>
                )}

                {footerItems.map((item, i) => {
                  const href = getHref(item);
                  const el = (
                    <Image key={i} src={item.image} alt={`footer-item-${i}`} width={56} height={56}
                      className="rounded object-contain" style={{ width: 56, height: 56 }} />
                  );
                  return href
                    ? <a key={i} href={href} target="_blank" rel="noreferrer" className="shrink-0 p-2 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>{el}</a>
                    : <span key={i} className="shrink-0 p-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>{el}</span>;
                })}

                {img1 && (
                  link1
                    ? <a href={link1} target="_blank" rel="noreferrer" className="shrink-0 p-2 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={img1} alt="img1" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </a>
                    : <span className="shrink-0 p-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={img1} alt="img1" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </span>
                )}

                {img2 && (
                  link2
                    ? <a href={link2} target="_blank" rel="noreferrer" className="shrink-0 p-2 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={img2} alt="img2" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </a>
                    : <span className="shrink-0 p-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,125,75,0.2)' }}>
                        <Image src={img2} alt="img2" width={56} height={56} className="rounded object-contain" style={{ width: 56, height: 56 }} />
                      </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-[#A77D4B]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/cc975b.png" alt="cc" width={50} height={30} className="object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ width: 50, height: 30 }} />
              <Image src="/mada975b.png" alt="mada" width={50} height={30} className="object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ width: 50, height: 30 }} />
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'rgba(223,196,164,0.85)' }}>
              جميع الحقوق محفوظة © {new Date().getFullYear()} — لمسه للأجهزة الذكية
            </span>
          </div>
        </div>
      </div>
      <div className="sbc-verify-seal" data-token="MStxS0d2Q1pNbVF0ZkhEVitKdkd6UT09" data-position="bottom-left" />
    </footer>
  );
}
