import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";
import { logoutUser } from "../services/auth.service";

const IDLE_MS    = 1 * 60 * 1000;
const THROTTLE_MS = 1_000;

const EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

export const useIdleLogout = () => {
  const logout          = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleLogout = async () => {
      try { await logoutUser(); } catch { /* server unavailable — clear locally anyway */ }
      logout();
      window.location.href = "/login";
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, IDLE_MS);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastResetRef.current < THROTTLE_MS) return;
      lastResetRef.current = now;
      resetTimer();
    };

    resetTimer();

    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [isAuthenticated, logout]);
};
