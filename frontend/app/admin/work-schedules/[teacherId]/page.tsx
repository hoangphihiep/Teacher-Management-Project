"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { vi } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Repeat,
  Eye,
} from "lucide-react"
import { parseTime, findFractionalIndex} from "@/lib/utils"
import { apiService, type WorkSchedule, type CreateWorkSchedule, type WorkType, type AttendanceStatus } from "@/lib/api"
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

export default function TeacherWorkSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = Number(params.teacherId)

  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [attendanceStatuses, setAttendanceStatuses] = useState<AttendanceStatus[]>([])

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null)
  const [recurringChildren, setRecurringChildren] = useState<WorkSchedule[]>([])

  // Form states
  const [formData, setFormData] = useState<CreateWorkSchedule>({
    teacherId: teacherId,
    workDate: "",
    startTime: "",
    endTime: "",
    workType: "",
    location: "",
    content: "",
    notes: "",
    isRecurring: false,
    recurringEndDate: "",
  })

  const [attendanceData, setAttendanceData] = useState({
    attendanceStatus: "",
    attendanceNotes: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchSchedules()
    fetchWorkTypes()
    fetchAttendanceStatuses()
  }, [currentWeek, teacherId])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError("")

      const weekStart = format(currentWeek, "yyyy-MM-dd")
      const response = await apiService.getTeacherWeeklySchedule(teacherId, weekStart)

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

  const fetchWorkTypes = async () => {
    try {
      const response = await apiService.getWorkTypes()
      if (response.success && response.data) {
        setWorkTypes(response.data.workTypes)
      }
    } catch (error) {
      console.error("Error fetching work types:", error)
    }
  }

  const fetchAttendanceStatuses = async () => {
    try {
      const response = await apiService.getAttendanceStatuses()
      if (response.success && response.data) {
        setAttendanceStatuses(response.data.attendanceStatuses)
      }
    } catch (error) {
      console.error("Error fetching attendance statuses:", error)
    }
  }

  const fetchRecurringChildren = async (parentId: number) => {
    try {
      const response = await apiService.getRecurringScheduleChildren(parentId)
      if (response.success && response.data) {
        setRecurringChildren(response.data)
      }
    } catch (error) {
      console.error("Error fetching recurring children:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch lặp lại",
        variant: "destructive",
      })
    }
  }

  const getScheduleForDateAndTime = (date: Date, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd")
    console.log("📅 All schedules:", schedules)
    console.log("Time Slot:", timeSlot)
    return schedules.find(
      (schedule) => schedule.workDate === dateStr && schedule.startTime <= timeSlot && schedule.endTime >= timeSlot,
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

  const handleCreateSchedule = async () => {
    try {
      const response = await apiService.createWorkSchedule(formData)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Tạo lịch làm việc thành công",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchSchedules()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return

    try {
      const response = await apiService.updateWorkSchedule(selectedSchedule.id, formData)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật lịch làm việc thành công",
        })
        setIsEditDialogOpen(false)
        setSelectedSchedule(null)
        resetForm()
        fetchSchedules()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    const schedule = schedules.find((s) => s.id === scheduleId)
    const confirmMessage = schedule?.isParentRecurring
      ? "Bạn có chắc chắn muốn xóa lịch lặp lại này? Tất cả lịch con cũng sẽ bị xóa."
      : "Bạn có chắc chắn muốn xóa lịch này?"

    if (!confirm(confirmMessage)) return

    try {
      const response = await apiService.deleteWorkSchedule(scheduleId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa lịch làm việc thành công",
        })
        fetchSchedules()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleMarkAttendance = async () => {
    if (!selectedSchedule) return

    try {
      const response = await apiService.markAttendance(selectedSchedule.id, attendanceData)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Chấm công thành công",
        })
        setIsAttendanceDialogOpen(false)
        setSelectedSchedule(null)
        setAttendanceData({ attendanceStatus: "", attendanceNotes: "" })
        fetchSchedules()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      teacherId: teacherId,
      workDate: "",
      startTime: "",
      endTime: "",
      workType: "",
      location: "",
      content: "",
      notes: "",
      isRecurring: false,
      recurringEndDate: "",
    })
  }

  const openEditDialog = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule)
    setFormData({
      teacherId: schedule.teacherId,
      workDate: schedule.workDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      workType: schedule.workType,
      location: schedule.location || "",
      content: schedule.content,
      notes: schedule.notes || "",
      isRecurring: false, // Don't allow changing recurring status in edit
      recurringEndDate: "",
    })
    setIsEditDialogOpen(true)
  }

  const openAttendanceDialog = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule)
    setAttendanceData({
      attendanceStatus: schedule.attendanceStatus,
      attendanceNotes: schedule.attendanceNotes || "",
    })
    setIsAttendanceDialogOpen(true)
  }

  const openRecurringDialog = async (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule)
    await fetchRecurringChildren(schedule.id)
    setIsRecurringDialogOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch làm việc</h1>
          <p className="text-muted-foreground">Quản lý lịch làm việc giáo viên</p>
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch làm việc</h1>
            <p className="text-muted-foreground">
              Tuần từ {format(currentWeek, "dd/MM/yyyy", { locale: vi })} đến{" "}
              {format(addDays(currentWeek, 6), "dd/MM/yyyy", { locale: vi })}
            </p>
          </div>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm lịch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo lịch làm việc mới</DialogTitle>
                <DialogDescription>Tạo lịch làm việc mới cho giáo viên</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workDate">Ngày làm việc</Label>
                    <Input
                      id="workDate"
                      type="date"
                      value={formData.workDate}
                      onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workType">Loại công việc</Label>
                    <Select
                      value={formData.workType}
                      onValueChange={(value) => setFormData({ ...formData, workType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Giờ bắt đầu</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Giờ kết thúc</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Nhập địa điểm"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Nội dung</Label>
                  <Input
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Nhập nội dung công việc"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Nhập ghi chú (tùy chọn)"
                  />
                </div>
                {/* Recurring Options */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked as boolean })}
                    />
                    <Label htmlFor="isRecurring" className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Lặp lại hàng tuần
                    </Label>
                  </div>

                  {formData.isRecurring && (
                    <div>
                      <Label htmlFor="recurringEndDate">Ngày kết thúc lặp lại</Label>
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                        min={formData.workDate}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Lịch sẽ được tạo tự động mỗi tuần cho đến ngày này
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateSchedule}>Tạo lịch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Calendar className="h-5 w-5" />
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
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium truncate">{schedule.content}</div>
                                  {schedule.isParentRecurring && <Repeat className="h-3 w-3 text-blue-600" />}
                                  {schedule.isChildRecurring && (
                                    <div className="text-xs text-blue-600">T{schedule.weekNumber}</div>
                                  )}
                                </div>
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

                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {schedule.workTypeDisplay}
                                </Badge>

                                {/* Action buttons - show on hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  {schedule.isParentRecurring && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0 bg-white/90"
                                      onClick={() => openRecurringDialog(schedule)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 bg-white/90"
                                    onClick={() => openAttendanceDialog(schedule)}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 bg-white/90"
                                    onClick={() => openEditDialog(schedule)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 bg-white/90"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lịch làm việc</DialogTitle>
            <DialogDescription>Cập nhật thông tin lịch làm việc</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editWorkDate">Ngày làm việc</Label>
                <Input
                  id="editWorkDate"
                  type="date"
                  value={formData.workDate}
                  onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editWorkType">Loại công việc</Label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) => setFormData({ ...formData, workType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại công việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartTime">Giờ bắt đầu</Label>
                <Input
                  id="editStartTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEndTime">Giờ kết thúc</Label>
                <Input
                  id="editEndTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editLocation">Địa điểm</Label>
              <Input
                id="editLocation"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Nhập địa điểm"
              />
            </div>
            <div>
              <Label htmlFor="editContent">Nội dung</Label>
              <Input
                id="editContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung công việc"
              />
            </div>
            <div>
              <Label htmlFor="editNotes">Ghi chú</Label>
              <Textarea
                id="editNotes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Nhập ghi chú (tùy chọn)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateSchedule}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chấm công</DialogTitle>
            <DialogDescription>Cập nhật trạng thái chấm công cho lịch làm việc</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="attendanceStatus">Trạng thái chấm công</Label>
              <Select
                value={attendanceData.attendanceStatus}
                onValueChange={(value) => setAttendanceData({ ...attendanceData, attendanceStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="attendanceNotes">Ghi chú chấm công</Label>
              <Textarea
                id="attendanceNotes"
                value={attendanceData.attendanceNotes}
                onChange={(e) => setAttendanceData({ ...attendanceData, attendanceNotes: e.target.value })}
                placeholder="Nhập ghi chú chấm công (tùy chọn)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleMarkAttendance}>Chấm công</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recurring Schedule Dialog */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Quản lý lịch lặp lại
            </DialogTitle>
            <DialogDescription>Xem và chỉnh sửa các lịch con được tạo từ lịch lặp lại</DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4">
              {/* Parent Schedule Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lịch gốc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nội dung:</span> {selectedSchedule.content}
                    </div>
                    <div>
                      <span className="font-medium">Thời gian:</span> {selectedSchedule.startTime} -{" "}
                      {selectedSchedule.endTime}
                    </div>
                    <div>
                      <span className="font-medium">Địa điểm:</span> {selectedSchedule.location || "Không có"}
                    </div>
                    <div>
                      <span className="font-medium">Kết thúc lặp lại:</span>{" "}
                      {selectedSchedule.recurringEndDate || "Không xác định"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Child Schedules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Danh sách lịch con ({recurringChildren.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recurringChildren.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Tuần {child.weekNumber}</span>
                            <Badge variant="outline">{format(new Date(child.workDate), "dd/MM/yyyy")}</Badge>
                            {getAttendanceIcon(child.attendanceStatus)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {child.startTime} - {child.endTime} • {child.location || "Không có địa điểm"}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openAttendanceDialog(child)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(child)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(child.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {recurringChildren.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">Không có lịch con nào</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecurringDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
