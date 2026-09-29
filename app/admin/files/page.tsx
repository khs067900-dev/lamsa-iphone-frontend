"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiUpload, FiLink, FiExternalLink, FiTrash2, FiPlus, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type FooterItem = { image: string; linkType: string; link: string; file: string };
type Data = {
  qrImage: string; qrLink: string; qrLinkType: string; qrFile: string;
  img1: string; link1: string; linkType1: string; link1Type: string; file1: string;
  img2: string; link2: string; linkType2: string; link2Type: string; file2: string;
  footerItems: FooterItem[];
};

const EMPTY_DATA: Data = {
  qrImage: "", qrLink: "", qrLinkType: "link", qrFile: "",
  img1: "", link1: "", linkType1: "link", link1Type: "link", file1: "",
  img2: "", link2: "", linkType2: "link", link2Type: "link", file2: "",
  footerItems: [],
};

function normalizeItem(item: Partial<FooterItem>): FooterItem {
  return {
    image: item.image || "",
    linkType: item.linkType || (item.file ? "file" : "link"),
    link: item.link || "",
    file: item.file || "",
  };
}

export default function FilesPage() {
  const [data, setData] = useState<Data>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [imgKeys, setImgKeys] = useState<Record<string, number>>({});

  const qrRef      = useRef<HTMLInputElement>(null);
  const qrFileRef  = useRef<HTMLInputElement>(null);
  const img1Ref    = useRef<HTMLInputElement>(null);
  const img2Ref    = useRef<HTMLInputElement>(null);
  const fileRef1   = useRef<HTMLInputElement>(null);
  const fileRef2   = useRef<HTMLInputElement>(null);
  const imgRefs    = useRef<Record<number, HTMLInputElement | null>>({});
  const fileRefs   = useRef<Record<number, HTMLInputElement | null>>({});

  const bumpKey = useCallback((k: string) => {
    setImgKeys((p) => ({ ...p, [k]: Date.now() }));
  }, []);

  // Fetch initial company files data
  useEffect(() => {
    let isMounted = true;
    apiFetch("/api/admin/company", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        const items = (d.footerItems && d.footerItems.length > 0
          ? d.footerItems
          : [{ image: "", linkType: "link", link: "", file: "" },
             { image: "", linkType: "link", link: "", file: "" },
             { image: "", linkType: "link", link: "", file: "" }]
        ).map(normalizeItem);

        const lType1 = d.linkType1 || d.link1Type || (d.file1 ? "file" : "link");
        const lType2 = d.linkType2 || d.link2Type || (d.file2 ? "file" : "link");

        setData({
          qrImage: d.qrImage || "",
          qrLink: d.qrLink || "",
          qrLinkType: d.qrLinkType || (d.qrFile ? "file" : "link"),
          qrFile: d.qrFile || "",
          img1: d.img1 || "",
          link1: d.link1 || "",
          linkType1: lType1,
          link1Type: lType1,
          file1: d.file1 || "",
          img2: d.img2 || "",
          link2: d.link2 || "",
          linkType2: lType2,
          link2Type: lType2,
          file2: d.file2 || "",
          footerItems: items,
        });
      })
      .catch((err) => {
        console.error("FilesPage load error:", err);
        toast.error("فشل تحميل البيانات");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openFile = useCallback((url: string) => {
    if (!url) return;
    const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
    window.open(`/api/file-proxy?url=${encodeURIComponent(rawUrl)}`, "_blank", "noopener,noreferrer");
  }, []);

  // Generic asset uploaders with automatic cache-busting
  const uploadImage = useCallback(async (stateKey: keyof Data, endpoint: string, file: File) => {
    setUploading(stateKey);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const r = await apiFetch(endpoint, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => ({ ...p, [stateKey]: json.url }));
        bumpKey(stateKey);
        toast.success("تم رفع الصورة بنجاح ✅");
      } else {
        toast.error(json.error || "فشل رفع الصورة");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setUploading(null);
    }
  }, [bumpKey]);

  const uploadFileAsset = useCallback(async (stateKey: keyof Data, endpoint: string, file: File) => {
    setUploading(stateKey);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await apiFetch(endpoint, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => ({ ...p, [stateKey]: json.url }));
        toast.success("تم رفع الملف بنجاح ✅");
      } else {
        toast.error(json.error || "فشل رفع الملف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setUploading(null);
    }
  }, []);

  const uploadItemImg = useCallback(async (index: number, file: File) => {
    const key = `img-${index}`;
    setUploading(key);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const r = await apiFetch(`/api/admin/company/footer-items/image/${index}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await r.json();
      if (json.url) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], image: json.url };
          return { ...p, footerItems: items };
        });
        bumpKey(key);
        toast.success("تم رفع صورة العنصر بنجاح ✅");
      } else {
        toast.error(json.error || "فشل رفع الصورة");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setUploading(null);
    }
  }, [bumpKey]);

  const uploadItemFile = useCallback(async (index: number, file: File) => {
    const key = `file-${index}`;
    setUploading(key);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await apiFetch(`/api/admin/company/footer-items/file/${index}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await r.json();
      if (json.url) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], file: json.url };
          return { ...p, footerItems: items };
        });
        toast.success("تم رفع ملف العنصر بنجاح ✅");
      } else {
        toast.error(json.error || "فشل رفع الملف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setUploading(null);
    }
  }, []);

  const updateItem = useCallback((index: number, field: keyof FooterItem, value: string) => {
    setData((p) => {
      const items = [...p.footerItems];
      items[index] = { ...items[index], [field]: value };
      return { ...p, footerItems: items };
    });
  }, []);

  const addFooterItem = useCallback(() => {
    setData((p) => ({
      ...p,
      footerItems: [...p.footerItems, { image: "", linkType: "link", link: "", file: "" }],
    }));
    toast.success("تمت إضافة عنصر جديد");
  }, []);

  const removeFooterItem = useCallback(async (index: number) => {
    setData((p) => {
      const items = p.footerItems.filter((_, i) => i !== index);
      return { ...p, footerItems: items };
    });
    // Persist removal to backend
    try {
      const remainingItems = data.footerItems.filter((_, i) => i !== index);
      await apiFetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ footerItems: remainingItems }),
      });
      toast.success("تم حذف العنصر بنجاح ✅");
    } catch {
      toast.error("حدث خطأ أثناء حفظ الحذف");
    }
  }, [data.footerItems]);

  const saveSection = useCallback(async (section: string, body: object) => {
    setSavingSection(section);
    try {
      const r = await apiFetch("/api/admin/company", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      toast.success("تم الحفظ بنجاح ✅");
    } catch {
      toast.error("فشل حفظ التعديلات");
    } finally {
      setSavingSection(null);
    }
  }, []);

  // Save all sections at once
  const handleSaveAll = useCallback(async () => {
    setSavingAll(true);
    try {
      const payload = {
        qrImage: data.qrImage,
        qrLink: data.qrLink,
        qrLinkType: data.qrLinkType,
        qrFile: data.qrFile,
        img1: data.img1,
        link1: data.link1,
        link1Type: data.linkType1,
        linkType1: data.linkType1,
        file1: data.file1,
        img2: data.img2,
        link2: data.link2,
        link2Type: data.linkType2,
        linkType2: data.linkType2,
        file2: data.file2,
        footerItems: data.footerItems,
      };
      const r = await apiFetch("/api/admin/company", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      toast.success("تم حفظ جميع الملفات والإعدادات بنجاح 🎉");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSavingAll(false);
    }
  }, [data]);

  return (
    <div className="w-full space-y-4 sm:space-y-6" dir="rtl">
      {/* Header with Save All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">الملفات والصور والروابط</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">إدارة كيو آر الكود، روابط التذييل، والتراخيص والشهادات</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={savingAll || loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          <FiSave size={16} />
          <span>{savingAll ? "جاري الحفظ..." : "حفظ الكل"}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-xl p-6 h-40 border border-gray-200"></div>
          <div className="bg-white rounded-xl p-6 h-56 border border-gray-200"></div>
          <div className="bg-white rounded-xl p-6 h-40 border border-gray-200"></div>
        </div>
      ) : (
        <>
          {/* QR Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">كيو آر كود (QR Code)</h2>
              <button
                onClick={() => saveSection("qr", {
                  qrImage: data.qrImage,
                  qrLink: data.qrLink,
                  qrLinkType: data.qrLinkType,
                  qrFile: data.qrFile,
                })}
                disabled={savingSection === "qr"}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {savingSection === "qr" ? "جاري..." : "حفظ"}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
              <div className="relative shrink-0">
                <div
                  onClick={() => qrRef.current?.click()}
                  className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
                >
                  {uploading === "qrImage" ? (
                    <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : data.qrImage ? (
                    <>
                      <Image
                        key={imgKeys["qrImage"] || data.qrImage}
                        src={data.qrImage}
                        alt="qr"
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiUpload className="text-white" size={16} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <FiUpload size={20} />
                      <span className="text-[10px]">رفع صورة</span>
                    </div>
                  )}
                  <input
                    ref={qrRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadImage("qrImage", "/api/admin/company/footer-image/qrImage", e.target.files[0])}
                  />
                </div>
                {data.qrImage && (
                  <button
                    onClick={async () => {
                      setData((p) => ({ ...p, qrImage: "" }));
                      await saveSection("qr", { qrImage: "" });
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                    title="حذف الصورة"
                  >
                    <FiTrash2 size={10} />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full space-y-2">
                <div className="flex gap-4">
                  {["link", "file"].map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                      <input
                        type="radio"
                        name="type-qr"
                        value={t}
                        checked={(data.qrLinkType || "link") === t}
                        onChange={() => setData((p) => ({ ...p, qrLinkType: t }))}
                        className="accent-blue-600"
                      />
                      {t === "link" ? "رابط" : "ملف"}
                    </label>
                  ))}
                </div>
                <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
                  <span className="shrink-0">⚠️</span>
                  <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
                </div>
                {(data.qrLinkType || "link") === "link" ? (
                  <div key="qr-link" className="flex items-center gap-2 w-full">
                    <FiLink className="text-gray-400 shrink-0" size={15} />
                    <input
                      type="text"
                      value={data.qrLink ?? ""}
                      onChange={(e) => setData((p) => ({ ...p, qrLink: e.target.value }))}
                      placeholder="رابط عند الضغط على الكيو آر..."
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                ) : (
                  <div key="qr-file" className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => qrFileRef.current?.click()}
                      disabled={uploading === "qrFile"}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {uploading === "qrFile" ? (
                        <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiUpload size={13} />
                      )}
                      رفع ملف
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={qrFileRef}
                      onChange={(e) => e.target.files?.[0] && uploadFileAsset("qrFile", "/api/admin/company/footer-file/qrFile", e.target.files[0])}
                    />
                    {data.qrFile && (
                      <>
                        <button
                          onClick={() => openFile(data.qrFile)}
                          className="flex items-center gap-1 text-emerald-600 text-sm hover:underline"
                        >
                          <FiExternalLink size={13} /> عرض الملف
                        </button>
                        <button
                          onClick={async () => {
                            setData((p) => ({ ...p, qrFile: "" }));
                            await saveSection("qr", { qrFile: "" });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs hover:underline"
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Items Section (معروف وغيره) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-700">عناصر التذييل (معروف والشهادات)</h2>
                <button
                  onClick={addFooterItem}
                  className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
                >
                  <FiPlus size={12} />
                  <span>إضافة عنصر</span>
                </button>
              </div>
              <button
                onClick={() => saveSection("items", { footerItems: data.footerItems })}
                disabled={savingSection === "items"}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {savingSection === "items" ? "جاري..." : "حفظ"}
              </button>
            </div>
            {data.footerItems.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                لا توجد عناصر — اضغط &quot;إضافة عنصر&quot; للبدء
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.footerItems.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
                    <div className="relative shrink-0">
                      <div
                        onClick={() => imgRefs.current[i]?.click()}
                        className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
                      >
                        {uploading === `img-${i}` ? (
                          <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : item.image ? (
                          <>
                            <Image
                              key={imgKeys[`img-${i}`] || item.image}
                              src={item.image}
                              alt="preview"
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <FiUpload className="text-white" size={16} />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                            <FiUpload size={20} />
                            <span className="text-[10px]">رفع صورة</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => { imgRefs.current[i] = el; }}
                          onChange={(e) => e.target.files?.[0] && uploadItemImg(i, e.target.files[0])}
                        />
                      </div>
                      {item.image && (
                        <button
                          onClick={() => updateItem(i, "image", "")}
                          className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                          title="حذف الصورة"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          {["link", "file"].map((t) => (
                            <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                              <input
                                type="radio"
                                name={`type-${i}`}
                                value={t}
                                checked={(item.linkType ?? "link") === t}
                                onChange={() => updateItem(i, "linkType", t)}
                                className="accent-blue-600"
                              />
                              {t === "link" ? "رابط" : "ملف"}
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => removeFooterItem(i)}
                          className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 p-1"
                          title="حذف هذا العنصر بالكامل"
                        >
                          <FiTrash2 size={13} />
                          <span>حذف العنصر</span>
                        </button>
                      </div>
                      {(item.linkType ?? "link") === "link" ? (
                        <div key={`link-input-${i}`} className="flex items-center gap-2 w-full">
                          <FiLink className="text-gray-400 shrink-0" size={15} />
                          <input
                            type="text"
                            value={item.link ?? ""}
                            onChange={(e) => updateItem(i, "link", e.target.value)}
                            placeholder="https://..."
                            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      ) : (
                        <div key={`file-input-${i}`} className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => fileRefs.current[i]?.click()}
                            disabled={uploading === `file-${i}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                          >
                            {uploading === `file-${i}` ? (
                              <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiUpload size={13} />
                            )}
                            رفع ملف
                          </button>
                          <input
                            type="file"
                            className="hidden"
                            ref={(el) => { fileRefs.current[i] = el; }}
                            onChange={(e) => e.target.files?.[0] && uploadItemFile(i, e.target.files[0])}
                          />
                          {item.file && (
                            <>
                              <button
                                onClick={() => openFile(item.file)}
                                className="flex items-center gap-1 text-emerald-600 text-sm hover:underline"
                              >
                                <FiExternalLink size={13} /> عرض الملف
                              </button>
                              <button
                                onClick={() => updateItem(i, "file", "")}
                                className="text-red-500 hover:text-red-700 text-xs hover:underline"
                              >
                                حذف
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1 (مركز الاعمال السعودي) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">مركز الأعمال السعودي (الترخيص 1)</h2>
              <button
                onClick={() => saveSection("s1", {
                  img1: data.img1,
                  link1: data.link1,
                  link1Type: data.linkType1,
                  linkType1: data.linkType1,
                  file1: data.file1,
                })}
                disabled={savingSection === "s1"}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {savingSection === "s1" ? "جاري..." : "حفظ"}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
              <div className="relative shrink-0">
                <div
                  onClick={() => img1Ref.current?.click()}
                  className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
                >
                  {uploading === "img1" ? (
                    <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : data.img1 ? (
                    <>
                      <Image
                        key={imgKeys["img1"] || data.img1}
                        src={data.img1}
                        alt="img1"
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiUpload className="text-white" size={16} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <FiUpload size={20} />
                      <span className="text-[10px]">رفع صورة</span>
                    </div>
                  )}
                  <input
                    ref={img1Ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadImage("img1", "/api/admin/company/footer-image/img1", e.target.files[0])}
                  />
                </div>
                {data.img1 && (
                  <button
                    onClick={async () => {
                      setData((p) => ({ ...p, img1: "" }));
                      await saveSection("s1", { img1: "" });
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                    title="حذف الصورة"
                  >
                    <FiTrash2 size={10} />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full space-y-2">
                <div className="flex gap-4">
                  {["link", "file"].map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                      <input
                        type="radio"
                        name="type-1"
                        value={t}
                        checked={(data.linkType1 || "link") === t}
                        onChange={() => setData((p) => ({ ...p, linkType1: t, link1Type: t }))}
                        className="accent-blue-600"
                      />
                      {t === "link" ? "رابط" : "ملف"}
                    </label>
                  ))}
                </div>
                <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
                  <span className="shrink-0">⚠️</span>
                  <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
                </div>
                {(data.linkType1 || "link") === "link" ? (
                  <div key="s1-link" className="flex items-center gap-2 w-full">
                    <FiLink className="text-gray-400 shrink-0" size={15} />
                    <input
                      type="text"
                      value={data.link1 ?? ""}
                      onChange={(e) => setData((p) => ({ ...p, link1: e.target.value }))}
                      placeholder="رابط الترخيص الأول..."
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                ) : (
                  <div key="s1-file" className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => fileRef1.current?.click()}
                      disabled={uploading === "file1"}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {uploading === "file1" ? (
                        <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiUpload size={13} />
                      )}
                      رفع ملف
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileRef1}
                      onChange={(e) => e.target.files?.[0] && uploadFileAsset("file1", "/api/admin/company/footer-file/file1", e.target.files[0])}
                    />
                    {data.file1 && (
                      <>
                        <button
                          onClick={() => openFile(data.file1)}
                          className="flex items-center gap-1 text-emerald-600 text-sm hover:underline"
                        >
                          <FiExternalLink size={13} /> عرض الملف
                        </button>
                        <button
                          onClick={async () => {
                            setData((p) => ({ ...p, file1: "" }));
                            await saveSection("s1", { file1: "" });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs hover:underline"
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 (ضريبة القيمة المضافة) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">شهادة ضريبة القيمة المضافة (الترخيص 2)</h2>
              <button
                onClick={() => saveSection("s2", {
                  img2: data.img2,
                  link2: data.link2,
                  link2Type: data.linkType2,
                  linkType2: data.linkType2,
                  file2: data.file2,
                })}
                disabled={savingSection === "s2"}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {savingSection === "s2" ? "جاري..." : "حفظ"}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
              <div className="relative shrink-0">
                <div
                  onClick={() => img2Ref.current?.click()}
                  className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
                >
                  {uploading === "img2" ? (
                    <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : data.img2 ? (
                    <>
                      <Image
                        key={imgKeys["img2"] || data.img2}
                        src={data.img2}
                        alt="img2"
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiUpload className="text-white" size={16} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <FiUpload size={20} />
                      <span className="text-[10px]">رفع صورة</span>
                    </div>
                  )}
                  <input
                    ref={img2Ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadImage("img2", "/api/admin/company/footer-image/img2", e.target.files[0])}
                  />
                </div>
                {data.img2 && (
                  <button
                    onClick={async () => {
                      setData((p) => ({ ...p, img2: "" }));
                      await saveSection("s2", { img2: "" });
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                    title="حذف الصورة"
                  >
                    <FiTrash2 size={10} />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full space-y-2">
                <div className="flex gap-4">
                  {["link", "file"].map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                      <input
                        type="radio"
                        name="type-2"
                        value={t}
                        checked={(data.linkType2 || "link") === t}
                        onChange={() => setData((p) => ({ ...p, linkType2: t, link2Type: t }))}
                        className="accent-blue-600"
                      />
                      {t === "link" ? "رابط" : "ملف"}
                    </label>
                  ))}
                </div>
                <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
                  <span className="shrink-0">⚠️</span>
                  <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
                </div>
                {(data.linkType2 || "link") === "link" ? (
                  <div key="s2-link" className="flex items-center gap-2 w-full">
                    <FiLink className="text-gray-400 shrink-0" size={15} />
                    <input
                      type="text"
                      value={data.link2 ?? ""}
                      onChange={(e) => setData((p) => ({ ...p, link2: e.target.value }))}
                      placeholder="رابط الترخيص الثاني..."
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                ) : (
                  <div key="s2-file" className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => fileRef2.current?.click()}
                      disabled={uploading === "file2"}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {uploading === "file2" ? (
                        <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiUpload size={13} />
                      )}
                      رفع ملف
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileRef2}
                      onChange={(e) => e.target.files?.[0] && uploadFileAsset("file2", "/api/admin/company/footer-file/file2", e.target.files[0])}
                    />
                    {data.file2 && (
                      <>
                        <button
                          onClick={() => openFile(data.file2)}
                          className="flex items-center gap-1 text-emerald-600 text-sm hover:underline"
                        >
                          <FiExternalLink size={13} /> عرض الملف
                        </button>
                        <button
                          onClick={async () => {
                            setData((p) => ({ ...p, file2: "" }));
                            await saveSection("s2", { file2: "" });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs hover:underline"
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
