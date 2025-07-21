"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, BookOpen, Users, Clock, TrendingUp, AlertCircle, CheckCircle, Plus, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService, type DashboardStats } from "@/lib/api"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDashboardStats()
      if (response.success) {
        setDashboardData(response.data)
      } else {
        toast({
          title: "Lỗi",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:MM format
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã hoàn thành
          </Badge>
        )
      case "upcoming":
        return (
          <Badge className="bg-royal-100 text-royal-700">
            <Clock className="h-3 w-3 mr-1" />
            Sắp tới
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
      case "announcement":
        return <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-orange-50 border-orange-100"
      case "announcement":
        return "bg-blue-50 border-blue-100"
      default:
        return "bg-gray-50 border-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Không thể tải dữ liệu dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Chào mừng trở lại, Giáo viên</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Tạo bài kiểm tra
          </Button>
          <Button className="bg-royal-500 hover:bg-royal-600 gap-2">
            <Calendar className="h-4 w-4" />
            Xem lịch tuần
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lớp học hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-royal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{dashboardData.todayClasses}</div>
            <p className="text-xs text-slate-600">Lịch học trong ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{dashboardData.totalStudents}</div>
            <p className="text-xs text-slate-600">Trên {dashboardData.totalSubjects} môn học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Môn học</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{dashboardData.totalSubjects}</div>
            <p className="text-xs text-slate-600">Đang giảng dạy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giờ giảng dạy</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{dashboardData.weeklyTeachingHours}h</div>
            <p className="text-xs text-slate-600">Tuần này</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Schedule & Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-royal-500" />
                Lịch học hôm nay
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.todaySchedule.length > 0 ? (
                  dashboardData.todaySchedule.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-sm font-medium text-slate-900">{formatTime(classItem.startTime)}</div>
                          <div className="text-xs text-slate-500">{formatTime(classItem.endTime)}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <div className="font-medium text-slate-900">{classItem.subject}</div>
                          <div className="text-sm text-slate-600">
                            {classItem.className} • {classItem.room}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(classItem.status)}
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">Không có lịch học nào hôm nay</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ tuần này</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Lớp học đã dạy</span>
                    <span className="text-sm text-slate-600">
                      {dashboardData.weeklyProgress.completedClasses}/{dashboardData.weeklyProgress.totalClasses}
                    </span>
                  </div>
                  <Progress
                    value={
                      dashboardData.weeklyProgress.totalClasses > 0
                        ? (dashboardData.weeklyProgress.completedClasses / dashboardData.weeklyProgress.totalClasses) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Bài kiểm tra đã chấm</span>
                    <span className="text-sm text-slate-600">
                      {dashboardData.weeklyProgress.gradedTests}/{dashboardData.weeklyProgress.totalTests}
                    </span>
                  </div>
                  <Progress
                    value={
                      dashboardData.weeklyProgress.totalTests > 0
                        ? (dashboardData.weeklyProgress.gradedTests / dashboardData.weeklyProgress.totalTests) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Điểm danh hoàn thành</span>
                    <span className="text-sm text-slate-600">
                      {dashboardData.weeklyProgress.completedAttendance}/{dashboardData.weeklyProgress.totalAttendance}
                    </span>
                  </div>
                  <Progress
                    value={
                      dashboardData.weeklyProgress.totalAttendance > 0
                        ? (dashboardData.weeklyProgress.completedAttendance /
                            dashboardData.weeklyProgress.totalAttendance) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activities & Notifications */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-royal-500 mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.timeAgo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500">Chưa có hoạt động nào</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Thông báo quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.importantNotifications.length > 0 ? (
                  dashboardData.importantNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start gap-2">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                          <p className="text-xs text-slate-700 mt-1">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500">Không có thông báo quan trọng</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Tạo bài kiểm tra mới
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Users className="h-4 w-4" />
                  Điểm danh nhanh
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <BookOpen className="h-4 w-4" />
                  Đăng tài liệu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
