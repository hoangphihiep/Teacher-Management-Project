"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { toast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/course/file-upload"
import { FileList } from "@/components/course/file-list"
import {
  apiService,
  type Course,
  type UpdateCourse,
  type CourseClass,
  type CreateCourseClass,
  type UpdateCourseClass,
  type CourseFile,
} from "@/lib/api"
import { BookOpen, Edit, Plus, Trash2, Users, Calendar, FileText, Upload, Loader2 } from "lucide-react"

export default function SubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([])
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null)
  const [editCourse, setEditCourse] = useState<UpdateCourse>({
    courseName: "",
    description: "",
    teachingMaterials: "",
    referenceMaterials: "",
  })
  const [newClass, setNewClass] = useState<CreateCourseClass>({
    courseId: 0,
    className: "",
    schedule: "",
    studentList: "",
  })
  const [editClass, setEditClass] = useState<UpdateCourseClass>({
    className: "",
    schedule: "",
    studentList: "",
  })

  useEffect(() => {
    loadAssignedCourses()
  }, [])

  const loadAssignedCourses = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMyAssignedCourses()
      if (response.success) {
        setCourses(response.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách môn học được phân công",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCourseClasses = async (course: Course) => {
    try {
      setSelectedCourse(course)
      const response = await apiService.getMyCourseClasses(course.id)
      if (response.success) {
        setCourseClasses(response.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lớp học",
        variant: "destructive",
      })
    }
  }

  const loadCourseFiles = async (courseId: number) => {
    try {
      setLoadingFiles(true)
      const response = await apiService.getCourseFiles(courseId)
      if (response.success) {
        setCourseFiles(response.data)
      }
    } catch (error) {
      console.error("Error loading course files:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách file",
        variant: "destructive",
      })
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course)
    await Promise.all([loadCourseClasses(course), loadCourseFiles(course.id)])
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return
    try {
      const response = await apiService.updateMyCourse(selectedCourse.id, editCourse)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin môn học thành công",
        })
        setIsEditDialogOpen(false)
        loadAssignedCourses()
        setSelectedCourse(response.data)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin môn học",
        variant: "destructive",
      })
    }
  }

  const handleCreateClass = async () => {
    try {
      const response = await apiService.createMyCourseClass(newClass)
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
          studentList: "",
        })
        if (selectedCourse) {
          loadCourseClasses(selectedCourse)
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
      const response = await apiService.updateMyCourseClass(editingClass.id, editClass)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật lớp học thành công",
        })
        setIsEditClassDialogOpen(false)
        setEditingClass(null)
        if (selectedCourse) {
          loadCourseClasses(selectedCourse)
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
      const response = await apiService.deleteMyCourseClass(classId)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa lớp học thành công",
        })
        if (selectedCourse) {
          loadCourseClasses(selectedCourse)
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

  const handleFileUploaded = (file: CourseFile) => {
    setCourseFiles((prev) => [file, ...prev])
  }

  const handleFileDeleted = (fileId: number) => {
    setCourseFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const openEditDialog = (course: Course) => {
    setEditCourse({
      courseName: course.courseName,
      description: course.description || "",
      teachingMaterials: course.teachingMaterials || "",
      referenceMaterials: course.referenceMaterials || "",
    })
    setIsEditDialogOpen(true)
  }

  const openCreateClassDialog = (course: Course) => {
    setNewClass({
      courseId: course.id,
      className: "",
      schedule: "",
      studentList: "",
    })
    setIsCreateClassDialogOpen(true)
  }

  const openEditClassDialog = (courseClass: CourseClass) => {
    setEditingClass(courseClass)
    setEditClass({
      className: courseClass.className,
      schedule: courseClass.schedule || "",
      studentList: courseClass.studentList || "",
    })
    setIsEditClassDialogOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Môn học được phân công</h1>
        <p className="text-muted-foreground">Quản lý các môn học và lớp học được phân công cho bạn</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách môn học</CardTitle>
              <CardDescription>{courses.length} môn học được phân công</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCourse?.id === course.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                      }`}
                      onClick={() => handleCourseSelect(course)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{course.courseName}</h3>
                          <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Bạn chưa được phân công môn học nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Course Details */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Thông tin môn học</TabsTrigger>
                <TabsTrigger value="classes">Lớp học</TabsTrigger>
                <TabsTrigger value="materials">Tài liệu</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedCourse.courseName}</CardTitle>
                        <CardDescription>Mã môn học: {selectedCourse.courseCode}</CardDescription>
                      </div>
                      <Button onClick={() => openEditDialog(selectedCourse)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Mô tả</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCourse.description || "Chưa có mô tả"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Ghi chú tài liệu giảng dạy</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {selectedCourse.teachingMaterials || "Chưa có ghi chú tài liệu giảng dạy"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Ghi chú tài liệu tham khảo</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {selectedCourse.referenceMaterials || "Chưa có ghi chú tài liệu tham khảo"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="classes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Lớp học</CardTitle>
                        <CardDescription>{courseClasses.length} lớp học</CardDescription>
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
                                    Tạo ngày: {new Date(courseClass.createdAt).toLocaleDateString("vi-VN")}
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openEditClassDialog(courseClass)}>
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
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div>
                                    <Label className="text-sm font-medium">Lịch trình</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {courseClass.schedule || "Chưa có lịch trình"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div>
                                    <Label className="text-sm font-medium">Danh sách học sinh</Label>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {courseClass.studentList || "Chưa có danh sách học sinh"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Chưa có lớp học nào cho môn học này</p>
                        <Button onClick={() => openCreateClassDialog(selectedCourse)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Tạo lớp học đầu tiên
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="materials" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-500" />
                      Upload tài liệu - {selectedCourse.courseName}
                    </CardTitle>
                    <CardDescription>Upload tài liệu giảng dạy và tài liệu tham khảo cho môn học</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload courseId={selectedCourse.id} onFileUploaded={handleFileUploaded} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Danh sách tài liệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingFiles ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Đang tải danh sách file...</span>
                      </div>
                    ) : (
                      <FileList files={courseFiles} onFileDeleted={handleFileDeleted} showCategory={true} />
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
                  <p className="text-muted-foreground">Chọn một môn học để xem thông tin chi tiết</p>
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
            <DialogTitle>Chỉnh sửa thông tin môn học</DialogTitle>
            <DialogDescription>Cập nhật thông tin môn học được phân công</DialogDescription>
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
              <Label htmlFor="editTeachingMaterials">Ghi chú tài liệu giảng dạy</Label>
              <Textarea
                id="editTeachingMaterials"
                value={editCourse.teachingMaterials}
                onChange={(e) => setEditCourse({ ...editCourse, teachingMaterials: e.target.value })}
                placeholder="Ghi chú về tài liệu giảng dạy (file tài liệu được quản lý ở tab Tài liệu)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editReferenceMaterials">Ghi chú tài liệu tham khảo</Label>
              <Textarea
                id="editReferenceMaterials"
                value={editCourse.referenceMaterials}
                onChange={(e) => setEditCourse({ ...editCourse, referenceMaterials: e.target.value })}
                placeholder="Ghi chú về tài liệu tham khảo (file tài liệu được quản lý ở tab Tài liệu)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateCourse}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo lớp học mới</DialogTitle>
            <DialogDescription>Tạo lớp học cho môn học này</DialogDescription>
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
            <DialogDescription>Cập nhật thông tin lớp học</DialogDescription>
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
