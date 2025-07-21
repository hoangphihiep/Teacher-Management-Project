"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService, type LeaveRequest, type CreateLeaveRequest, type LeaveType } from "@/lib/api"

const createLeaveRequestSchema = z
  .object({
    startDate: z.date({
      required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
      required_error: "Vui lòng chọn ngày kết thúc",
    }),
    leaveType: z.string({
      required_error: "Vui lòng chọn loại nghỉ phép",
    }),
    reason: z.string().min(10, {
      message: "Lý do nghỉ phép phải có ít nhất 10 ký tự",
    }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
    path: ["endDate"],
  })

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createLeaveRequestSchema>>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      reason: "",
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [requestsResponse, typesResponse] = await Promise.all([
        apiService.getMyLeaveRequests(),
        apiService.getLeaveTypes(),
      ])

      if (requestsResponse.success) {
        setLeaveRequests(requestsResponse.data)
      }

      if (typesResponse.success) {
        setLeaveTypes(typesResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof createLeaveRequestSchema>) => {
    try {
      console.log("Submit values:", values)
      setSubmitting(true)
      const createRequest: CreateLeaveRequest = {
        startDate: format(values.startDate, "yyyy-MM-dd"),
        endDate: format(values.endDate, "yyyy-MM-dd"),
        leaveType: values.leaveType,
        reason: values.reason,
      }

      const response = await apiService.createLeaveRequest(createRequest)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đơn nghỉ phép đã được tạo thành công",
        })
        setDialogOpen(false)
        form.reset()
        fetchData()
      } else {
        toast({
          title: "Lỗi",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating leave request:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn nghỉ phép",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (requestId: number) => {
    try {
      const response = await apiService.cancelLeaveRequest(requestId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đơn nghỉ phép đã được hủy",
        })
        fetchData()
      } else {
        toast({
          title: "Lỗi",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling leave request:", error)
      toast({
        title: "Lỗi",
        description: "Không thể hủy đơn nghỉ phép",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <Clock className="h-3 w-3 mr-1" />
            Chờ phê duyệt
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã phê duyệt
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            Từ chối
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Đơn nghỉ phép</h1>
          <p className="text-slate-600 mt-1">Quản lý đơn xin nghỉ phép của bạn</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-royal-500 hover:bg-royal-600 gap-2">
              <Plus className="h-4 w-4" />
              Tạo đơn nghỉ phép
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo đơn nghỉ phép mới</DialogTitle>
              <DialogDescription>Điền thông tin đầy đủ để tạo đơn xin nghỉ phép</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[60]" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                console.log("Ngày được chọn:", date);
                                field.onChange(date);
                              }}
                              disabled={(date) => {
                                const isDisabled = date < new Date();
                                if (isDisabled) console.log("Ngày bị vô hiệu hóa:", date);
                                return isDisabled;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[60]" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại nghỉ phép</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại nghỉ phép" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lý do nghỉ phép</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập lý do nghỉ phép chi tiết..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-royal-500 hover:bg-royal-600">
                    {submitting ? "Đang tạo..." : "Tạo đơn"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaveRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có đơn nghỉ phép nào</h3>
                <p className="text-slate-600 mb-4">Bạn chưa tạo đơn xin nghỉ phép nào</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-royal-500 hover:bg-royal-600 gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo đơn nghỉ phép đầu tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.leaveTypeDisplay}</CardTitle>
                    <CardDescription>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays} ngày)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(request.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Hủy
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Lý do:</h4>
                    <p className="text-slate-600">{request.reason}</p>
                  </div>
                  {request.adminNotes && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Ghi chú từ quản lý:</h4>
                      <p className="text-slate-600">{request.adminNotes}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Tạo lúc: {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                    {request.approvedAt && (
                      <span>
                        Phê duyệt lúc: {format(new Date(request.approvedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
