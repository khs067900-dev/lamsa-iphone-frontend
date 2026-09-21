"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { API, defaultData, toFullUrl, withCacheBust } from "../constants";
import type { CompanyData } from "../types";
import { apiFetch } from "../../../lib/api";

export function useCompany() {
  const { setLogo } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/company")
      .then((r) => r.json())
      .then((res) => {
        const imageKeys = ["logo", "header", "footer", "stamp"];
        const merged: CompanyData = { ...defaultData };
        for (const k of Object.keys(defaultData)) {
          if (res[k] !== undefined && res[k] !== "") {
            merged[k] = imageKeys.includes(k) ? toFullUrl(res[k]) : res[k];
          }
        }
        setData(merged);
      })
      .catch(() => toast.error("فشل تحميل بيانات الشركة"))
      .finally(() => setLoading(false));
  }, []);

  // [PERF] Stable reference — not recreated on every render.
  const handleChange = useCallback((key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // [PERF] Stable reference — deps are only setLogo which is stable from Zustand.
  const handleImageChange = useCallback(async (key: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await apiFetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "فشل رفع الصورة"); return; }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      setData((prev) => ({ ...prev, [key]: fullUrl }));
      if (key === "logo") setLogo(withCacheBust(fullUrl));
      toast.success("تم رفع الصورة");
    } catch (e) {
      console.error(e);
      toast.error("فشل رفع الصورة");
    }
  }, [setLogo]);

  const handleImageDelete = useCallback(async (key: string) => {
    try {
      const res = await apiFetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { toast.error("فشل حذف الصورة"); return; }
      setData((prev) => ({ ...prev, [key]: "" }));
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل حذف الصورة");
    }
  }, [setLogo]);

  // [PERF] Removed redundant /api/revalidate fetch — the Next.js proxy PUT route
  // already calls revalidateTag("company") server-side, so a second client-side
  // revalidation request was a wasted round-trip.
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حفظ بيانات الشركة");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [data]);

  return { data, loading, saving, handleChange, handleImageChange, handleImageDelete, handleSave };
}
