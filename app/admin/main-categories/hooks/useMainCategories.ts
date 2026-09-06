"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(() => {
    fetch(`${BASE}/extra`, { credentials: "include" })
      .then(async (res) => {
        const data: Category[] = res.ok ? await res.json() : [];
        setCategories(data);
      });
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setShowModal(false);
    setName("");
    toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);
    fetchCategories();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    const res = await fetch(`${BASE}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldName: editCat!.name, newName: editName }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok) return setEditError(data.error);
    setEditCat(null);
    toast.success("تم حفظ التعديلات بنجاح ✅");
    fetchCategories();
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const catName = confirmDelete;
    setConfirmDelete(null);
    const res = await fetch(`${BASE}/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: catName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success(`تم حذف "${catName}" بنجاح ✅`);
    fetchCategories();
  }

  const filtered = categories.filter((c) => c.name.includes(search));

  return {
    categories, filtered, search, setSearch,
    showModal, setShowModal, name, setName, error, loading, handleAdd,
    editCat, setEditCat, editName, setEditName, editError, editLoading, handleEdit,
    confirmDelete, setConfirmDelete, confirmDeleteAction,
  };
}
