import { useState } from "react";
import { clsx } from "clsx";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type AlertVariant = "success" | "error" | "warning" | "info";

const CONFIGS: Record<AlertVariant, { container: string; icon: React.ReactNode }> = {
  success: { container: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 size={15} /> },
  error:   { container: "border-red-200 bg-red-50 text-red-600",             icon: <AlertCircle  size={15} /> },
  warning: { container: "border-amber-200 bg-amber-50 text-amber-700",       icon: <AlertTriangle size={15} /> },
  info:    { container: "border-blue-200 bg-blue-50 text-blue-700",           icon: <Info          size={15} /> },
};

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

export const Alert = ({ variant = "info", children, dismissible = false, className }: AlertProps) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const { container, icon } = CONFIGS[variant];

  return (
    <div className={clsx("flex items-start gap-2 rounded-lg border px-4 py-3 text-sm", container, className)}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 cursor-pointer border-none bg-transparent p-0 opacity-60 hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
