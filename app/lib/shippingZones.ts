export function checkShipping(city: string, state: string): { available: boolean; cost: number; label: string } {
  const zones = [
    { names: ["riyadh","الرياض","ar riyad"], cost: 25, label: "الرياض" },
    { names: ["jeddah","جدة","jiddah"], cost: 30, label: "جدة" },
    { names: ["mecca","مكة","makkah"], cost: 30, label: "مكة المكرمة" },
    { names: ["medina","المدينة","al madinah"], cost: 30, label: "المدينة المنورة" },
    { names: ["dammam","الدمام"], cost: 35, label: "الدمام" },
    { names: ["khobar","الخبر","al khobar"], cost: 35, label: "الخبر" },
    { names: ["dhahran","الظهران"], cost: 35, label: "الظهران" },
    { names: ["tabuk","تبوك"], cost: 40, label: "تبوك" },
    { names: ["abha","أبها"], cost: 40, label: "أبها" },
    { names: ["taif","الطائف"], cost: 35, label: "الطائف" },
    { names: ["hail","حائل"], cost: 40, label: "حائل" },
    { names: ["najran","نجران"], cost: 45, label: "نجران" },
    { names: ["jizan","جازان","jazan"], cost: 45, label: "جازان" },
    { names: ["al qassim","القصيم","buraydah","بريدة"], cost: 35, label: "القصيم" },
  ];
  const search = [city, state].join(" ").toLowerCase();
  for (const zone of zones) {
    if (zone.names.some(n => search.includes(n.toLowerCase()))) {
      return { available: true, cost: zone.cost, label: zone.label };
    }
  }
  return { available: false, cost: 0, label: "" };
}
