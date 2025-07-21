"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, FileText, CheckCircle, XCircle } from "lucide-react"
import { parseTime, findFractionalIndex,cn } from "@/lib/utils"
import { apiService, type WorkSchedule } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
const timeSlots = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
]

export default function WorkSchedulePage() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchSchedules()
  }, [currentWeek])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError("")

      const weekStart = format(currentWeek, "yyyy-MM-dd")
      const response = await apiService.getMyWeeklySchedule(weekStart)

      if (response.success && response.data) {
        setSchedules(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch schedules")
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
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

  const getScheduleForDateAndTime = (date: Date, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return schedules.find(
      (schedule) => schedule.workDate === dateStr && schedule.startTime <= timeSlot && schedule.endTime > timeSlot,
    )
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "ABSENT":
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return <Clock className="h-3 w-3 text-orange-600" />
    }
  }

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentWeek(subWeeks(currentWeek, 1))
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1))
    }
  }

  const getWeeklyStats = () => {
    const totalHours = schedules.reduce((sum, schedule) => sum + (schedule.duration || 0), 0)
    const presentHours = schedules
      .filter((schedule) => schedule.attendanceStatus === "PRESENT")
      .reduce((sum, schedule) => sum + (schedule.duration || 0), 0)
    const unmarkedCount = schedules.filter((schedule) => schedule.attendanceStatus === "NOT_MARKED").length

    return { totalHours, presentHours, unmarkedCount }
  }

  const stats = getWeeklyStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 * 16 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
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
          <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
          <p className="text-muted-foreground">Xem lịch làm việc của bạn</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchSchedules} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
          <p className="text-muted-foreground">
            Tuần từ {format(currentWeek, "dd/MM/yyyy", { locale: vi })} đến{" "}
            {format(addDays(currentWeek, 6), "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Hôm nay
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">Lịch trong tuần</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Giờ làm việc</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chấm</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Giờ có mặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa chấm</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unmarkedCount}</div>
            <p className="text-xs text-muted-foreground">Lịch chưa chấm</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lịch làm việc tuần
          </CardTitle>
          <CardDescription>🟡 Lịch dạy Royal • 🔵 Sự kiện hè VAS • 🟢 Hỗ trợ/trợ giảng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Grid container */}
            <div className="grid grid-cols-8 gap-2">
              {/* Time column header */}
              <div className="font-medium text-center py-2">Giờ</div>

              {/* Day headers */}
              {weekDays.map((day, index) => {
                const date = addDays(currentWeek, index)
                return (
                  <div key={day} className="text-center py-2">
                    <div className="font-medium">{day}</div>
                    <div className="text-sm text-muted-foreground">{format(date, "dd/MM")}</div>
                  </div>
                )
              })}

              {/* Time slots grid */}
              {timeSlots.map((timeSlot) => (
                <>
                  {/* Time label */}
                  <div key={`time-${timeSlot}`} className="text-sm text-center py-2 font-medium">
                    {timeSlot}
                  </div>

                  {/* Day cells - empty placeholders */}
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={`${day}-${timeSlot}`}
                      className="min-h-[60px] border border-dashed border-gray-200 rounded-lg relative"
                    />
                  ))}
                </>
              ))}
            </div>

            {/* Overlay for schedule blocks */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-8 gap-2 h-full">
                {/* Skip time column */}
                <div />

                {/* Schedule blocks for each day */}
                {weekDays.map((day, dayIndex) => {
                  const date = addDays(currentWeek, dayIndex)
                  const dateStr = format(date, "yyyy-MM-dd")
                  const daySchedules = schedules.filter((schedule) => schedule.workDate === dateStr)

                  return (
                    <div key={`schedules-${day}`} className="relative">
                      {daySchedules.map((schedule) => {
                        const parsedSlots = timeSlots.map(parseTime);
                        const scheduleStart = parseTime(schedule.startTime); // 7.5
                        const scheduleEnd =  parseTime(schedule.endTime);   // 11.5
                        const startIndex = findFractionalIndex(scheduleStart, parsedSlots) + 1;
                        const endIndex = findFractionalIndex(scheduleEnd, parsedSlots) + 1;
                        const actualEndIndex = endIndex === -1 ? timeSlots.length : endIndex
                        const duration = actualEndIndex - startIndex

                        console.log("🟡 schedule:", schedule)
                        console.log("🟡 startTime:", schedule.startTime)
                        console.log("🟡 endTime:", schedule.endTime)
                        console.log("🔢 startIndex:", startIndex)
                        console.log("🔢 endIndex:", endIndex)
                        console.log("🔢 actualEndIndex:", actualEndIndex)
                        console.log("⏱️ duration:", duration)

                        if (startIndex === -1 || duration <= 0) return null

                        const topOffset = startIndex * 68 // 76px per row + 48px header
                        const height = duration * 68// Account for gap
                        console.log("🔢 Chiều cao:", topOffset)
                        console.log("⏱️ Độ dài:", height)
                        return (
                          <div
                            key={schedule.id}
                            className="absolute left-0 right-0 rounded-lg p-2 border-2 pointer-events-auto group cursor-pointer"
                            style={{
                              top: `${topOffset}px`,
                              height: `${height}px`,
                              backgroundColor: `${schedule.workTypeColor}20`,
                              borderColor: schedule.workTypeColor,
                              zIndex: 10,
                            }}
                          >
                            <div className="h-full flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="text-xs font-medium truncate">{schedule.content}</div>
                                {schedule.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-2 w-2" />
                                    <span className="text-xs truncate">{schedule.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {getAttendanceIcon(schedule.attendanceStatus)}
                                  </div>
                                </div>
                              </div>      
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết lịch làm việc</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không có lịch làm việc nào trong tuần này</div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${schedule.workTypeColor}10`,
                    borderColor: `${schedule.workTypeColor}40`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: schedule.workTypeColor }} />
                    <div>
                      <div className="font-medium">{schedule.content}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(schedule.workDate), "EEEE, dd/MM/yyyy", { locale: vi })} • {schedule.startTime}{" "}
                        - {schedule.endTime}
                      </div>
                      {schedule.location && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {schedule.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{schedule.workTypeDisplay}</Badge>
                    <div className="flex items-center gap-1">
                      {getAttendanceIcon(schedule.attendanceStatus)}
                      <span className="text-sm text-muted-foreground">{schedule.attendanceStatusDisplay}</span>
                    </div>
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
