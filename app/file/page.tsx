"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FileViewer() {
  const params = useSearchParams();
  const url = params.get("url") || "";

  if (!url) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", direction: "rtl" }}>
        <p style={{ fontSize: 18, color: "#666" }}>لا يوجد ملف للعرض</p>
      </div>
    );
  }

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 16px", background: "#f5f5f5", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "flex-end" }}>
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          style={{ padding: "6px 16px", background: "#3b82f6", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
        >
          تحميل الملف
        </a>
      </div>
      <iframe
        src={viewerUrl}
        style={{ flex: 1, width: "100%", border: "none" }}
        title="file-viewer"
      />
    </div>
  );
}

export default function FilePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>جاري التحميل...</div>}>
      <FileViewer />
    </Suspense>
  );
}
