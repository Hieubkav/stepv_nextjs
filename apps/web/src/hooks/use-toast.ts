"use client";

import {
  useToast as useUiToast,
  type ToastConfig,
} from "@/components/ui/use-toast";

export type Toast = ToastConfig;

export function useToast() {
  return useUiToast();
}
