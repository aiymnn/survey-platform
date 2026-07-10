"use client";

import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import type { User } from "next-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
}

/**
 * Root chrome for all admin pages.
 * Structure: SidebarProvider > Header (sticky) > [AppSidebar | SidebarInset]
 *
 * Scroll behaviour:
 * - SidebarInset has overflow-auto — it is the scrolling ancestor.
 * - Children that use `sticky` positioning will stick relative to this container.
 * - PageLayout adds its own padding; AdminLayout intentionally has none.
 */
export function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        <Header user={user} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto peer-data-[variant=inset]:min-h-0">
            <main className="w-full transition-opacity duration-300">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
