"use client";

import { toast } from "sonner";

// Re-export toast for direct usage
export { toast };

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
};

export function useToast() {
  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
  }: ToastProps) => {
    const toastOptions = {
      duration,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : undefined,
      action,
    };

    if (title && description) {
      toast(title, {
        description,
        ...toastOptions,
      });
    } else {
      toast(title || description || "", toastOptions);
    }
  };

  return {
    toast: showToast,
  };
}
