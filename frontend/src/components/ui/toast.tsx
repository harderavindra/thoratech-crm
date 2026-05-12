import { create } from "zustand";
import { clsx } from "clsx";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, variant: ToastVariant) => void;
  remove: (id: string) => void;
}

const AUTO_DISMISS_MS = 4000;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, variant) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      AUTO_DISMISS_MS,
    );
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => {
  const add = useToastStore((s) => s.add);
  return {
    success: (message: string) => add(message, "success"),
    error:   (message: string) => add(message, "error"),
    warning: (message: string) => add(message, "warning"),
  };
};

// Callable outside React components (e.g. QueryClient callbacks)
export const toast = {
  success: (message: string) => useToastStore.getState().add(message, "success"),
  error:   (message: string) => useToastStore.getState().add(message, "error"),
  warning: (message: string) => useToastStore.getState().add(message, "warning"),
};

const STYLES: Record<ToastVariant, { accent: string; icon: React.ReactNode }> = {
  success: { accent: "border-l-4 border-emerald-400", icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
  error:   { accent: "border-l-4 border-red-400",     icon: <AlertCircle  size={16} className="text-red-500"     /> },
  warning: { accent: "border-l-4 border-amber-400",   icon: <AlertTriangle size={16} className="text-amber-500"  /> },
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const remove = useToastStore((s) => s.remove);
  const { accent, icon } = STYLES[toast.variant];

  return (
    <div className={clsx("flex w-72 items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-lg", accent)}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const Toaster = () => {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};
