"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { useCallback, useEffect, useRef } from "react";
import { useToast, type ToastVariant } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Variant → sonner method mapping
// ---------------------------------------------------------------------------
const variantMethod: Record<ToastVariant, typeof toast> = {
  default: toast,
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
};

// ---------------------------------------------------------------------------
// Toaster component
//
// This bridges our useToast hook to sonner's rendered Toaster.  Place it once
// at the top of the component tree (e.g. in layout.tsx or a providers file).
// ------------------------------------------------------------------------- */

interface ToasterProps {
  /** A useToast() instance – pass the return value from the hook */
  toasts: ReturnType<typeof useToast>["toasts"];
  dismiss: ReturnType<typeof useToast>["dismiss"];
}

export function Toaster({ toasts, dismiss }: ToasterProps) {
  // Keep track of which toast ids have already been pushed to sonner so we
  // don't re-fire on re-renders.
  const pushed = useRef<Set<string>>(new Set());

  const syncToSonner = useCallback(() => {
    for (const t of toasts) {
      if (pushed.current.has(t.id)) continue;
      pushed.current.add(t.id);

      const method = variantMethod[t.variant ?? "default"];
      method(t.title ?? "", {
        description: t.description,
        onAutoClose: () => dismiss(t.id),
        onDismiss: () => dismiss(t.id),
      });
    }

    // Clean up ids that are no longer in state
    const activeIds = new Set(toasts.map((t) => t.id));
    for (const id of pushed.current) {
      if (!activeIds.has(id)) pushed.current.delete(id);
    }
  }, [toasts, dismiss]);

  useEffect(() => {
    syncToSonner();
  }, [syncToSonner]);

  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}

export default Toaster;
