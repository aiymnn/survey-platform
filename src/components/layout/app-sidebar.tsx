"use client"

import * as React from "react"
import { LayoutDashboard, ChevronRight, PanelLeftClose } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

// Sample navigation items
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    // {
    //   title: "Surveys",
    //   url: "/admin/surveys",
    //   icon: FileText,
    // },
    // {
    //   title: "Users",
    //   url: "/admin/users",
    //   icon: Users,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-border/40 shadow-sm" {...props}>
      <SidebarHeader className="flex items-center py-4 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all">
        <button
          onClick={toggleSidebar}
          className="flex shrink-0 text-muted-foreground hover:text-foreground transition-all duration-300 focus:outline-none group-data-[collapsible=icon]:rotate-180 group-data-[collapsible=icon]:justify-center"
          title="Toggle Sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-2">
            <SidebarMenu className="gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
              {data.navMain.map((item) => {
                const isActive = pathname === item.url

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 overflow-hidden
                        ${isActive
                          ? "bg-primary/10 text-primary font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground md:hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0"
                        }
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="absolute right-2 h-4 w-4 opacity-50 group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
