"use client";

import { createContext, useContext, useState, useMemo } from "react";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const MediaModalContext = createContext<Ctx | null>(null);

export function MediaModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<Ctx>(() => ({ open, setOpen, toggle: () => setOpen((v) => !v) }), [open]);
  return <MediaModalContext.Provider value={value}>{children}</MediaModalContext.Provider>;
}

export function useMediaModal() {
  const ctx = useContext(MediaModalContext);
  if (!ctx) throw new Error("useMediaModal must be used within MediaModalProvider");
  return ctx;
}

