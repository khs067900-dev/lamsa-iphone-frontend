import { create } from "zustand";

interface CompanyState {
  whatsapp: string | null;
  fetchCompany: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  whatsapp: null,
  fetchCompany: async () => {
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      set({ whatsapp: data?.whatsapp ?? null });
    } catch {
      // silently fail
    }
  },
}));
