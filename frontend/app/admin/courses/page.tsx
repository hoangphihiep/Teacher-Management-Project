"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { apiService, Course, CreateCourse, UpdateCourse, CourseAssignment, CreateCourseAssignment, CourseClass, CreateCourseClass, UpdateCourseClass, User } from "@/lib/api"
import { Plus, Edit, Trash2, Users, BookOpen, Calendar, UserPlus, X } from 'lucide-react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([])
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null)

  const [newCourse, setNewCourse] = useState<CreateCourse>({
    courseCode: "",
    courseName: "",
    description: "",
    teachingMaterials: "",
    referenceMaterials: ""
  })

  const [editCourse, setEditCourse] = useState<UpdateCourse>({
    courseName: "",
    description: "",
    teachingMaterials: "",
    referenceMaterials: ""
  })

  const [newAssignment, setNewAssignment] = useState<CreateCourseAssignment>({
    courseId: 0,
    teacherId: 0
  })

  const [newClass, setNewClass] = useState<CreateCourseClass>({
    courseId: 0,
    className: "",
    schedule: "",
    studentList: ""
  })

  const [editClass, setEditClass] = useState<UpdateCourseClass>({
    className: "",
    schedule: "",
    studentList: ""
  })

  useEffect(() => {
    loadCourses()
    loadUsers()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllCourses()
      if (response.success) {
        setCourses(response.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách môn học",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers()
      if (response.success) {
        setUsers(response.data.filter(user => user.role === "TEACHER"))
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadCourseDetails = async (course: Course) => {
    try {
      setSelectedCourse(course)
      
      // Load assignments
      const assignmentsResponse = await apiService.getCourseAssignments(course.id)
      if (assignmentsResponse.success) {
        setCourseAssignments(assignmentsResponse.data)
      }

      // Load classes
      const classesResponse = await apiService.getCourseClasses(course.id)
      if (classesResponse.success) {
        setCourseClasses(classesResponse.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chi tiết môn học",
        variant: "destructive",
      })
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await apiService.createCourse(newCourse)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Tạo môn học mới thành công",
        })
        setIsCreateDialogOpen(false)
        setNewCourse({
          courseCode: "",
          courseName: "",
          description: "",
          teachingMaterials: "",
          referenceMaterials: ""
        })
        loadCourses()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo môn học mới",
        variant: "destructive",
      })
    }
  }

  const handleEditCourse = async () => {
    if (!selectedCourse) return

    try {
      const response = await apiService.updateCourse(selectedCourse.id, editCourse)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật môn học thành công",
        })
        setIsEditDialogOpen(false)
        loadCourses()
        loadCourseDetails(response.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật môn học",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const response = await apiService.deleteCourse(courseId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa môn học thành công",
        })
        loadCourses()
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa môn học",
        variant: "destructive",
      })
    }
  }

  const handleAssignTeacher = async () => {
    try {
      const response = await apiService.assignTeacherToCourse(newAssignment)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Phân công giáo viên thành công",
        })
        setIsAssignDialogOpen(false)
        setNewAssignment({ courseId: 0, teacherId: 0 })
        if (selectedCourse) {
          loadCourseDetails(selectedCourse)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phân công giáo viên",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      const response = await apiService.removeTeacherFromCourse(assignmentId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Hủy phân công giáo viên thành công",
        })
        if (selectedCourse) {
          loadCourseDetails(selectedCourse)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy phân công giáo viên",
        variant: "destructive",
      })
    }
  }

  const handleCreateClass = async () => {
    try {
      const response = await apiService.createCourseClass(newClass)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Tạo lớp học thành công",
        })
        setIsCreateClassDialogOpen(false)
        setNewClass({
          courseId: 0,
          className: "",
          schedule: "",
          studentList: ""
        })
        if (selectedCourse) {
          loadCourseDetails(selectedCourse)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo lớp học",
        variant: "destructive",
      })
    }
  }

  const handleEditClass = async () => {
    if (!editingClass) return

    try {
      const response = await apiService.updateCourseClass(editingClass.id, editClass)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật lớp học thành công",
        })
        setIsEditClassDialogOpen(false)
        setEditingClass(null)
        if (selectedCourse) {
          loadCourseDetails(selectedCourse)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật lớp học",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClass = async (classId: number) => {
    try {
      const response = await apiService.deleteCourseClass(classId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa lớp học thành công",
        })
        if (selectedCourse) {
          loadCourseDetails(selectedCourse)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa lớp học",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (course: Course) => {
    setEditCourse({
      courseName: course.courseName,
      description: course.description || "",
      teachingMaterials: course.teachingMaterials || "",
      referenceMaterials: course.referenceMaterials || ""
    })
    setIsEditDialogOpen(true)
  }

  const openAssignDialog = (course: Course) => {
    setNewAssignment({
      courseId: course.id,
      teacherId: 0
    })
    setIsAssignDialogOpen(true)
  }

  const openCreateClassDialog = (course: Course) => {
    setNewClass({
      courseId: course.id,
      className: "",
      schedule: "",
      studentList: ""
    })
    setIsCreateClassDialogOpen(true)
  }

  const openEditClassDialog = (courseClass: CourseClass) => {
    setEditingClass(courseClass)
    setEditClass({
      className: courseClass.className,
      schedule: courseClass.schedule || "",
      studentList: courseClass.studentList || ""
    })
    setIsEditClassDialogOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Môn học</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo môn học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo môn học mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo môn học mới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="courseCode">Mã môn học</Label>
                  <Input
                    id="courseCode"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    placeholder="VD: CS101"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="courseName">Tên môn học</Label>
                  <Input
                    id="courseName"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                    placeholder="VD: Lập trình cơ bản"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Mô tả về môn học..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teachingMaterials">Tài liệu giảng dạy</Label>
                <Textarea
                  id="teachingMaterials"
                  value={newCourse.teachingMaterials}
                  onChange={(e) => setNewCourse({ ...newCourse, teachingMaterials: e.target.value })}
                  placeholder="Danh sách tài liệu giảng dạy..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referenceMaterials">Tài liệu tham khảo</Label>
                <Textarea
                  id="referenceMaterials"
                  value={newCourse.referenceMaterials}
                  onChange={(e) => setNewCourse({ ...newCourse, referenceMaterials: e.target.value })}
                  placeholder="Danh sách tài liệu tham khảo..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateCourse}>Tạo môn học</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách môn học</CardTitle>
              <CardDescription>
                Tổng cộng {courses.length} môn học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCourse?.id === course.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => loadCourseDetails(course)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{course.courseName}</h3>
                        <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(course)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa môn học "{course.courseName}"? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Details */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
                <TabsTrigger value="classes">Lớp học</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCourse.courseName}</CardTitle>
                    <CardDescription>Mã môn học: {selectedCourse.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Mô tả</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCourse.description || "Chưa có mô tả"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tài liệu giảng dạy</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {selectedCourse.teachingMaterials || "Chưa có tài liệu giảng dạy"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tài liệu tham khảo</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {selectedCourse.referenceMaterials || "Chưa có tài liệu tham khảo"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Giáo viên được phân công</CardTitle>
                        <CardDescription>
                          {courseAssignments.length} giáo viên được phân công
                        </CardDescription>
                      </div>
                      <Button onClick={() => openAssignDialog(selectedCourse)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Phân công giáo viên
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courseAssignments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên giáo viên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ngày phân công</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>{assignment.teacherName}</TableCell>
                              <TableCell>{assignment.teacherEmail}</TableCell>
                              <TableCell>
                                {new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}
                              </TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận hủy phân công</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn hủy phân công giáo viên "{assignment.teacherName}" 
                                        khỏi môn học này?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRemoveAssignment(assignment.id)}>
                                        Xác nhận
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Chưa có giáo viên nào được phân công
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="classes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Lớp học</CardTitle>
                        <CardDescription>
                          {courseClasses.length} lớp học
                        </CardDescription>
                      </div>
                      <Button onClick={() => openCreateClassDialog(selectedCourse)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo lớp học
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courseClasses.length > 0 ? (
                      <div className="space-y-4">
                        {courseClasses.map((courseClass) => (
                          <Card key={courseClass.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{courseClass.className}</CardTitle>
                                  <CardDescription>
                                    Tạo ngày: {new Date(courseClass.createdAt).toLocaleDateString('vi-VN')}
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditClassDialog(courseClass)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bạn có chắc chắn muốn xóa lớp học "{courseClass.className}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteClass(courseClass.id)}>
                                          Xóa
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-sm font-medium">Lịch trình</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {courseClass.schedule || "Chưa có lịch trình"}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Danh sách học sinh</Label>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {courseClass.studentList || "Chưa có danh sách học sinh"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Chưa có lớp học nào
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Chọn một môn học để xem thông tin chi tiết
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa môn học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin môn học
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editCourseName">Tên môn học</Label>
              <Input
                id="editCourseName"
                value={editCourse.courseName}
                onChange={(e) => setEditCourse({ ...editCourse, courseName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Mô tả</Label>
              <Textarea
                id="editDescription"
                value={editCourse.description}
                onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editTeachingMaterials">Tài liệu giảng dạy</Label>
              <Textarea
                id="editTeachingMaterials"
                value={editCourse.teachingMaterials}
                onChange={(e) => setEditCourse({ ...editCourse, teachingMaterials: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editReferenceMaterials">Tài liệu tham khảo</Label>
              <Textarea
                id="editReferenceMaterials"
                value={editCourse.referenceMaterials}
                onChange={(e) => setEditCourse({ ...editCourse, referenceMaterials: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditCourse}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân công giáo viên</DialogTitle>
            <DialogDescription>
              Chọn giáo viên để phân công cho môn học này
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teacherSelect">Giáo viên</Label>
              <Select
                value={newAssignment.teacherId.toString()}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, teacherId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giáo viên" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignTeacher}>Phân công</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo lớp học mới</DialogTitle>
            <DialogDescription>
              Tạo lớp học cho môn học này
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="className">Tên lớp học</Label>
              <Input
                id="className"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                placeholder="VD: Lớp A1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule">Lịch trình</Label>
              <Textarea
                id="schedule"
                value={newClass.schedule}
                onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                placeholder="VD: Thứ 2, 4, 6 - 8:00-10:00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="studentList">Danh sách học sinh</Label>
              <Textarea
                id="studentList"
                value={newClass.studentList}
                onChange={(e) => setNewClass({ ...newClass, studentList: e.target.value })}
                placeholder="Nhập danh sách học sinh, mỗi học sinh một dòng"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateClassDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateClass}>Tạo lớp học</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lớp học
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editClassName">Tên lớp học</Label>
              <Input
                id="editClassName"
                value={editClass.className}
                onChange={(e) => setEditClass({ ...editClass, className: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editSchedule">Lịch trình</Label>
              <Textarea
                id="editSchedule"
                value={editClass.schedule}
                onChange={(e) => setEditClass({ ...editClass, schedule: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editStudentList">Danh sách học sinh</Label>
              <Textarea
                id="editStudentList"
                value={editClass.studentList}
                onChange={(e) => setEditClass({ ...editClass, studentList: e.target.value })}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditClass}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}