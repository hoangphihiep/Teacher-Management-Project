"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
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

export default function ProfilePage() {
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

  console.log("Profile page rendered, user:", user, "profile:", profile)

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
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await apiService.updateProfile(editForm)
      if (response.success && response.data) {
        setProfile(response.data)
        setIsEditing(false)
        toast({
          title: "Thành công",
          description: "Cập nhật hồ sơ thành công",
        })
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

  const handleArrayFieldChange = (field: keyof UpdateProfileRequest, value: string) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
    setEditForm((prev) => ({ ...prev, [field]: items }))
  }

  // Education handlers
  const handleAddEducation = () => {
    setCurrentEducation({
      id: Date.now(),
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

    const updatedEducations = [...(editForm.educations || [])]
    const existingIndex = updatedEducations.findIndex((e) => e.id === currentEducation.id)

    if (existingIndex >= 0) {
      updatedEducations[existingIndex] = currentEducation
    } else {
      updatedEducations.push(currentEducation)
    }

    setEditForm((prev) => ({ ...prev, educations: updatedEducations }))
    setIsEducationDialogOpen(false)
    setCurrentEducation(null)
  }

  const handleDeleteEducation = (index: number) => {
    const updatedEducations = [...(editForm.educations || [])]
    updatedEducations.splice(index, 1)
    setEditForm((prev) => ({ ...prev, educations: updatedEducations }))
  }

  // Experience handlers
  const handleAddExperience = () => {
    setCurrentExperience({
      id: Date.now(),
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

    const updatedExperiences = [...(editForm.experiences || [])]
    const existingIndex = updatedExperiences.findIndex((e) => e.id === currentExperience.id)

    if (existingIndex >= 0) {
      updatedExperiences[existingIndex] = currentExperience
    } else {
      updatedExperiences.push(currentExperience)
    }

    setEditForm((prev) => ({ ...prev, experiences: updatedExperiences }))
    setIsExperienceDialogOpen(false)
    setCurrentExperience(null)
  }

  const handleDeleteExperience = (index: number) => {
    const updatedExperiences = [...(editForm.experiences || [])]
    updatedExperiences.splice(index, 1)
    setEditForm((prev) => ({ ...prev, experiences: updatedExperiences }))
  }

  // Certification handlers
  const handleAddCertification = () => {
    setCurrentCertification({
      id: Date.now(),
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

    const updatedCertifications = [...(editForm.certifications || [])]
    const existingIndex = updatedCertifications.findIndex((c) => c.id === currentCertification.id)

    if (existingIndex >= 0) {
      updatedCertifications[existingIndex] = currentCertification
    } else {
      updatedCertifications.push(currentCertification)
    }

    setEditForm((prev) => ({ ...prev, certifications: updatedCertifications }))
    setIsCertificationDialogOpen(false)
    setCurrentCertification(null)
  }

  const handleDeleteCertification = (index: number) => {
    const updatedCertifications = [...(editForm.certifications || [])]
    updatedCertifications.splice(index, 1)
    setEditForm((prev) => ({ ...prev, certifications: updatedCertifications }))
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

    const updatedTimeSlots = [...(editForm.availableTimeSlots || [])]
    const existingIndex = updatedTimeSlots.findIndex((t) => t.id === currentTimeSlot.id)

    if (existingIndex >= 0) {
      updatedTimeSlots[existingIndex] = currentTimeSlot
    } else {
      updatedTimeSlots.push(currentTimeSlot)
    }

    setEditForm((prev) => ({ ...prev, availableTimeSlots: updatedTimeSlots }))
    setIsTimeSlotDialogOpen(false)
    setCurrentTimeSlot(null)
  }

  const handleDeleteTimeSlot = (index: number) => {
    const updatedTimeSlots = [...(editForm.availableTimeSlots || [])]
    updatedTimeSlots.splice(index, 1)
    setEditForm((prev) => ({ ...prev, availableTimeSlots: updatedTimeSlots }))
  }

  const getDayLabel = (dayOfWeek: string) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || dayOfWeek
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải hồ sơ...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Không tìm thấy hồ sơ</h1>
          <p className="text-gray-600 mt-2">Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin cá nhân và học thuật</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-royal-500 hover:bg-royal-600 gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-royal-500 hover:bg-royal-600 gap-2">
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar & Basic Info */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="bg-royal-500 text-white text-lg">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile.fullName}</CardTitle>
              <CardDescription>
                {profile.position} - {profile.department}
              </CardDescription>
              <Badge variant="outline" className="w-fit mx-auto">
                {profile.role === "ADMIN" ? "Quản trị viên" : "Giáo viên"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Sinh ngày {new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
                {profile.startDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span>Bắt đầu từ {new Date(profile.startDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          {profile.subjects && profile.subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-royal-500" />
                  Môn học giảng dạy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Kỹ năng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Time Slots */}
          {profile.availableTimeSlots && profile.availableTimeSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Thời gian rảnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.availableTimeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{getDayLabel(slot.dayOfWeek)}</div>
                        <div className="text-xs text-slate-600">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        {slot.description && <div className="text-xs text-slate-500 mt-1">{slot.description}</div>}
                      </div>
                      {slot.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Hàng tuần
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="education" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="education">Học vấn</TabsTrigger>
              <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
              <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
              <TabsTrigger value="availability">Thời gian rảnh</TabsTrigger>
              <TabsTrigger value="personal">Cá nhân</TabsTrigger>
            </TabsList>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-royal-500" />
                      Trình độ học vấn
                    </CardTitle>
                    {isEditing && (
                      <Button size="sm" variant="outline" onClick={handleAddEducation} className="gap-2 bg-transparent">
                        <Plus className="h-4 w-4" />
                        Thêm
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(isEditing ? editForm.educations : profile.educations) &&
                  (isEditing ? editForm.educations : profile.educations)!.length > 0 ? (
                    (isEditing ? editForm.educations : profile.educations)!.map((edu, index) => (
                      <div key={edu.id || index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {edu.startYear} - {edu.endYear}
                            </Badge>
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditEducation(edu)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteEducation(index)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600">{edu.university}</p>
                        {edu.gpa && <p className="text-sm text-slate-500">GPA: {edu.gpa}</p>}
                        {edu.description && <p className="text-sm text-slate-500">{edu.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Chưa có thông tin học vấn</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-emerald-500" />
                      Kinh nghiệm làm việc
                    </CardTitle>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddExperience}
                        className="gap-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(isEditing ? editForm.experiences : profile.experiences) &&
                  (isEditing ? editForm.experiences : profile.experiences)!.length > 0 ? (
                    (isEditing ? editForm.experiences : profile.experiences)!.map((exp, index) => (
                      <div key={exp.id || index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{exp.position}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {exp.startPeriod} - {exp.isCurrent ? "Hiện tại" : exp.endPeriod}
                            </Badge>
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditExperience(exp)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteExperience(index)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600">{exp.company}</p>
                        {exp.description && <p className="text-sm text-slate-500">{exp.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Chưa có thông tin kinh nghiệm</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-500" />
                      Chứng chỉ & Giải thưởng
                    </CardTitle>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddCertification}
                        className="gap-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(isEditing ? editForm.certifications : profile.certifications) &&
                  (isEditing ? editForm.certifications : profile.certifications)!.length > 0 ? (
                    (isEditing ? editForm.certifications : profile.certifications)!.map((cert, index) => (
                      <div key={cert.id || index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cert.issueYear}</Badge>
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditCertification(cert)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteCertification(index)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600">{cert.issuer}</p>
                        {cert.credentialId && <p className="text-sm text-slate-500">ID: {cert.credentialId}</p>}
                        {cert.description && <p className="text-sm text-slate-500">{cert.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Chưa có chứng chỉ</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Available Time Slots Tab */}
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Thời gian rảnh
                    </CardTitle>
                    {isEditing && (
                      <Button size="sm" variant="outline" onClick={handleAddTimeSlot} className="gap-2 bg-transparent">
                        <Plus className="h-4 w-4" />
                        Thêm
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(isEditing ? editForm.availableTimeSlots : profile.availableTimeSlots) &&
                  (isEditing ? editForm.availableTimeSlots : profile.availableTimeSlots)!.length > 0 ? (
                    (isEditing ? editForm.availableTimeSlots : profile.availableTimeSlots)!.map((slot, index) => (
                      <div key={slot.id || index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{getDayLabel(slot.dayOfWeek)}</h4>
                            <p className="text-slate-600">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            {slot.description && <p className="text-sm text-slate-500">{slot.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {slot.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                Hàng tuần
                              </Badge>
                            )}
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditTimeSlot(slot)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteTimeSlot(index)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">Chưa có thông tin thời gian rảnh</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                          id="address"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={editForm.gender}
                          onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nữ">Nữ</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Chức vụ</Label>
                        <Input
                          id="position"
                          value={editForm.position}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Khoa/Bộ môn</Label>
                        <Input
                          id="department"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="subjects">Môn học (phân cách bằng dấu phẩy)</Label>
                        <Input
                          id="subjects"
                          value={editForm.subjects?.join(", ") || ""}
                          onChange={(e) => handleArrayFieldChange("subjects", e.target.value)}
                          placeholder="Toán, Lý, Hóa"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="skills">Kỹ năng (phân cách bằng dấu phẩy)</Label>
                        <Input
                          id="skills"
                          value={editForm.skills?.join(", ") || ""}
                          onChange={(e) => handleArrayFieldChange("skills", e.target.value)}
                          placeholder="Giảng dạy, Quản lý lớp học"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hobbies">Sở thích (phân cách bằng dấu phẩy)</Label>
                        <Input
                          id="hobbies"
                          value={editForm.hobbies?.join(", ") || ""}
                          onChange={(e) => handleArrayFieldChange("hobbies", e.target.value)}
                          placeholder="Đọc sách, Du lịch"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Giới thiệu bản thân</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Viết vài dòng giới thiệu về bản thân..."
                          rows={4}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.bio && (
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Giới thiệu</h4>
                          <p className="text-slate-600">{profile.bio}</p>
                        </div>
                      )}

                      {profile.hobbies && profile.hobbies.length > 0 && (
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Sở thích</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.hobbies.map((hobby, index) => (
                              <Badge key={index} variant="secondary">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        {profile.gender && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Giới tính</Label>
                            <p className="text-slate-900">{profile.gender}</p>
                          </div>
                        )}
                        {profile.dateOfBirth && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Ngày sinh</Label>
                            <p className="text-slate-900">
                              {new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Education Dialog */}
      <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEducation?.id ? "Chỉnh sửa học vấn" : "Thêm học vấn"}</DialogTitle>
            <DialogDescription>Nhập thông tin học vấn của bạn</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="degree">Bằng cấp</Label>
              <Input
                id="degree"
                value={currentEducation?.degree || ""}
                onChange={(e) => setCurrentEducation((prev) => (prev ? { ...prev, degree: e.target.value } : null))}
                placeholder="Cử nhân, Thạc sĩ, Tiến sĩ..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="university">Trường đại học</Label>
              <Input
                id="university"
                value={currentEducation?.university || ""}
                onChange={(e) => setCurrentEducation((prev) => (prev ? { ...prev, university: e.target.value } : null))}
                placeholder="Tên trường đại học"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startYear">Năm bắt đầu</Label>
                <Input
                  id="startYear"
                  value={currentEducation?.startYear || ""}
                  onChange={(e) =>
                    setCurrentEducation((prev) => (prev ? { ...prev, startYear: e.target.value } : null))
                  }
                  placeholder="2018"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endYear">Năm kết thúc</Label>
                <Input
                  id="endYear"
                  value={currentEducation?.endYear || ""}
                  onChange={(e) => setCurrentEducation((prev) => (prev ? { ...prev, endYear: e.target.value } : null))}
                  placeholder="2022"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gpa">GPA (tùy chọn)</Label>
              <Input
                id="gpa"
                value={currentEducation?.gpa || ""}
                onChange={(e) => setCurrentEducation((prev) => (prev ? { ...prev, gpa: e.target.value } : null))}
                placeholder="3.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eduDescription">Mô tả (tùy chọn)</Label>
              <Textarea
                id="eduDescription"
                value={currentEducation?.description || ""}
                onChange={(e) =>
                  setCurrentEducation((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
                placeholder="Mô tả thêm về quá trình học tập..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveEducation}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentExperience?.id ? "Chỉnh sửa kinh nghiệm" : "Thêm kinh nghiệm"}</DialogTitle>
            <DialogDescription>Nhập thông tin kinh nghiệm làm việc của bạn</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="position">Vị trí công việc</Label>
              <Input
                id="position"
                value={currentExperience?.position || ""}
                onChange={(e) => setCurrentExperience((prev) => (prev ? { ...prev, position: e.target.value } : null))}
                placeholder="Giáo viên, Trưởng phòng..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Công ty/Tổ chức</Label>
              <Input
                id="company"
                value={currentExperience?.company || ""}
                onChange={(e) => setCurrentExperience((prev) => (prev ? { ...prev, company: e.target.value } : null))}
                placeholder="Tên công ty hoặc tổ chức"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startPeriod">Thời gian bắt đầu</Label>
                <Input
                  id="startPeriod"
                  value={currentExperience?.startPeriod || ""}
                  onChange={(e) =>
                    setCurrentExperience((prev) => (prev ? { ...prev, startPeriod: e.target.value } : null))
                  }
                  placeholder="01/2020"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endPeriod">Thời gian kết thúc</Label>
                <Input
                  id="endPeriod"
                  value={currentExperience?.endPeriod || ""}
                  onChange={(e) =>
                    setCurrentExperience((prev) => (prev ? { ...prev, endPeriod: e.target.value } : null))
                  }
                  placeholder="12/2022"
                  disabled={currentExperience?.isCurrent}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={currentExperience?.isCurrent || false}
                onChange={(e) =>
                  setCurrentExperience((prev) =>
                    prev
                      ? { ...prev, isCurrent: e.target.checked, endPeriod: e.target.checked ? "" : prev.endPeriod }
                      : null,
                  )
                }
              />
              <Label htmlFor="isCurrent">Đang làm việc tại đây</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expDescription">Mô tả công việc (tùy chọn)</Label>
              <Textarea
                id="expDescription"
                value={currentExperience?.description || ""}
                onChange={(e) =>
                  setCurrentExperience((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
                placeholder="Mô tả về công việc và trách nhiệm..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveExperience}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={isCertificationDialogOpen} onOpenChange={setIsCertificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCertification?.id ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ"}</DialogTitle>
            <DialogDescription>Nhập thông tin chứng chỉ hoặc giải thưởng của bạn</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="certName">Tên chứng chỉ</Label>
              <Input
                id="certName"
                value={currentCertification?.name || ""}
                onChange={(e) => setCurrentCertification((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                placeholder="Tên chứng chỉ hoặc giải thưởng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issuer">Tổ chức cấp</Label>
              <Input
                id="issuer"
                value={currentCertification?.issuer || ""}
                onChange={(e) => setCurrentCertification((prev) => (prev ? { ...prev, issuer: e.target.value } : null))}
                placeholder="Tên tổ chức cấp chứng chỉ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueYear">Năm cấp</Label>
                <Input
                  id="issueYear"
                  value={currentCertification?.issueYear || ""}
                  onChange={(e) =>
                    setCurrentCertification((prev) => (prev ? { ...prev, issueYear: e.target.value } : null))
                  }
                  placeholder="2022"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryYear">Năm hết hạn (tùy chọn)</Label>
                <Input
                  id="expiryYear"
                  value={currentCertification?.expiryYear || ""}
                  onChange={(e) =>
                    setCurrentCertification((prev) => (prev ? { ...prev, expiryYear: e.target.value } : null))
                  }
                  placeholder="2025"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credentialId">Mã chứng chỉ (tùy chọn)</Label>
              <Input
                id="credentialId"
                value={currentCertification?.credentialId || ""}
                onChange={(e) =>
                  setCurrentCertification((prev) => (prev ? { ...prev, credentialId: e.target.value } : null))
                }
                placeholder="ABC123456"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certDescription">Mô tả (tùy chọn)</Label>
              <Textarea
                id="certDescription"
                value={currentCertification?.description || ""}
                onChange={(e) =>
                  setCurrentCertification((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
                placeholder="Mô tả về chứng chỉ..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveCertification}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Slot Dialog */}
      <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTimeSlot?.id ? "Chỉnh sửa thời gian rảnh" : "Thêm thời gian rảnh"}</DialogTitle>
            <DialogDescription>Đăng ký thời gian rảnh để có thể được phân công công việc</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Thứ trong tuần</Label>
              <Select
                value={currentTimeSlot?.dayOfWeek || ""}
                onValueChange={(value) => setCurrentTimeSlot((prev) => (prev ? { ...prev, dayOfWeek: value } : null))}
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
              <div className="grid gap-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={currentTimeSlot?.startTime || ""}
                  onChange={(e) => setCurrentTimeSlot((prev) => (prev ? { ...prev, startTime: e.target.value } : null))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={currentTimeSlot?.endTime || ""}
                  onChange={(e) => setCurrentTimeSlot((prev) => (prev ? { ...prev, endTime: e.target.value } : null))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={currentTimeSlot?.isRecurring || false}
                onChange={(e) =>
                  setCurrentTimeSlot((prev) => (prev ? { ...prev, isRecurring: e.target.checked } : null))
                }
              />
              <Label htmlFor="isRecurring">Lặp lại hàng tuần</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeSlotDescription">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="timeSlotDescription"
                value={currentTimeSlot?.description || ""}
                onChange={(e) => setCurrentTimeSlot((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                placeholder="Ghi chú về thời gian rảnh..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveTimeSlot}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
