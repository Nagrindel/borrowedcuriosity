import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId() {
  let id = sessionStorage.getItem("bc_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("bc_sid", id);
  }
  return id;
}

export function usePageTracking() {
  const [location] = useLocation();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (location === prev.current) return;
    prev.current = location;

    if (location.startsWith("/admin")) return;

    const body = JSON.stringify({
      path: location,
      referrer: document.referrer || undefined,
      sessionId: getSessionId(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  }, [location]);
}
