import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  /** Additional classes for the outer padding wrapper */
  className?: string;
}

/**
 * Standard content container for admin pages.
 * Provides consistent horizontal padding and a centred max-width column.
 * Uses a <div> (not <main>) to avoid nesting inside AdminLayout's <main>.
 */
export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`p-4 lg:p-8 ${className}`}>
      <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
