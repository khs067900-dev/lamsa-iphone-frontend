"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { BannerItem } from "../types";

const BASE = "/api/admin/banners";

export function useBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [addingBanner, setAddingBanner] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch(BASE, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setBanners(data));
  }, []);

  const handleUpload = async (index: number, file: File) => {
    setLoading(index);
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch(`${BASE}/upload/${index}`, {
        method: "POST", credentials: "include", body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: data.url } : b));
      toast.success("تم رفع البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteImage = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}/image`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: "" } : b));
      toast.success("تم حذف الصورة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSlot = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.filter((_, i) => i !== index));
      toast.success("تم حذف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  const handleToggle = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/toggle/${index}`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, active: data.active } : b));
      toast.success(data.active ? "تم تفعيل البانر" : "تم إيقاف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل التعديل");
    } finally {
      setLoading(null);
    }
  };

  const handleAddBanner = async () => {
    setAddingBanner(true);
    try {
      const res = await fetch(`${BASE}/add`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => [...prev, { url: "", active: true }]);
      toast.success("تمت إضافة بانر جديد");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت الإضافة");
    } finally {
      setAddingBanner(false);
    }
  };

  return { banners, loading, addingBanner, inputRefs, handleUpload, handleDeleteImage, handleDeleteSlot, handleToggle, handleAddBanner };
}
