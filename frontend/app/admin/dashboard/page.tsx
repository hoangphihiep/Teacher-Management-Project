"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserCheck, FileText, Clock, CheckCircle, XCircle, Plus, Eye, TrendingUp, Activity } from "lucide-react"
import { apiService, type AdminStats } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiService.getAdminStats()
      console.log("📊 Admin Stats:", response.data)
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch stats")
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      setError(errorMessage)
      toast({
        title: "Thông báo",
        description: "Đang sử dụng dữ liệu mẫu do không thể kết nối API",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống quản lý giáo viên</p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users">
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error} - Hiển thị dữ liệu mẫu để demo</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.activeUsers || 0} đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giáo viên</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
            <p className="text-xs text-muted-foreground">Tài khoản giáo viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAdmins || 0}</div>
            <p className="text-xs text-muted-foreground">Tài khoản admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoạt động</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers ? Math.round(((stats.activeUsers || 0) / stats.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
          </CardContent>
        </Card>

        {/* Leave Request Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn nghỉ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeaveRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Tất cả đơn nghỉ phép</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingLeaveRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Đơn chờ phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedLeaveRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Đơn đã phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.rejectedLeaveRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Đơn bị từ chối</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quản lý người dùng</CardTitle>
            <CardDescription>Tạo, chỉnh sửa và quản lý tài khoản người dùng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng người dùng:</span>
              <Badge variant="secondary">{stats?.totalUsers || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Đang hoạt động:</span>
              <Badge variant="default">{stats?.activeUsers || 0}</Badge>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/users">
                <Eye className="mr-2 h-4 w-4" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đơn nghỉ phép</CardTitle>
            <CardDescription>Phê duyệt và quản lý đơn nghỉ phép của giáo viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Chờ duyệt:</span>
              <Badge variant="destructive">{stats?.pendingLeaveRequests || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Đã xử lý:</span>
              <Badge variant="secondary">
                {(stats?.approvedLeaveRequests || 0) + (stats?.rejectedLeaveRequests || 0)}
              </Badge>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/leave-requests">
                <Eye className="mr-2 h-4 w-4" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tin nhắn hệ thống</CardTitle>
            <CardDescription>Gửi thông báo và tin nhắn đến giáo viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Gửi tin nhắn cá nhân hoặc thông báo chung đến tất cả giáo viên
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/messages">
                <Plus className="mr-2 h-4 w-4" />
                Soạn tin nhắn
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
