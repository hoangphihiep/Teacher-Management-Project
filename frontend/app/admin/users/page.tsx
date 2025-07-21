"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Eye, EyeOff, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { apiService, type User, type CreateUserRequest, type UpdateUserRequest, type TeacherProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingProfile, setViewingProfile] = useState<TeacherProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "TEACHER",
  })

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    fullName: "",
    email: "",
    role: "TEACHER",
    active: true,
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiService.getUsers()

      if (response.success && response.data) {
        setUsers(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
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

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => (statusFilter === "active" ? user.enabled : !user.enabled))
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    try {
      const response = await apiService.createUser(createForm)

      if (response.success && response.data) {
        setUsers((prev) => [...prev, response.data!])
        setIsCreateDialogOpen(false)
        setCreateForm({
          username: "",
          password: "",
          fullName: "",
          email: "",
          role: "TEACHER",
        })
        toast({
          title: "Thành công",
          description: "Tạo người dùng thành công",
        })
      } else {
        throw new Error(response.message || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const response = await apiService.updateUser(editingUser.id, editForm)

      if (response.success && response.data) {
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? response.data! : user)))
        setIsEditDialogOpen(false)
        setEditingUser(null)
        toast({
          title: "Thành công",
          description: "Cập nhật người dùng thành công",
        })
      } else {
        throw new Error(response.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await apiService.deleteUser(userId)

      if (response.success) {
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        toast({
          title: "Thành công",
          description: "Xóa người dùng thành công",
        })
      } else {
        throw new Error(response.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const response = await apiService.toggleUserStatus(userId)

      if (response.success && response.data) {
        setUsers((prev) => prev.map((user) => (user.id === userId ? response.data! : user)))
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái người dùng thành công",
        })
      } else {
        throw new Error(response.message || "Failed to toggle user status")
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleViewProfile = async (user: User) => {
    try {
      setIsLoadingProfile(true)
      const response = await apiService.getProfileByUserId(user.id)

      if (response.success && response.data) {
        setViewingProfile(response.data)
        setIsProfileDialogOpen(true)
      } else {
        throw new Error(response.message || "Failed to load profile")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải thông tin hồ sơ",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.enabled,
    })
    setIsEditDialogOpen(true)
  }

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDayLabel = (dayOfWeek: string): string => {
    const days: Record<string, string> = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    }
    return days[dayOfWeek] || dayOfWeek
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Tạo, chỉnh sửa và quản lý tài khoản người dùng</p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchUsers} variant="outline">
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Tạo, chỉnh sửa và quản lý tài khoản người dùng</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tạo người dùng mới</DialogTitle>
              <DialogDescription>Nhập thông tin để tạo tài khoản người dùng mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Nhập mật khẩu"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Nhập email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value) => setCreateForm((prev) => ({ ...prev, role: value as "ADMIN" | "TEACHER" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">Giáo viên</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateUser}>
                Tạo người dùng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                  placeholder="Tìm kiếm theo tên, username hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="TEACHER">Giáo viên</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
          <CardDescription>Quản lý tất cả người dùng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Quản trị viên" : "Giáo viên"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.enabled ? "default" : "secondary"}>
                      {user.enabled ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProfile(user)}
                        disabled={isLoadingProfile}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleUserStatus(user.id)}>
                        {user.enabled ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa người dùng "{user.fullName}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin người dùng</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editFullName">Họ và tên</Label>
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRole">Vai trò</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value as "ADMIN" | "TEACHER" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Giáo viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editActive"
                checked={editForm.active}
                onChange={(e) => setEditForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              <Label htmlFor="editActive">Tài khoản hoạt động</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditUser}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin hồ sơ</DialogTitle>
            <DialogDescription>Chi tiết hồ sơ của {viewingProfile?.fullName}</DialogDescription>
          </DialogHeader>

          {viewingProfile && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewingProfile.avatarUrl || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="bg-royal-500 text-white text-lg">
                    {getInitials(viewingProfile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{viewingProfile.fullName}</h3>
                  <p className="text-muted-foreground">
                    {viewingProfile.position} - {viewingProfile.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{viewingProfile.role === "ADMIN" ? "Quản trị viên" : "Giáo viên"}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="grid gap-3">
                <h4 className="font-medium">Thông tin liên hệ</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingProfile.email}</span>
                  </div>
                  {viewingProfile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{viewingProfile.phone}</span>
                    </div>
                  )}
                  {viewingProfile.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewingProfile.address}</span>
                    </div>
                  )}
                  {viewingProfile.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Sinh ngày {new Date(viewingProfile.dateOfBirth).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {viewingProfile.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Giới thiệu</h4>
                    <p className="text-sm text-muted-foreground">{viewingProfile.bio}</p>
                  </div>
                </>
              )}

              <Tabs defaultValue="subjects" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="subjects">Môn học</TabsTrigger>
                  <TabsTrigger value="education">Học vấn</TabsTrigger>
                  <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
                  <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
                  <TabsTrigger value="availability">Thời gian rảnh</TabsTrigger>
                </TabsList>

                <TabsContent value="subjects" className="space-y-4">
                  {viewingProfile.subjects && viewingProfile.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewingProfile.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có thông tin môn học</p>
                  )}

                  {viewingProfile.skills && viewingProfile.skills.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Kỹ năng</h5>
                      <div className="flex flex-wrap gap-2">
                        {viewingProfile.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  {viewingProfile.educations && viewingProfile.educations.length > 0 ? (
                    viewingProfile.educations.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{edu.degree}</h5>
                          <Badge variant="outline">
                            {edu.startYear} - {edu.endYear}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{edu.university}</p>
                        {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                        {edu.description && <p className="text-sm text-muted-foreground">{edu.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có thông tin học vấn</p>
                  )}
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  {viewingProfile.experiences && viewingProfile.experiences.length > 0 ? (
                    viewingProfile.experiences.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{exp.position}</h5>
                          <Badge variant="outline">
                            {exp.startPeriod} - {exp.isCurrent ? "Hiện tại" : exp.endPeriod}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có thông tin kinh nghiệm</p>
                  )}
                </TabsContent>

                <TabsContent value="certifications" className="space-y-4">
                  {viewingProfile.certifications && viewingProfile.certifications.length > 0 ? (
                    viewingProfile.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{cert.name}</h5>
                          <Badge variant="outline">{cert.issueYear}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        {cert.credentialId && <p className="text-sm">ID: {cert.credentialId}</p>}
                        {cert.description && <p className="text-sm text-muted-foreground">{cert.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có chứng chỉ</p>
                  )}
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                  {viewingProfile.availableTimeSlots && viewingProfile.availableTimeSlots.length > 0 ? (
                    viewingProfile.availableTimeSlots.map((slot, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{getDayLabel(slot.dayOfWeek)}</h5>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            {slot.description && <p className="text-sm text-muted-foreground">{slot.description}</p>}
                          </div>
                          {slot.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Hàng tuần
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có thông tin thời gian rảnh</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
