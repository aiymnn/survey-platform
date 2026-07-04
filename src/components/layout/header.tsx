"use client"

import { Bell, Moon, Sun, Menu, UserCircle, LogOut, Briefcase, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"

export function Header() {
  const { setTheme, theme } = useTheme()
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] w-full items-center border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 lg:px-8 transition-all duration-300">
      <div className="flex items-center gap-4 w-full">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden shrink-0 hover:bg-primary/10 transition-colors">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 font-bold text-xl tracking-tight shrink-0 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground group-hover:to-foreground transition-colors duration-300">
            SurveyPlatform
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-full">
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">Notifications</span>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-border/40">
              <DropdownMenuLabel className="font-semibold text-sm">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer focus:bg-primary/5 rounded-lg my-1 mx-1 transition-colors">
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Survey Response</span>
                    <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full justify-center text-sm font-medium text-primary cursor-pointer hover:bg-primary/5 rounded-b-lg">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-primary/10 transition-colors rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                <Avatar className="h-9 w-9 border border-border/40">
                  <AvatarImage src="" alt="@admin" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary font-semibold">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-xl shadow-xl border-border/40 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    admin@surveyplatform.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 flex flex-col space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">Acme Corp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <UserCircle className="h-4 w-4 text-primary" />
                  <span className="font-medium">Super Admin</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg my-1 hover:bg-primary/5 transition-colors">
                <Link href="/admin/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
