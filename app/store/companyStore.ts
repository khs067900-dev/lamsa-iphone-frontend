import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CompanyStore {
  logo: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  details: string;
  fetchCompany: () => Promise<void>;
  setLogo: (url: string) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  logo: "",
  nameAr: "",
  nameEn: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  details: "",
  fetchCompany: async () => {
    try {
      const res = await fetch(`/api/admin/company`, { credentials: "include" });
      const data = await res.json();
      const fullLogo = data.logo
        ? (data.logo.startsWith("http") ? data.logo : `${API}${data.logo}`)
        : "";
      set({
        logo: fullLogo,
        nameAr: data.nameAr || "",
        nameEn: data.nameEn || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        details: data.details || "",
      });
    } catch (e) { console.error(e); }
  },
  // keep fetchLogo as alias for backward compat
  setLogo: (url) => set({ logo: url }),
}));

// backward compat alias
export const useCompanyStoreLegacy = useCompanyStore;
