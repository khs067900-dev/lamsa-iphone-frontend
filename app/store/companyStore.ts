import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// In-memory cache: avoid re-fetching on every Navbar mount
let _cache: CompanyStore | null = null;
let _cacheTs = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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
    // Return cached data if still fresh
    if (_cache && Date.now() - _cacheTs < CACHE_TTL) {
      set(_cache);
      return;
    }
    try {
      const res = await fetch(`/api/company`, { credentials: "include" });
      const data = await res.json();
      const fullLogo = data.logo
        ? (data.logo.startsWith("http") ? data.logo : `${API}${data.logo}`)
        : "";
      const next = {
        logo: fullLogo,
        nameAr: data.nameAr || "",
        nameEn: data.nameEn || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        details: data.details || "",
      };
      _cache = { ...next, fetchCompany: async () => {}, setLogo: () => {} };
      _cacheTs = Date.now();
      set(next);
    } catch (e) { console.error(e); }
  },
  setLogo: (url) => set({ logo: url }),
}));

export const useCompanyStoreLegacy = useCompanyStore;
