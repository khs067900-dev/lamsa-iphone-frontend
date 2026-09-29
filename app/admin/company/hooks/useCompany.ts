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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch("/api/admin/company")
      .then((r) => r.json())
      .then((res) => {
        if (!isMounted) return;
        const imageKeys = ["logo", "header", "footer", "stamp", "cancelStamp"];
        const merged: CompanyData = { ...defaultData };
        for (const k of Object.keys(defaultData)) {
          if (res[k] !== undefined && res[k] !== "") {
            merged[k] = imageKeys.includes(k) ? toFullUrl(res[k]) : res[k];
          }
        }
        setData(merged);
      })
      .catch((err) => {
        console.error("Fetch company error:", err);
        if (isMounted) toast.error("فشل تحميل بيانات الشركة");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleImageChange = useCallback(async (key: string, file: File) => {
    setUploadingKey(key);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await apiFetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "فشل رفع الصورة");
        return;
      }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      setData((prev) => ({ ...prev, [key]: fullUrl }));
      if (key === "logo") setLogo(withCacheBust(fullUrl));
      toast.success("تم رفع الصورة بنجاح ✅");
    } catch (e) {
      console.error(e);
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingKey(null);
    }
  }, [setLogo]);

  const handleImageDelete = useCallback(async (key: string) => {
    setUploadingKey(key);
    try {
      const res = await apiFetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("فشل حذف الصورة");
        return;
      }
      setData((prev) => ({ ...prev, [key]: "" }));
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة ✅");
    } catch {
      toast.error("فشل حذف الصورة");
    } finally {
      setUploadingKey(null);
    }
  }, [setLogo]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Trim string inputs
      const cleanData: CompanyData = {};
      for (const [k, v] of Object.entries(data)) {
        cleanData[k] = typeof v === "string" ? v.trim() : v;
      }

      const res = await apiFetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanData),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حفظ بيانات الشركة بنجاح ✅");
    } catch (err) {
      console.error("Save company error:", err);
      toast.error("فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  }, [data]);

  return {
    data,
    loading,
    saving,
    uploadingKey,
    handleChange,
    handleImageChange,
    handleImageDelete,
    handleSave,
  };
}
