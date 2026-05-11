import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ConfirmVariant = "danger" | "warning" | "success";

export interface ConfirmDialogProps {
  open: boolean;
  variant?: ConfirmVariant;
  title: string;
  description: string;
  /** User must type this word exactly before the confirm button enables */
  keyword: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  /** Preview card shown inside the dialog */
  previewName: string;
  previewInitials: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─────────────────────────────────────────────────────────────
// Variant styles
// ─────────────────────────────────────────────────────────────

const VARIANT: Record<ConfirmVariant, {
  footer: string;
  btn: string;
  border: string;
}> = {
  danger: {
    footer: "bg-red-50 border-red-100",
    btn:    "bg-red-600 hover:bg-red-700 text-white",
    border: "border-red-200",
  },
  warning: {
    footer: "bg-amber-50 border-amber-100",
    btn:    "bg-amber-500 hover:bg-amber-600 text-white",
    border: "border-amber-200",
  },
  success: {
    footer: "bg-emerald-50 border-emerald-100",
    btn:    "bg-emerald-600 hover:bg-emerald-700 text-white",
    border: "border-emerald-200",
  },
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const ConfirmDialog = ({
  open,
  variant = "danger",
  title,
  description,
  keyword,
  confirmLabel,
  cancelLabel = "Cancel",
  isPending = false,
  previewName,
  previewInitials,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const v = VARIANT[variant];
  const isMatch = typed.trim().toLowerCase() === keyword.toLowerCase();

  // Reset input every time dialog opens
  useEffect(() => {
    if (open) {
      setTyped("");
      // Small delay so the portal has mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const dialog = (
    // Overlay — click outside to cancel
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${v.border}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div>
            <p
              id="confirm-dialog-title"
              className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 m-0 mb-1"
            >
              {title}
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="ml-4 shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* User preview row */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
              {previewInitials}
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 m-0">
                {previewName}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 m-0">
                Type{" "}
                <code className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-px rounded text-[11px] text-gray-700 dark:text-gray-300">
                  {keyword}
                </code>{" "}
                to confirm
              </p>
            </div>
          </div>
        </div>

        {/* Keyword input */}
        <div className="px-5 pb-5">
          <Input
            ref={inputRef}
            placeholder={`Type "${keyword}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            // state={isMatch && typed.length > 0 ? "success" : "default"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 px-5 py-3 border-t ${v.footer}`}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>

          <button
            disabled={!isMatch || isPending}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg border border-transparent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${v.btn}`}
          >
            {isPending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  // Render into document.body so it's above all other content
  return createPortal(dialog, document.body);
};

export default ConfirmDialog;