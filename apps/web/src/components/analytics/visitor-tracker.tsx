"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";

const VISITOR_ID_KEY = "dohy:visitorId";
const SESSION_ID_KEY = "dohy:sessionId";
const HEARTBEAT_INTERVAL = 60 * 1000;

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const track = useMutation(api.visitors.track);
  const latestLocationRef = useRef<string | null>(null);
  const lastTrackedKeyRef = useRef<string | null>(null);

  const location = useMemo(() => {
    if (!pathname) return null;
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    latestLocationRef.current = location ?? null;
    if (!location) return;

    const visitorId = ensureVisitorId();
    const sessionId = ensureSessionId();
    if (!visitorId || !sessionId) return;

    const trackKey = `${sessionId}::${location}`;
    if (lastTrackedKeyRef.current === trackKey) return;
    lastTrackedKeyRef.current = trackKey;

    const referrer =
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : undefined;
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

    track({
      sessionId,
      visitorId,
      path: location,
      referrer,
      userAgent,
      eventType: "page_view",
    }).catch(() => {
      // Ignore analytics errors so the dashboard never breaks
    });
  }, [location, track]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visitorId = ensureVisitorId();
    const sessionId = ensureSessionId();
    if (!visitorId || !sessionId) return;

    const interval = window.setInterval(() => {
      const currentLocation =
        latestLocationRef.current ??
        `${window.location.pathname}${window.location.search}`;
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

      track({
        sessionId,
        visitorId,
        path: currentLocation,
        userAgent,
        eventType: "heartbeat",
      }).catch(() => {
        // Best-effort heartbeat; safe to ignore failures
      });
    }, HEARTBEAT_INTERVAL);

    return () => window.clearInterval(interval);
  }, [track]);

  return null;
}

function ensureVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const store = window.localStorage;
    let id = store.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = generateId();
      store.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function ensureSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const store = window.sessionStorage;
    let id = store.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateId();
      store.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function generateId(): string {
  if (typeof globalThis !== "undefined" && typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}