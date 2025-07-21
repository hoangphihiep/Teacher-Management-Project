"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Edit,
  Save,
  X,
  Plus,
  Briefcase,
  Loader2,
  Clock,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  apiService,
  type TeacherProfile,
  type UpdateProfileRequest,
  type Education,
  type Experience,
  type Certification,
  type AvailableTimeSlot,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Thứ 2" },
  { value: "TUESDAY", label: "Thứ 3" },
  { value: "WEDNESDAY", label: "Thứ 4" },
  { value: "THURSDAY", label: "Thứ 5" },
  { value: "FRIDAY", label: "Thứ 6" },
  { value: "SATURDAY", label: "Thứ 7" },
  { value: "SUNDAY", label: "Chủ nhật" },
]

export default function AssistantProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [editForm, setEditForm] = useState<UpdateProfileRequest>({
    fullName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    position: "",
    department: "",
    bio: "",
    subjects: [],
    skills: [],
    hobbies: [],
    educations: [],
    experiences: [],
    certifications: [],
    availableTimeSlots: [],
  })

  // Dialog states for editing sections
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false)
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false)
  const [isCertificationDialogOpen, setIsCertificationDialogOpen] = useState(false)
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false)

  // Current editing items
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null)
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null)
  const [currentCertification, setCurrentCertification] = useState<Certification | null>(null)
  const [currentTimeSlot, setCurrentTimeSlot] = useState<AvailableTimeSlot | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentProfile()
      if (response.success && response.data) {
        setProfile(response.data)
        // Initialize edit form with current data
        setEditForm({
          fullName: response.data.fullName || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          dateOfBirth: response.data.dateOfBirth || "",
          gender: response.data.gender || "",
          position: response.data.position || "",
          department: response.data.department || "",
          bio: response.data.bio || "",
          subjects: response.data.subjects || [],
          skills: response.data.skills || [],
          hobbies: response.data.hobbies || [],
          educations: response.data.educations || [],
          experiences: response.data.experiences || [],
          certifications: response.data.certifications || [],
          availableTimeSlots: response.data.availableTimeSlots || [],
        })
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await apiService.updateProfile(editForm)
      if (response.success) {
        setProfile(response.data)
        setIsEditing(false)
        toast({
          title: "Thành công",
          description: "Cập nhật hồ sơ thành công",
        })
      } else {
        toast({
          title: "Lỗi",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        position: profile.position || "",
        department: profile.department || "",
        bio: profile.bio || "",
        subjects: profile.subjects || [],
        skills: profile.skills || [],
        hobbies: profile.hobbies || [],
        educations: profile.educations || [],
        experiences: profile.experiences || [],
        certifications: profile.certifications || [],
        availableTimeSlots: profile.availableTimeSlots || [],
      })
    }
    setIsEditing(false)
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const getDayLabel = (dayValue: string) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === dayValue)
    return day ? day.label : dayValue
  }

  // Education handlers
  const handleAddEducation = () => {
    setCurrentEducation({
      id: 0,
      degree: "",
      university: "",
      startYear: "",
      endYear: "",
      gpa: "",
      description: "",
    })
    setIsEducationDialogOpen(true)
  }

  const handleEditEducation = (education: Education) => {
    setCurrentEducation(education)
    setIsEducationDialogOpen(true)
  }

  const handleSaveEducation = () => {
    if (!currentEducation) return

    const updatedEducations = [...editForm.educations!]
    const existingIndex = updatedEducations.findIndex((e) => e.id === currentEducation.id)

    if (existingIndex >= 0) {
      updatedEducations[existingIndex] = currentEducation
    } else {
      updatedEducations.push({ ...currentEducation, id: Date.now() })
    }

    setEditForm({ ...editForm, educations: updatedEducations })
    setIsEducationDialogOpen(false)
    setCurrentEducation(null)
  }

  const handleDeleteEducation = (id: number) => {
    const updatedEducations = editForm.educations!.filter((e) => e.id !== id)
    setEditForm({ ...editForm, educations: updatedEducations })
  }

  // Experience handlers
  const handleAddExperience = () => {
    setCurrentExperience({
      id: 0,
      position: "",
      company: "",
      startPeriod: "",
      endPeriod: "",
      description: "",
      isCurrent: false,
    })
    setIsExperienceDialogOpen(true)
  }

  const handleEditExperience = (experience: Experience) => {
    setCurrentExperience(experience)
    setIsExperienceDialogOpen(true)
  }

  const handleSaveExperience = () => {
    if (!currentExperience) return

    const updatedExperiences = [...editForm.experiences!]
    const existingIndex = updatedExperiences.findIndex((e) => e.id === currentExperience.id)

    if (existingIndex >= 0) {
      updatedExperiences[existingIndex] = currentExperience
    } else {
      updatedExperiences.push({ ...currentExperience, id: Date.now() })
    }

    setEditForm({ ...editForm, experiences: updatedExperiences })
    setIsExperienceDialogOpen(false)
    setCurrentExperience(null)
  }

  const handleDeleteExperience = (id: number) => {
    const updatedExperiences = editForm.experiences!.filter((e) => e.id !== id)
    setEditForm({ ...editForm, experiences: updatedExperiences })
  }

  // Certification handlers
  const handleAddCertification = () => {
    setCurrentCertification({
      id: 0,
      name: "",
      issuer: "",
      issueYear: "",
      expiryYear: "",
      credentialId: "",
      description: "",
    })
    setIsCertificationDialogOpen(true)
  }

  const handleEditCertification = (certification: Certification) => {
    setCurrentCertification(certification)
    setIsCertificationDialogOpen(true)
  }

  const handleSaveCertification = () => {
    if (!currentCertification) return

    const updatedCertifications = [...editForm.certifications!]
    const existingIndex = updatedCertifications.findIndex((c) => c.id === currentCertification.id)

    if (existingIndex >= 0) {
      updatedCertifications[existingIndex] = currentCertification
    } else {
      updatedCertifications.push({ ...currentCertification, id: Date.now() })
    }

    setEditForm({ ...editForm, certifications: updatedCertifications })
    setIsCertificationDialogOpen(false)
    setCurrentCertification(null)
  }

  const handleDeleteCertification = (id: number) => {
    const updatedCertifications = editForm.certifications!.filter((c) => c.id !== id)
    setEditForm({ ...editForm, certifications: updatedCertifications })
  }

  // Time slot handlers
  const handleAddTimeSlot = () => {
    setCurrentTimeSlot({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      description: "",
      isRecurring: true,
    })
    setIsTimeSlotDialogOpen(true)
  }

  const handleEditTimeSlot = (timeSlot: AvailableTimeSlot) => {
    setCurrentTimeSlot(timeSlot)
    setIsTimeSlotDialogOpen(true)
  }

  const handleSaveTimeSlot = () => {
    if (!currentTimeSlot) return

    const updatedTimeSlots = [...editForm.availableTimeSlots!]
    const existingIndex = updatedTimeSlots.findIndex((t) => t.id === currentTimeSlot.id)

    if (existingIndex >= 0) {
      updatedTimeSlots[existingIndex] = currentTimeSlot
    } else {
      updatedTimeSlots.push({ ...currentTimeSlot, id: Date.now() })
    }

    setEditForm({ ...editForm, availableTimeSlots: updatedTimeSlots })
    setIsTimeSlotDialogOpen(false)
    setCurrentTimeSlot(null)
  }

  const handleDeleteTimeSlot = (id: number) => {
    const updatedTimeSlots = editForm.availableTimeSlots!.filter((t) => t.id !== id)
    setEditForm({ ...editForm, availableTimeSlots: updatedTimeSlots })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Không thể tải thông tin hồ sơ</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-emerald-500 hover:bg-emerald-600">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.fullName} />
              <AvatarFallback className="text-lg bg-emerald-500 text-white">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Trợ giảng
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {profile.department}
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="education">Học vấn</TabsTrigger>
          <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
          <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
          <TabsTrigger value="availability">Thời gian rảnh</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin cơ bản về bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{profile.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">{profile.email} (không thể thay đổi)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{profile.phone || "Chưa cập nhật"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Chưa cập nhật"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.gender}
                      onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">
                      {profile.gender === "male"
                        ? "Nam"
                        : profile.gender === "female"
                          ? "Nữ"
                          : profile.gender || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{profile.position || "Trợ giảng"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{profile.address || "Chưa cập nhật"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Khoa/Phòng ban</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{profile.department || "Chưa cập nhật"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                  />
                ) : (
                  <p className="text-sm">{profile.bio || "Chưa có giới thiệu"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Học vấn
                  </CardTitle>
                  <CardDescription>Thông tin về quá trình học tập</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={handleAddEducation} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm học vấn
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isEditing ? editForm.educations : profile.educations)?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có thông tin học vấn</p>
              ) : (
                <div className="space-y-4">
                  {(isEditing ? editForm.educations : profile.educations)?.map((education) => (
                    <div key={education.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{education.degree}</h4>
                          <p className="text-sm text-muted-foreground">{education.university}</p>
                          <p className="text-sm text-muted-foreground">
                            {education.startYear} - {education.endYear}
                          </p>
                          {education.gpa && <p className="text-sm">GPA: {education.gpa}</p>}
                          {education.description && <p className="text-sm mt-2">{education.description}</p>}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditEducation(education)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteEducation(education.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Kinh nghiệm làm việc
                  </CardTitle>
                  <CardDescription>Thông tin về kinh nghiệm làm việc</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={handleAddExperience} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm kinh nghiệm
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isEditing ? editForm.experiences : profile.experiences)?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có thông tin kinh nghiệm</p>
              ) : (
                <div className="space-y-4">
                  {(isEditing ? editForm.experiences : profile.experiences)?.map((experience) => (
                    <div key={experience.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{experience.position}</h4>
                          <p className="text-sm text-muted-foreground">{experience.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {experience.startPeriod} - {experience.isCurrent ? "Hiện tại" : experience.endPeriod}
                          </p>
                          {experience.description && <p className="text-sm mt-2">{experience.description}</p>}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditExperience(experience)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteExperience(experience.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Chứng chỉ
                  </CardTitle>
                  <CardDescription>Các chứng chỉ và bằng cấp khác</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={handleAddCertification} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm chứng chỉ
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isEditing ? editForm.certifications : profile.certifications)?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có chứng chỉ nào</p>
              ) : (
                <div className="space-y-4">
                  {(isEditing ? editForm.certifications : profile.certifications)?.map((certification) => (
                    <div key={certification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{certification.name}</h4>
                          <p className="text-sm text-muted-foreground">{certification.issuer}</p>
                          <p className="text-sm text-muted-foreground">
                            Cấp năm: {certification.issueYear}
                            {certification.expiryYear && ` • Hết hạn: ${certification.expiryYear}`}
                          </p>
                          {certification.credentialId && (
                            <p className="text-sm">Mã chứng chỉ: {certification.credentialId}</p>
                          )}
                          {certification.description && <p className="text-sm mt-2">{certification.description}</p>}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCertification(certification)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCertification(certification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Time Slots */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Thời gian rảnh
                  </CardTitle>
                  <CardDescription>Thời gian có thể làm việc trong tuần</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={handleAddTimeSlot} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thời gian
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isEditing ? editForm.availableTimeSlots : profile.availableTimeSlots)?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có thông tin thời gian rảnh</p>
              ) : (
                <div className="space-y-4">
                  {(isEditing ? editForm.availableTimeSlots : profile.availableTimeSlots)?.map((timeSlot) => (
                    <div key={timeSlot.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{getDayLabel(timeSlot.dayOfWeek)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </p>
                          {timeSlot.description && <p className="text-sm mt-2">{timeSlot.description}</p>}
                          {timeSlot.isRecurring && (
                            <Badge variant="outline" className="mt-2">
                              Lặp lại hàng tuần
                            </Badge>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditTimeSlot(timeSlot)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTimeSlot(timeSlot.id!)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Education Dialog */}
      <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEducation?.id ? "Chỉnh sửa học vấn" : "Thêm học vấn"}</DialogTitle>
            <DialogDescription>Nhập thông tin về quá trình học tập</DialogDescription>
          </DialogHeader>
          {currentEducation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bằng cấp/Chuyên ngành</Label>
                <Input
                  value={currentEducation.degree}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
                  placeholder="Ví dụ: Cử nhân Công nghệ Thông tin"
                />
              </div>
              <div className="space-y-2">
                <Label>Trường học</Label>
                <Input
                  value={currentEducation.university}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, university: e.target.value })}
                  placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Năm bắt đầu</Label>
                  <Input
                    value={currentEducation.startYear}
                    onChange={(e) => setCurrentEducation({ ...currentEducation, startYear: e.target.value })}
                    placeholder="2018"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Năm kết thúc</Label>
                  <Input
                    value={currentEducation.endYear}
                    onChange={(e) => setCurrentEducation({ ...currentEducation, endYear: e.target.value })}
                    placeholder="2022"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GPA (tùy chọn)</Label>
                <Input
                  value={currentEducation.gpa || ""}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, gpa: e.target.value })}
                  placeholder="3.5/4.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Textarea
                  value={currentEducation.description || ""}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, description: e.target.value })}
                  placeholder="Thông tin bổ sung về quá trình học tập..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEducationDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEducation} className="bg-emerald-500 hover:bg-emerald-600">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentExperience?.id ? "Chỉnh sửa kinh nghiệm" : "Thêm kinh nghiệm"}</DialogTitle>
            <DialogDescription>Nhập thông tin về kinh nghiệm làm việc</DialogDescription>
          </DialogHeader>
          {currentExperience && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vị trí công việc</Label>
                <Input
                  value={currentExperience.position}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, position: e.target.value })}
                  placeholder="Ví dụ: Trợ giảng"
                />
              </div>
              <div className="space-y-2">
                <Label>Công ty/Tổ chức</Label>
                <Input
                  value={currentExperience.company}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                  placeholder="Ví dụ: Đại học ABC"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thời gian bắt đầu</Label>
                  <Input
                    value={currentExperience.startPeriod}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, startPeriod: e.target.value })}
                    placeholder="01/2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thời gian kết thúc</Label>
                  <Input
                    value={currentExperience.endPeriod || ""}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, endPeriod: e.target.value })}
                    placeholder="12/2022"
                    disabled={currentExperience.isCurrent}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={currentExperience.isCurrent}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, isCurrent: e.target.checked })}
                />
                <Label htmlFor="isCurrent">Đang làm việc tại đây</Label>
              </div>
              <div className="space-y-2">
                <Label>Mô tả công việc (tùy chọn)</Label>
                <Textarea
                  value={currentExperience.description || ""}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                  placeholder="Mô tả về công việc và trách nhiệm..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExperienceDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveExperience} className="bg-emerald-500 hover:bg-emerald-600">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={isCertificationDialogOpen} onOpenChange={setIsCertificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCertification?.id ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ"}</DialogTitle>
            <DialogDescription>Nhập thông tin về chứng chỉ</DialogDescription>
          </DialogHeader>
          {currentCertification && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên chứng chỉ</Label>
                <Input
                  value={currentCertification.name}
                  onChange={(e) => setCurrentCertification({ ...currentCertification, name: e.target.value })}
                  placeholder="Ví dụ: Chứng chỉ Tin học văn phòng"
                />
              </div>
              <div className="space-y-2">
                <Label>Tổ chức cấp</Label>
                <Input
                  value={currentCertification.issuer}
                  onChange={(e) => setCurrentCertification({ ...currentCertification, issuer: e.target.value })}
                  placeholder="Ví dụ: Microsoft"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Năm cấp</Label>
                  <Input
                    value={currentCertification.issueYear}
                    onChange={(e) => setCurrentCertification({ ...currentCertification, issueYear: e.target.value })}
                    placeholder="2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Năm hết hạn (tùy chọn)</Label>
                  <Input
                    value={currentCertification.expiryYear || ""}
                    onChange={(e) => setCurrentCertification({ ...currentCertification, expiryYear: e.target.value })}
                    placeholder="2025"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mã chứng chỉ (tùy chọn)</Label>
                <Input
                  value={currentCertification.credentialId || ""}
                  onChange={(e) => setCurrentCertification({ ...currentCertification, credentialId: e.target.value })}
                  placeholder="ABC123456"
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Textarea
                  value={currentCertification.description || ""}
                  onChange={(e) => setCurrentCertification({ ...currentCertification, description: e.target.value })}
                  placeholder="Thông tin bổ sung về chứng chỉ..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCertificationDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveCertification} className="bg-emerald-500 hover:bg-emerald-600">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Slot Dialog */}
      <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTimeSlot?.id ? "Chỉnh sửa thời gian" : "Thêm thời gian rảnh"}</DialogTitle>
            <DialogDescription>Nhập thông tin về thời gian có thể làm việc</DialogDescription>
          </DialogHeader>
          {currentTimeSlot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Thứ trong tuần</Label>
                <Select
                  value={currentTimeSlot.dayOfWeek}
                  onValueChange={(value) => setCurrentTimeSlot({ ...currentTimeSlot, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={currentTimeSlot.startTime}
                    onChange={(e) => setCurrentTimeSlot({ ...currentTimeSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giờ kết thúc</Label>
                  <Input
                    type="time"
                    value={currentTimeSlot.endTime}
                    onChange={(e) => setCurrentTimeSlot({ ...currentTimeSlot, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú (tùy chọn)</Label>
                <Input
                  value={currentTimeSlot.description || ""}
                  onChange={(e) => setCurrentTimeSlot({ ...currentTimeSlot, description: e.target.value })}
                  placeholder="Ví dụ: Có thể hỗ trợ giảng dạy"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={currentTimeSlot.isRecurring}
                  onChange={(e) => setCurrentTimeSlot({ ...currentTimeSlot, isRecurring: e.target.checked })}
                />
                <Label htmlFor="isRecurring">Lặp lại hàng tuần</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeSlotDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveTimeSlot} className="bg-emerald-500 hover:bg-emerald-600">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
