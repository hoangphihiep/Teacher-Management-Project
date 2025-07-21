"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Users, Clock, Calendar, AlertCircle, Search, Eye } from "lucide-react"
import { apiService, type TeacherWorkSummary } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminWorkSchedulesPage() {
  const [teachers, setTeachers] = useState<TeacherWorkSummary[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherWorkSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = teachers.filter(
        (teacher) =>
          teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.teacherEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTeachers(filtered)
    } else {
      setFilteredTeachers(teachers)
    }
  }, [searchTerm, teachers])

  const fetchTeachers = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiService.getAllTeachersWithWorkSummary()

      if (response.success && response.data) {
        setTeachers(response.data)
        setFilteredTeachers(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch teachers")
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      setError(errorMessage)
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalStats = () => {
    const totalTeachers = teachers.length
    const totalHours = teachers.reduce((sum, teacher) => sum + teacher.totalHoursThisWeek, 0)
    const totalSchedules = teachers.reduce((sum, teacher) => sum + teacher.totalSchedulesThisWeek, 0)
    const totalUnmarked = teachers.reduce((sum, teacher) => sum + teacher.unmarkedAttendance, 0)

    return { totalTeachers, totalHours, totalSchedules, totalUnmarked }
  }

  const stats = getTotalStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch làm việc</h1>
          <p className="text-muted-foreground">Quản lý lịch làm việc của tất cả giáo viên</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchTeachers} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch làm việc</h1>
        <p className="text-muted-foreground">Quản lý lịch làm việc và chấm công của tất cả giáo viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giáo viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Giáo viên có lịch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giờ tuần</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Giờ làm việc tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">Lịch tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa chấm công</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalUnmarked}</div>
            <p className="text-xs text-muted-foreground">Lịch chưa chấm</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm giáo viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giáo viên</CardTitle>
          <CardDescription>Nhấp vào giáo viên để xem và quản lý lịch làm việc chi tiết</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Không tìm thấy giáo viên nào" : "Chưa có giáo viên nào có lịch làm việc"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.teacherId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{teacher.teacherName}</div>
                      <div className="text-sm text-muted-foreground">{teacher.teacherEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">{teacher.totalHoursThisWeek.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">Giờ tuần</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{teacher.totalSchedulesThisWeek}</div>
                      <div className="text-xs text-muted-foreground">Lịch</div>
                    </div>
                    <div className="text-center">
                      {teacher.unmarkedAttendance > 0 ? (
                        <Badge variant="destructive">{teacher.unmarkedAttendance} chưa chấm</Badge>
                      ) : (
                        <Badge variant="secondary">Đã chấm đủ</Badge>
                      )}
                    </div>
                    <Link href={`/admin/work-schedules/${teacher.teacherId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem lịch
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
