"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastVariant = "default" | "destructive";

export type ToastConfig = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ExternalToast["action"];
  dismissible?: boolean;
};

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = "default",
      action,
      dismissible = true,
    }: ToastConfig) => {
      const message = title ?? description ?? "";
      sonnerToast(message, {
        description: title && description ? description : undefined,
        className:
          variant === "destructive"
            ? "bg-destructive text-destructive-foreground"
            : undefined,
        action,
        dismissible,
      });
    },
  };
}
