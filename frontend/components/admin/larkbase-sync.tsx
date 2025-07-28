"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, Users, BookOpen, Calendar, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SyncStatus {
  isLoading: boolean
  success: boolean | null
  message: string
}

export default function LarkBaseSync() {
  const { toast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState<SyncStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [syncStatuses, setSyncStatuses] = useState<{
    [key: string]: SyncStatus
  }>({
    all: { isLoading: false, success: null, message: "" },
    users: { isLoading: false, success: null, message: "" },
    courses: { isLoading: false, success: null, message: "" },
    schedules: { isLoading: false, success: null, message: "" },
    leaveRequests: { isLoading: false, success: null, message: "" },
  })

  const testConnection = async () => {
    setConnectionStatus({ isLoading: true, success: null, message: "" })
    try {
      const response = await fetch("http://localhost:8080/api/admin/larkbase/test-connection", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      setConnectionStatus({
        isLoading: false,
        success: result.success && result.data,
        message: result.message,
      })

      if (result.success && result.data) {
        toast({
          title: "Kết nối thành công",
          description: "Đã kết nối thành công với LarkBase",
        })
      } else {
        toast({
          title: "Kết nối thất bại",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus({
        isLoading: false,
        success: false,
        message: "Lỗi kết nối: " + (error as Error).message,
      })

      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra kết nối",
        variant: "destructive",
      })
    }
  }

  const syncData = async (endpoint: string, type: string) => {
    setSyncStatuses((prev) => ({
      ...prev,
      [type]: { isLoading: true, success: null, message: "" },
    }))

    try {
      const response = await fetch(`http://localhost:8080/api/admin/larkbase/sync/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      setSyncStatuses((prev) => ({
        ...prev,
        [type]: {
          isLoading: false,
          success: result.success,
          message: result.message,
        },
      }))

      if (result.success) {
        toast({
          title: "Đồng bộ thành công",
          description: result.message,
        })
      } else {
        toast({
          title: "Đồng bộ thất bại",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setSyncStatuses((prev) => ({
        ...prev,
        [type]: {
          isLoading: false,
          success: false,
          message: "Lỗi: " + (error as Error).message,
        },
      }))

      toast({
        title: "Lỗi",
        description: "Không thể đồng bộ dữ liệu",
        variant: "destructive",
      })
    }
  }

  const StatusBadge = ({ status }: { status: SyncStatus }) => {
    if (status.isLoading) {
      return (
        <Badge variant="secondary">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Đang xử lý
        </Badge>
      )
    }
    if (status.success === true) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Thành công
        </Badge>
      )
    }
    if (status.success === false) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Thất bại
        </Badge>
      )
    }
    return <Badge variant="outline">Chưa thực hiện</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đồng bộ LarkBase</h1>
          <p className="text-muted-foreground">Đồng bộ dữ liệu hệ thống với LarkBase</p>
        </div>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Kiểm tra kết nối
          </CardTitle>
          <CardDescription>Kiểm tra kết nối với LarkBase API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Trạng thái kết nối:</span>
              <StatusBadge status={connectionStatus} />
            </div>
            <Button onClick={testConnection} disabled={connectionStatus.isLoading} variant="outline">
              {connectionStatus.isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Kiểm tra kết nối
            </Button>
          </div>

          {connectionStatus.message && (
            <Alert>
              <AlertDescription>{connectionStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sync All Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Đồng bộ toàn bộ
          </CardTitle>
          <CardDescription>Đồng bộ tất cả dữ liệu cùng một lúc</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Trạng thái:</span>
              <StatusBadge status={syncStatuses.all} />
            </div>
            <Button
              onClick={() => syncData("all", "all")}
              disabled={syncStatuses.all.isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncStatuses.all.isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng bộ tất cả
            </Button>
          </div>

          {syncStatuses.all.message && (
            <Alert>
              <AlertDescription>{syncStatuses.all.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Sync Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Người dùng
            </CardTitle>
            <CardDescription>Đồng bộ thông tin người dùng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={syncStatuses.users} />
              <Button
                onClick={() => syncData("users", "users")}
                disabled={syncStatuses.users.isLoading}
                variant="outline"
                size="sm"
              >
                {syncStatuses.users.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Đồng bộ
              </Button>
            </div>
            {syncStatuses.users.message && (
              <p className="text-sm text-muted-foreground">{syncStatuses.users.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Courses Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Khóa học
            </CardTitle>
            <CardDescription>Đồng bộ thông tin khóa học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={syncStatuses.courses} />
              <Button
                onClick={() => syncData("courses", "courses")}
                disabled={syncStatuses.courses.isLoading}
                variant="outline"
                size="sm"
              >
                {syncStatuses.courses.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4 mr-2" />
                )}
                Đồng bộ
              </Button>
            </div>
            {syncStatuses.courses.message && (
              <p className="text-sm text-muted-foreground">{syncStatuses.courses.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Schedules Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lịch làm việc
            </CardTitle>
            <CardDescription>Đồng bộ lịch làm việc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={syncStatuses.schedules} />
              <Button
                onClick={() => syncData("schedules", "schedules")}
                disabled={syncStatuses.schedules.isLoading}
                variant="outline"
                size="sm"
              >
                {syncStatuses.schedules.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                Đồng bộ
              </Button>
            </div>
            {syncStatuses.schedules.message && (
              <p className="text-sm text-muted-foreground">{syncStatuses.schedules.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Leave Requests Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Đơn xin nghỉ
            </CardTitle>
            <CardDescription>Đồng bộ đơn xin nghỉ phép</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={syncStatuses.leaveRequests} />
              <Button
                onClick={() => syncData("leave-requests", "leaveRequests")}
                disabled={syncStatuses.leaveRequests.isLoading}
                variant="outline"
                size="sm"
              >
                {syncStatuses.leaveRequests.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Đồng bộ
              </Button>
            </div>
            {syncStatuses.leaveRequests.message && (
              <p className="text-sm text-muted-foreground">{syncStatuses.leaveRequests.message}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">1. Trước tiên, hãy kiểm tra kết nối với LarkBase</p>
          <p className="text-sm text-muted-foreground">
            2. Bạn có thể đồng bộ từng loại dữ liệu riêng biệt hoặc đồng bộ tất cả cùng lúc
          </p>
          <p className="text-sm text-muted-foreground">
            3. Quá trình đồng bộ sẽ chạy trong nền, bạn có thể tiếp tục sử dụng hệ thống
          </p>
          <p className="text-sm text-muted-foreground">4. Hệ thống sẽ tự động đồng bộ dữ liệu mỗi giờ</p>
        </CardContent>
      </Card>
    </div>
  )
}
