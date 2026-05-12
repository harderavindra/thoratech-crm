import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-400">
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      return (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
          {isLast || !item.href ? (
            <span className={isLast ? "font-medium text-gray-700" : undefined}>{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-gray-600 transition-colors">
              {item.label}
            </Link>
          )}
        </span>
      );
    })}
  </nav>
);
