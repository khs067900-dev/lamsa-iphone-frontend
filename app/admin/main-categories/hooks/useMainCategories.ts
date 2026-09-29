"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { normalizeArabic } from "../../_utils/text";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";
const PAGE_SIZE = 10;

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // [PERF] Stable fetchCategories reference with proper loading/error tracking
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiFetch(`${BASE}/extra`, { credentials: "include" });
      if (res.ok) {
        const data: Category[] = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        toast.error("فشل تحميل التصنيفات");
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // [PERF] Arabic-normalized search
  const filtered = useMemo(() => {
    const q = normalizeArabic(search);
    if (!q) return categories;
    return categories.filter((c) => normalizeArabic(c.name).includes(q));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      return setError("يرجى إدخال اسم التصنيف");
    }
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: cleanName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء الإضافة");
        return;
      }
      setShowModal(false);
      setName("");
      toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);
      await fetchCategories();
    } catch (err) {
      console.error("handleAdd error:", err);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [name, fetchCategories]);

  const handleEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCat) return;
    const cleanName = editName.trim();
    if (!cleanName) {
      return setEditError("يرجى إدخال اسم التصنيف");
    }
    setEditError("");
    setEditLoading(true);
    try {
      const res = await apiFetch(`${BASE}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldName: editCat.name, newName: cleanName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "حدث خطأ أثناء التعديل");
        return;
      }
      setEditCat(null);
      toast.success("تم حفظ التعديلات بنجاح ✅");
      await fetchCategories();
    } catch (err) {
      console.error("handleEdit error:", err);
      setEditError("خطأ في الاتصال بالخادم");
    } finally {
      setEditLoading(false);
    }
  }, [editCat, editName, fetchCategories]);

  const confirmDeleteAction = useCallback(async () => {
    if (!confirmDelete) return;
    const catName = confirmDelete;
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`${BASE}/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: catName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "حدث خطأ أثناء الحذف");
        return;
      }
      setConfirmDelete(null);
      toast.success(`تم حذف "${catName}" بنجاح ✅`);
      await fetchCategories();
    } catch (err) {
      console.error("confirmDeleteAction error:", err);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setDeleteLoading(false);
    }
  }, [confirmDelete, fetchCategories]);

  return {
    categories,
    filtered,
    paginated,
    fetching,
    search,
    setSearch: handleSearchChange,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    showModal,
    setShowModal,
    name,
    setName,
    error,
    loading,
    handleAdd,
    editCat,
    setEditCat,
    editName,
    setEditName,
    editError,
    editLoading,
    handleEdit,
    confirmDelete,
    setConfirmDelete,
    deleteLoading,
    confirmDeleteAction,
  };
}
