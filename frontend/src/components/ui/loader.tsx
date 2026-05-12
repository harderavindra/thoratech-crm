import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 20, className }: SpinnerProps) => (
  <Loader2 size={size} className={clsx("animate-spin text-gray-400", className)} />
);

interface PageLoaderProps {
  minHeight?: string;
  label?: string;
}

export const PageLoader = ({ minHeight = "min-h-[200px]", label = "Loading..." }: PageLoaderProps) => (
  <div className={clsx("flex items-center justify-center", minHeight)}>
    <div className="flex flex-col items-center gap-2">
      <Spinner size={24} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  </div>
);
