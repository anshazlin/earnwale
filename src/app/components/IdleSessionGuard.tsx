"use client";

import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;
const STORAGE_KEY = "earnwale:lastActivity";

export default function IdleSessionGuard() {
  const loggingOut = useRef(false);

  useEffect(() => {
    const now = Date.now();
    const saved = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (!saved) window.localStorage.setItem(STORAGE_KEY, String(now));

    const logout = async () => {
      if (loggingOut.current) return;
      loggingOut.current = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // The redirect still prevents continued use of the protected UI.
      } finally {
        window.localStorage.removeItem(STORAGE_KEY);
        window.location.replace("/login?idle=1");
      }
    };

    const checkIdle = () => {
      const lastActivity = Number(
        window.localStorage.getItem(STORAGE_KEY) ?? 0,
      );
      if (lastActivity && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        void logout();
        return false;
      }
      return true;
    };

    const recordActivity = () => {
      if (loggingOut.current) return;
      if (!checkIdle()) return;
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    for (const event of events) {
      window.addEventListener(event, recordActivity, { passive: true });
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkIdle();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const interval = window.setInterval(checkIdle, CHECK_INTERVAL_MS);
    checkIdle();

    return () => {
      for (const event of events) {
        window.removeEventListener(event, recordActivity);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
