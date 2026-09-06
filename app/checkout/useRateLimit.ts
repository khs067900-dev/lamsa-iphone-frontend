"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const RL_KEY = "checkout_rl2";
export const RL_MAX = 4;

function getBlockDuration(count: number): number {
  if (count === RL_MAX + 1) return 60;
  return 180;
}

interface RLData {
  count: number;
  blockedUntil: number;
}

function getRLData(): RLData {
  try {
    const raw = sessionStorage.getItem(RL_KEY);
    return raw ? JSON.parse(raw) : { count: 0, blockedUntil: 0 };
  } catch { return { count: 0, blockedUntil: 0 }; }
}

function setRLData(data: RLData) {
  sessionStorage.setItem(RL_KEY, JSON.stringify(data));
}

export function useRateLimit() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calcSecondsLeft = useCallback(() => {
    const { blockedUntil } = getRLData();
    const s = Math.ceil((blockedUntil - Date.now()) / 1000);
    return s > 0 ? s : 0;
  }, []);

  const startTimer = useCallback((secs: number) => {
    setSecondsLeft(secs);
    setBlocked(secs > 0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (secs <= 0) return;
    intervalRef.current = setInterval(() => {
      const s = calcSecondsLeft();
      setSecondsLeft(s);
      if (s <= 0) { setBlocked(false); clearInterval(intervalRef.current!); }
    }, 1000);
  }, [calcSecondsLeft]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") startTimer(calcSecondsLeft()); };
    document.addEventListener("visibilitychange", onVisible);
    startTimer(calcSecondsLeft());
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calcSecondsLeft, startTimer]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const data = getRLData();
    if (data.blockedUntil > now) return;
    const newCount = data.count + 1;
    const shouldBlock = newCount > RL_MAX && (newCount - RL_MAX) % 2 === 1;
    if (shouldBlock) {
      const duration = getBlockDuration(newCount) * 1000;
      setRLData({ count: newCount, blockedUntil: now + duration });
      startTimer(getBlockDuration(newCount));
    } else {
      setRLData({ count: newCount, blockedUntil: 0 });
    }
  }, [startTimer]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return { blocked, secondsLeft, fmtTime: fmt(secondsLeft), recordAttempt };
}
