"use client";

import { useEffect, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit

/**
 * IdleTimeout - Komponen invisible yang melacak aktivitas pengguna.
 * Jika tidak ada aktivitas (mouse, keyboard, scroll, touch) selama 60 menit,
 * sistem akan secara otomatis mengeluarkan pengguna dari sesi aktif.
 */
export default function IdleTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/login?reason=idle" });
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];

    // Pasang event listener untuk semua aktivitas pengguna
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Mulai timer pertama kali
    resetTimer();

    return () => {
      // Bersihkan saat komponen di-unmount
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  // Komponen ini invisible (tidak merender apa pun ke layar)
  return null;
}
