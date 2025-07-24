"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardList,
  Bell,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"

interface AssistantSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/assistant/dashboard",
    icon: BarChart3,
  },
  {
    title: "Lịch làm việc",
    href: "/assistant/work-schedules",
    icon: Calendar,
  },
  {
    title: "Tin nhắn",
    href: "/assistant/messages",
    icon: MessageSquare,
  },
]

export function AssistantSidebar({ className }: AssistantSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        {/* User Profile */}
        <div className="px-3 py-2">
          <Link href="/assistant/profile">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-royal-50 border border-royal-100 hover:bg-royal-100 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Trợ giảng" />
                <AvatarFallback className="bg-royal-500 text-white">
                  {typeof window !== "undefined" && user?.fullName ? getInitials(user.fullName) : "TG"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.fullName || "Trợ giảng"}</p>
                <p className="text-xs text-slate-600 truncate">
                  {"Trợ giảng"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <Separator className="mx-3" />

        {/* Navigation Menu */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-900">Quản lý</h2>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-4 text-slate-700 hover:bg-royal-50 hover:text-royal-700",
                    pathname === item.href && "bg-royal-100 text-royal-700 font-medium",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="mx-3" />

        {/* Bottom Actions */}
        <div className="px-3 py-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 text-slate-700 hover:bg-slate-100"
            asChild
          >
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Cài đặt
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
  
}
