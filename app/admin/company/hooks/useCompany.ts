"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { API, defaultData, toFullUrl, withCacheBust } from "../constants";
import type { CompanyData } from "../types";

export function useCompany() {
  const { setLogo } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/company`)
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

  const handleChange = (key: string, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "فشل رفع الصورة"); return; }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      handleChange(key, fullUrl);
      if (key === "logo") { setLogo(withCacheBust(fullUrl)); }
      toast.success("تم رفع الصورة");
    } catch (e) {
      console.error(e);
      toast.error("فشل رفع الصورة");
    }
  };

  const handleImageDelete = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { toast.error("فشل حذف الصورة"); return; }
      handleChange(key, "");
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل حذف الصورة");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await fetch("/api/revalidate?tag=company", { method: "POST" });
      toast.success("تم حفظ بيانات الشركة");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, saving, handleChange, handleImageChange, handleImageDelete, handleSave };
}
