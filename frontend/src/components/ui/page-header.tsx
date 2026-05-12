import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}

export const PageHeader = ({ title, description, action, breadcrumb }: PageHeaderProps) => (
  <div className="mb-6">
    {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);
