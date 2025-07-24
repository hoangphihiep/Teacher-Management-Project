"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Menu, Plus, LogOut, User, Settings, Shield, GraduationCap, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  console.log("Header component rendered, user:", user)

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get role-specific configurations
  const getRoleConfig = () => {
    switch (user?.role) {
      case "ADMIN":
        return {
          color: "bg-blue-500 hover:bg-blue-600",
          logoColor: "bg-blue-500",
          title: "Quản Trị Viên",
          icon: Shield,
          badge: "Admin",
          badgeColor: "bg-blue-500",
          searchPlaceholder: "Tìm kiếm người dùng, khóa học...",
          quickActions: [
            { label: "Thêm người dùng", href: "/admin/users" },
            { label: "Tạo khóa học", href: "/admin/courses" },
            { label: "Quản lý lịch", href: "/admin/work-schedules" },
          ],
        }
      case "TEACHER":
        return {
          color: "bg-blue-500 hover:bg-slate-700",
          logoColor: "bg-blue-500",
          title: "Giáo Viên",
          icon: GraduationCap,
          badge: "Teacher",
          badgeColor: "bg-blue-500",
          searchPlaceholder: "Tìm kiếm môn học, lớp học...",
          quickActions: [
            { label: "Tạo bài tập", href: "/subjects" },
            { label: "Nghỉ phép", href: "/leave-requests" },
            { label: "Tin nhắn", href: "/messages" },
          ],
        }
      case "ASSISTANT":
        return {
          color: "bg-blue-500 hover:bg-emerald-600",
          logoColor: "bg-blue-500",
          title: "Trợ Giảng",
          icon: Users,
          badge: "Assistant",
          badgeColor: "bg-blue-500",
          searchPlaceholder: "Tìm kiếm lớp hỗ trợ, nhiệm vụ...",
          quickActions: [
            { label: "Báo cáo", href: "/assistant/dashboard" },
            { label: "Lịch làm việc", href: "/assistant/work-schedules" },
            { label: "Tin nhắn", href: "/assistant/messages" },
          ],
        }
      default:
        return {
          color: "bg-gray-500 hover:bg-gray-600",
          logoColor: "bg-gray-500",
          title: "Hệ Thống",
          icon: User,
          badge: "User",
          badgeColor: "bg-gray-500",
          searchPlaceholder: "Tìm kiếm...",
          quickActions: [],
        }
    }
  }

  const roleConfig = getRoleConfig()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center -ml-12 pr-4">
        {/* Left section - Mobile menu + Logo */}
        <div className="flex items-center -ml-12 gap-1">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo with company image */}
          <div className="flex items-center">
            {/* Logo full trên desktop */}
            <div className="hidden sm:block h-8">
              <Image
                src="/images/logo1.jpg" // File SVG
                alt="Meta Square"
                width={300}
                height={32}
                className="object-contain h-8"
                priority
              />
            </div>
            {/* Chỉ icon trên mobile */}
            <div className="block sm:hidden h-8 w-8">
              <Image
                src="/images/logo1.jpg" // Icon SVG
                alt="Meta Square"
                width={32}
                height={32}
                className="object-contain h-8 w-8"
                priority
              />
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 flex justify-center px-6">
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder={roleConfig.searchPlaceholder}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white w-full"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {roleConfig.quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className={`${roleConfig.color} text-white gap-2`}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tạo mới</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động nhanh</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roleConfig.quickActions.map((action, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <Link href={action.href} className="cursor-pointer">
                      {action.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo mới</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === "ADMIN" && (
                <>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Yêu cầu nghỉ phép mới</p>
                      <p className="text-xs text-slate-600">Giáo viên Nguyễn Văn A - Từ 15/12 đến 16/12</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Tài khoản mới đăng ký</p>
                      <p className="text-xs text-slate-600">Trợ giảng Trần Thị B cần phê duyệt</p>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              {user?.role === "TEACHER" && (
                <>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Lịch học thay đổi</p>
                      <p className="text-xs text-slate-600">Lớp 10A1 - Toán - Phòng 201</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Tin nhắn từ Ban Giám Hiệu</p>
                      <p className="text-xs text-slate-600">Họp khoa sáng thứ 2</p>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              {user?.role === "ASSISTANT" && (
                <>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Nhiệm vụ mới</p>
                      <p className="text-xs text-slate-600">Hỗ trợ lớp 11A2 - Môn Lý</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Lịch làm việc cập nhật</p>
                      <p className="text-xs text-slate-600">Thay đổi ca làm việc tuần tới</p>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Thông báo hệ thống</p>
                  <p className="text-xs text-slate-600">Bảo trì hệ thống vào 2h sáng mai</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className={`${roleConfig.logoColor} text-white`}>
                    {user ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <Badge variant="outline" className={`${roleConfig.badgeColor} text-white border-0 text-xs`}>
                      {roleConfig.badge}
                    </Badge>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={
                    user?.role === "ADMIN"
                      ? "/admin/dashboard"
                      : user?.role === "TEACHER"
                        ? "/profile"
                        : user?.role === "ASSISTANT"
                          ? "/assistant/profile"
                          : "/profile"
                  }
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              {user?.role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Quản lý hệ thống</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}