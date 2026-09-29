import { create } from "zustand";

interface CompanyState {
  logo: string;
  whatsapp: string;
  email: string;
  setLogo: (logo: string) => void;
  fetchCompany: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  logo: "",
  whatsapp: "",
  email: "",
  setLogo: (logo) => set({ logo }),
  fetchCompany: async () => {
    if (get().logo) return;
    try {
      const res = await fetch("/api/company");
      if (!res.ok) return;
      const data = await res.json();
      set({
        logo: data.logo ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
      });
    } catch {}
  },
}));
