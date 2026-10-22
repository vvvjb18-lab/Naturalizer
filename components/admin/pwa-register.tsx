"use client";

import { useEffect } from "react";

/** Registers the scoped service worker that makes /ops installable. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/ops-sw.js", { scope: "/ops" })
        .then((registration) => registration.update())
        .catch((error) => {
          console.error("Ops service worker registration failed", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
