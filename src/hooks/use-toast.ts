"use client";

import { useCallback, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

// ---------------------------------------------------------------------------
// Simple unique id generator
// ---------------------------------------------------------------------------
let toastCount = 0;
function genId(): string {
  toastCount += 1;
  return `toast-${toastCount}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Clear any pending auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (input: ToastInput): string => {
      const id = genId();
      const newToast: Toast = { id, ...input };
      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismiss(id);
      }, 5000);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  return { toasts, toast, dismiss, dismissAll };
}
