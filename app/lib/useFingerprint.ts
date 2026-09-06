"use client";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "x-device-fp";
const SESSION_KEY = "x-device-fp-s";

let cachedVisitorId: string | null = null;

function setFingerprintCookie(fp: string) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `x-device-fp=${fp};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function useFingerprint() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Already in memory
    if (cachedVisitorId) return;

    // Try session first (tab-level)
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      cachedVisitorId = session;
      setFingerprintCookie(session);
      return;
    }

    // Try localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedVisitorId = stored;
      sessionStorage.setItem(SESSION_KEY, stored);
      setFingerprintCookie(stored);
      return;
    }

    // Generate new fingerprint
    const save = (id: string) => {
      cachedVisitorId = id;
      try {
        localStorage.setItem(STORAGE_KEY, id);
        sessionStorage.setItem(SESSION_KEY, id);
      } catch { /* storage blocked */ }
      setFingerprintCookie(id);
    };

    const fallbackId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);

    import("@fingerprintjs/fingerprintjs")
      .then((FingerprintJS) => FingerprintJS.load())
      .then((fp) => fp.get())
      .then((result) => save(result.visitorId))
      .catch(() => save(fallbackId()));
  }, []);
}

export function getFingerprint(): string | null {
  if (cachedVisitorId) return cachedVisitorId;
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(STORAGE_KEY);
  if (v) cachedVisitorId = v;
  return cachedVisitorId;
}
