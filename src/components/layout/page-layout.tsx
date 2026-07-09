import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <main className={`flex-1 p-4 lg:p-8 ${className}`}>
      <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}
