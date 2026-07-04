"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto bg-muted/20 peer-data-[variant=inset]:min-h-0">
            <main className="h-full w-full p-4 lg:p-8 transition-opacity duration-500">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
