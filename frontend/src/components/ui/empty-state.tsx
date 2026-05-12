import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconColor?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  subtitle,
  iconColor = "text-gray-300",
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white px-8 py-16 text-center">
    <span className={iconColor}>{icon}</span>
    <p className="text-base font-semibold text-gray-700 m-0">{title}</p>
    {subtitle && (
      <p className="text-sm text-gray-400 m-0 max-w-[220px] leading-relaxed">{subtitle}</p>
    )}
    {action && <div className="mt-1">{action}</div>}
  </div>
);
