"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, XCircle, Clock, Eye, Calendar, User } from "lucide-react"
import { apiService, type LeaveRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function LeaveRequestsManagement() {
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [adminNote, setAdminNote] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchAllRequests()
    fetchPendingRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [allRequests, searchTerm, statusFilter, typeFilter])

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiService.getAllLeaveRequests()

      if (response.success && response.data) {
        setAllRequests(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch leave requests")
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
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

  const fetchPendingRequests = async () => {
    try {
      const response = await apiService.getPendingLeaveRequestsAdmin()

      if (response.success && response.data) {
        setPendingRequests(response.data)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const filterRequests = () => {
    let filtered = allRequests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((request) => request.leaveType === typeFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy đơn nghỉ phép được chọn",
        variant: "destructive",
      })
      return
    }

    console.log("🔍 Selected request for approval:", selectedRequest)
    console.log("🔍 Request ID:", selectedRequest.id, "Type:", typeof selectedRequest.id)

    try {
      const response = await apiService.approveLeaveRequestAdmin(selectedRequest.id, adminNote)

      if (response.success && response.data) {
        // Update both lists
        setAllRequests((prev) => prev.map((req) => (req.id === selectedRequest.id ? response.data! : req)))
        setPendingRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))

        setIsActionDialogOpen(false)
        setSelectedRequest(null)
        setAdminNote("")

        toast({
          title: "Thành công",
          description: "Đã phê duyệt đơn nghỉ phép",
        })
      } else {
        throw new Error(response.message || "Failed to approve request")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy đơn nghỉ phép được chọn",
        variant: "destructive",
      })
      return
    }

    console.log("🔍 Selected request for rejection:", selectedRequest)
    console.log("🔍 Request ID:", selectedRequest.id, "Type:", typeof selectedRequest.id)

    try {
      const response = await apiService.rejectLeaveRequestAdmin(selectedRequest.id, adminNote)

      if (response.success && response.data) {
        // Update both lists
        setAllRequests((prev) => prev.map((req) => (req.id === selectedRequest.id ? response.data! : req)))
        setPendingRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))

        setIsActionDialogOpen(false)
        setSelectedRequest(null)
        setAdminNote("")

        toast({
          title: "Thành công",
          description: "Đã từ chối đơn nghỉ phép",
        })
      } else {
        throw new Error(response.message || "Failed to reject request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const openActionDialog = (request: LeaveRequest, action: "approve" | "reject") => {
    console.log("🔍 Opening action dialog for request:", request)
    console.log("🔍 Request ID:", request.id, "Type:", typeof request.id)

    setSelectedRequest(request)
    setActionType(action)
    setAdminNote("")
    setIsActionDialogOpen(true)
  }

  const openDetailDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setIsDetailDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã duyệt
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Từ chối
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLeaveTypeBadge = (type: string) => {
    const typeMap: { [key: string]: string } = {
      SICK_LEAVE: "Nghỉ ốm",
      ANNUAL_LEAVE: "Nghỉ phép",
      PERSONAL_LEAVE: "Nghỉ cá nhân",
      MATERNITY_LEAVE: "Nghỉ thai sản",
      EMERGENCY_LEAVE: "Nghỉ khẩn cấp",
    }
    return typeMap[type] || type
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn nghỉ phép</h1>
          <p className="text-muted-foreground">Phê duyệt và quản lý đơn nghỉ phép của giáo viên</p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchAllRequests} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn nghỉ phép</h1>
        <p className="text-muted-foreground">Phê duyệt và quản lý đơn nghỉ phép của giáo viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRequests.length}</div>
            <p className="text-xs text-muted-foreground">Tất cả đơn nghỉ phép</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Đơn chờ phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allRequests.filter((req) => req.status === "APPROVED").length}
            </div>
            <p className="text-xs text-muted-foreground">Đơn đã phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allRequests.filter((req) => req.status === "REJECTED").length}
            </div>
            <p className="text-xs text-muted-foreground">Đơn bị từ chối</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả đơn</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt ({pendingRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên giáo viên, lý do..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lọc theo loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="SICK_LEAVE">Nghỉ ốm</SelectItem>
                    <SelectItem value="ANNUAL_LEAVE">Nghỉ phép</SelectItem>
                    <SelectItem value="PERSONAL_LEAVE">Nghỉ cá nhân</SelectItem>
                    <SelectItem value="MATERNITY_LEAVE">Nghỉ thai sản</SelectItem>
                    <SelectItem value="EMERGENCY_LEAVE">Nghỉ khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* All Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tất cả đơn nghỉ phép ({filteredRequests.length})</CardTitle>
              <CardDescription>Danh sách tất cả đơn nghỉ phép trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Loại nghỉ</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {request.teacherName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getLeaveTypeBadge(request.leaveType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.startDate).toLocaleDateString("vi-VN")}</div>
                          <div className="text-muted-foreground">
                            đến {new Date(request.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openDetailDialog(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openActionDialog(request, "approve")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openActionDialog(request, "reject")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Pending Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Đơn chờ phê duyệt ({pendingRequests.length})</CardTitle>
              <CardDescription>Danh sách đơn nghỉ phép cần được xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Loại nghỉ</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {request.teacherName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getLeaveTypeBadge(request.leaveType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.startDate).toLocaleDateString("vi-VN")}</div>
                          <div className="text-muted-foreground">
                            đến {new Date(request.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openDetailDialog(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openActionDialog(request, "approve")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openActionDialog(request, "reject")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn nghỉ phép</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Giáo viên</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.teacherName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Loại nghỉ</Label>
                  <p className="text-sm text-muted-foreground">{getLeaveTypeBadge(selectedRequest.leaveType)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ngày bắt đầu</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.startDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ngày kết thúc</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Lý do nghỉ</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ngày tạo</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              {selectedRequest.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">Ghi chú của admin</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRequest.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Phê duyệt đơn nghỉ phép" : "Từ chối đơn nghỉ phép"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve" ? "Xác nhận phê duyệt đơn nghỉ phép này" : "Xác nhận từ chối đơn nghỉ phép này"}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thông tin đơn nghỉ</Label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Giáo viên:</strong> {selectedRequest.teacherName}
                  </p>
                  <p className="text-sm">
                    <strong>Loại:</strong> {getLeaveTypeBadge(selectedRequest.leaveType)}
                  </p>
                  <p className="text-sm">
                    <strong>Thời gian:</strong> {new Date(selectedRequest.startDate).toLocaleDateString("vi-VN")}
                    {" - "} {new Date(selectedRequest.endDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm">
                    <strong>Lý do:</strong> {selectedRequest.reason}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNote">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="adminNote"
                  placeholder={actionType === "approve" ? "Nhập ghi chú về việc phê duyệt..." : "Nhập lý do từ chối..."}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={actionType === "approve" ? handleApproveRequest : handleRejectRequest}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionType === "approve" ? "Phê duyệt" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
