const API_BASE_URL = "http://localhost:8080/api"
// const API_BASE_URL = "https://teacher-management-backend-production-7e85.up.railway.app/api"

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  type: string
  username: string
  fullName: string
  email: string
  role: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface TeacherProfile {
  id: number
  userId: number
  username: string
  fullName: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  position?: string
  department?: string
  startDate?: string
  avatarUrl?: string
  bio?: string
  subjects?: string[]
  skills?: string[]
  hobbies?: string[]
  role: string
  educations: Education[]
  experiences: Experience[]
  certifications: Certification[]
  availableTimeSlots: AvailableTimeSlot[]
}

export interface Education {
  id: number
  degree: string
  university: string
  startYear: string
  endYear: string
  gpa?: string
  description?: string
}

export interface Experience {
  id: number
  position: string
  company: string
  startPeriod: string
  endPeriod?: string
  description?: string
  isCurrent: boolean
}

export interface Certification {
  id: number
  name: string
  issuer: string
  issueYear: string
  expiryYear?: string
  credentialId?: string
  description?: string
}

export interface AvailableTimeSlot {
  id?: number
  dayOfWeek: string
  startTime: string
  endTime: string
  description?: string
  isRecurring: boolean
}

export interface UpdateProfileRequest {
  fullName: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  position?: string
  department?: string
  bio?: string
  subjects?: string[]
  skills?: string[]
  hobbies?: string[]
  educations?: Education[]
  experiences?: Experience[]
  certifications?: Certification[]
  availableTimeSlots?: AvailableTimeSlot[]
}

export interface DashboardStats {
  todayClasses: number
  totalStudents: number
  totalSubjects: number
  weeklyTeachingHours: number
  todaySchedule: TodaySchedule[]
  recentActivities: Activity[]
  importantNotifications: Notification[]
  weeklyProgress: WeeklyProgress
}

export interface TodaySchedule {
  id: number
  subject: string
  className: string
  room: string
  startTime: string
  endTime: string
  status: string
  notes?: string
}

export interface Activity {
  id: number
  action: string
  description: string
  type: string
  timeAgo: string
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  priority: string
  isRead: boolean
  scheduledDate?: string
  createdAt: string
}

export interface WeeklyProgress {
  completedClasses: number
  totalClasses: number
  gradedTests: number
  totalTests: number
  completedAttendance: number
  totalAttendance: number
}

// Leave Request interfaces
export interface LeaveRequest {
  id: number
  teacherId: number
  teacherName: string
  approvedById?: number
  approvedByName?: string
  startDate: string
  endDate: string
  leaveType: string
  leaveTypeDisplay: string
  reason: string
  status: string
  statusDisplay: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  totalDays: number
}

export interface CreateLeaveRequest {
  startDate: string
  endDate: string
  leaveType: string
  reason: string
}

export interface LeaveRequestAction {
  adminNote?: string
}

export interface LeaveType {
  value: string
  label: string
}

// Message interfaces
export interface Message {
  id: number
  senderId: number
  senderName: string
  senderEmail: string
  subject: string
  content: string
  messageType: string
  messageTypeDisplay: string
  priority: string
  priorityDisplay: string
  isBroadcast: boolean
  createdAt: string
  isRead?: boolean
  readAt?: string
  recipients?: MessageRecipient[]
}

export interface MessageRecipient {
  id: number
  messageId: number
  recipientId: number
  recipientName: string
  recipientEmail: string
  isRead: boolean
  readAt?: string
  createdAt: string
}


export interface CreateMessage {
  subject: string
  content: string
  messageType: string
  priority?: string
  isBroadcast?: boolean
  recipientIds: number[]
}

export interface MessageType {
  value: string
  label: string
}

export interface MessagePriority {
  value: string
  label: string
}

export interface User {
  id: number
  username: string
  fullName: string
  email: string
  role: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string
  password: string
  fullName: string
  email: string
  role: string
}

export interface UpdateUserRequest {
  fullName: string
  email: string
  role: string
  active: boolean
}

export interface AdminStats {
  totalUsers: number
  totalTeachers: number
  totalAdmins: number
  activeUsers: number
  totalLeaveRequests: number
  pendingLeaveRequests: number
  approvedLeaveRequests: number
  rejectedLeaveRequests: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  teachers: number
  admins: number
}

export interface LeaveRequestStats {
  totalRequests: number
  pendingRequests: number
  activeLeaves: number
}

// Work Schedule interfaces
export interface WorkSchedule {
  id: number
  teacherId: number
  teacherName: string
  workDate: string
  startTime: string
  endTime: string
  workType: string
  workTypeDisplay: string
  workTypeColor: string
  location?: string
  content: string
  notes?: string
  attendanceStatus: string
  attendanceStatusDisplay: string
  attendanceNotes?: string
  createdAt: string
  updatedAt: string
  createdBy: number
  duration: number
}

export interface CreateWorkSchedule {
  teacherId: number
  workDate: string
  startTime: string
  endTime: string
  workType: string
  location?: string
  content: string
  notes?: string
}

export interface AttendanceMark {
  attendanceStatus: string
  attendanceNotes?: string
}

export interface TeacherWorkSummary {
  teacherId: number
  teacherName: string
  teacherEmail: string
  totalHoursThisWeek: number
  totalSchedulesThisWeek: number
  unmarkedAttendance: number
  lastUpdated: string
}

export interface WorkType {
  value: string
  label: string
  color: string
}

export interface AttendanceStatus {
  value: string
  label: string
}

// Course interfaces
export interface Course {
  id: number
  courseCode: string
  courseName: string
  description?: string
  teachingMaterials?: string
  referenceMaterials?: string
  createdAt: string
  updatedAt: string
  createdBy: number
  assignments?: CourseAssignment[]
  classes?: CourseClass[]
}

export interface CreateCourse {
  courseCode: string
  courseName: string
  description?: string
  teachingMaterials?: string
  referenceMaterials?: string
}

export interface UpdateCourse {
  courseName: string
  description?: string
  teachingMaterials?: string
  referenceMaterials?: string
}

export interface CourseAssignment {
  id: number
  courseId: number
  teacherId: number
  teacherName: string
  teacherEmail: string
  assignedAt: string
  assignedBy: number
  assignedByName: string
  course?: Course
}

export interface CreateCourseAssignment {
  courseId: number
  teacherId: number
}

export interface CourseClass {
  id: number
  courseId: number
  className: string
  schedule?: string
  studentList?: string
  createdAt: string
  updatedAt: string
  createdBy: number
  course?: Course
}

export interface CreateCourseClass {
  courseId: number
  className: string
  schedule?: string
  studentList?: string
}

export interface UpdateCourseClass {
  className: string
  schedule?: string
  studentList?: string
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        errorMessage = responseText || errorMessage
      }
      throw new Error(errorMessage)
    }

    try {
      return JSON.parse(responseText)
    } catch (e) {
      throw new Error("Invalid JSON response")
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log("Attempting login with:", credentials)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      console.log("Login response status:", response.status)

      // Get response text first to debug
      const responseText = await response.text()
      console.log("Login response text:", responseText)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON, use the text as error
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Parse the response
      const data = JSON.parse(responseText)
      console.log("Login response data:", data)
      return data
    } catch (error) {
      console.error("Login API error:", error)
      throw error
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Profile API methods
  async getCurrentProfile(): Promise<ApiResponse<TeacherProfile>> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getProfile(username: string): Promise<ApiResponse<TeacherProfile>> {
    const response = await fetch(`${API_BASE_URL}/profile/${username}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getProfileByUserId(userId: number): Promise<ApiResponse<TeacherProfile>> {
    const response = await fetch(`${API_BASE_URL}/profile/user/${userId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<TeacherProfile>> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Dashboard API methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Leave Request API methods
  async createLeaveRequest(leaveRequest: CreateLeaveRequest): Promise<ApiResponse<LeaveRequest>> {
    console.log("Leave request gửi lên:", leaveRequest);
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(leaveRequest),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMyLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/my-requests?size=0`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getPendingLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/pending?size=0`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async approveLeaveRequest(requestId: number, adminNotes?: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${requestId}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ adminNotes }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async rejectLeaveRequest(requestId: number, adminNotes?: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${requestId}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ adminNotes }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async cancelLeaveRequest(requestId: number): Promise<ApiResponse<LeaveRequest>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${requestId}/cancel`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getLeaveTypes(): Promise<ApiResponse<LeaveType[]>> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/leave-types`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Message API methods
  async sendMessage(message: CreateMessage): Promise<ApiResponse<Message>> {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getSentMessages(): Promise<ApiResponse<Message[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/sent?size=0`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getReceivedMessages(): Promise<ApiResponse<Message[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/received?size=0`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getUnreadMessages(): Promise<ApiResponse<Message[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/unread`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async markMessageAsRead(messageId: number): Promise<ApiResponse<Message>> {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMessageById(messageId: number): Promise<ApiResponse<Message>> {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getUnreadMessagesCount(): Promise<ApiResponse<number>> {
    const response = await fetch(`${API_BASE_URL}/messages/stats/unread-count`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/users`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMessageTypes(): Promise<ApiResponse<MessageType[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/message-types`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMessagePriorities(): Promise<ApiResponse<MessagePriority[]>> {
    const response = await fetch(`${API_BASE_URL}/messages/priorities`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    console.log("📥 Raw response:", response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // User Management APIs
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async toggleUserStatus(userId: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Admin Leave Request APIs
  async getAllLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getPendingLeaveRequestsAdmin(): Promise<ApiResponse<LeaveRequest[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests/pending`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async approveLeaveRequestAdmin(requestId: number, adminNote?: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests/${requestId}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ adminNote }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async rejectLeaveRequestAdmin(requestId: number, adminNote?: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests/${requestId}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ adminNote }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getLeaveRequestStats(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getTeacherWeeklySchedule(teacherId: number, weekStart: string): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/teacher/${teacherId}/week?weekStart=${weekStart}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<WorkSchedule[]>(response)
  }

  async getWorkTypes(): Promise<ApiResponse<{ workTypes: WorkType[] }>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/work-types`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<{ workTypes: WorkType[] }>(response)
  }

  async getAttendanceStatuses(): Promise<ApiResponse<{ attendanceStatuses: AttendanceStatus[] }>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/attendance-statuses`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<{ attendanceStatuses: AttendanceStatus[] }>(response)
  }

  async createWorkSchedule(workSchedule: CreateWorkSchedule): Promise<ApiResponse<WorkSchedule>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workSchedule),
    })

    return this.handleResponse<WorkSchedule>(response)
  }

  async updateWorkSchedule(scheduleId: number, workSchedule: CreateWorkSchedule): Promise<ApiResponse<WorkSchedule>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/${scheduleId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workSchedule),
    })

    return this.handleResponse<WorkSchedule>(response)
  }

  async deleteWorkSchedule(scheduleId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/${scheduleId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<void>(response)
  }

  async markAttendance(scheduleId: number, attendance: AttendanceMark): Promise<ApiResponse<WorkSchedule>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/${scheduleId}/attendance`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendance),
    })

    return this.handleResponse<WorkSchedule>(response)
  }

  async getMyWeeklySchedule(weekStart: string): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/my-schedule?weekStart=${weekStart}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<WorkSchedule[]>(response)
  }

  async getAllTeachersWithWorkSummary(): Promise<ApiResponse<TeacherWorkSummary[]>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/teachers`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<TeacherWorkSummary[]>(response)
  }

  async getWorkScheduleById(scheduleId: number): Promise<ApiResponse<WorkSchedule>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/${scheduleId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<WorkSchedule>(response)
  }

  async getWeeklyAttendanceReport(weekStart: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/work-schedules/reports/weekly-attendance?weekStart=${weekStart}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<Course[]>(response)
  }

  async createCourse(courseData: CreateCourse): Promise<ApiResponse<Course>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    return this.handleResponse<Course>(response)
  }

  async updateCourse(courseId: number, courseData: UpdateCourse): Promise<ApiResponse<Course>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    return this.handleResponse<Course>(response)
  }

  async deleteCourse(courseId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<void>(response)
  }

  async getCourseById(courseId: number): Promise<ApiResponse<Course>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<Course>(response)
  }

  // Course Assignment APIs
  async assignTeacherToCourse(assignmentData: CreateCourseAssignment): Promise<ApiResponse<CourseAssignment>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${assignmentData.courseId}/assignments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    })

    return this.handleResponse<CourseAssignment>(response)
  }

  async getCourseAssignments(courseId: number): Promise<ApiResponse<CourseAssignment[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/assignments`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<CourseAssignment[]>(response)
  }

  async removeTeacherFromCourse(assignmentId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/assignments/${assignmentId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<void>(response)
  }

  // Course Class APIs
  async createCourseClass(classData: CreateCourseClass): Promise<ApiResponse<CourseClass>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${classData.courseId}/classes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(classData),
    })

    return this.handleResponse<CourseClass>(response)
  }

  async getCourseClasses(courseId: number): Promise<ApiResponse<CourseClass[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/classes`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<CourseClass[]>(response)
  }

  async updateCourseClass(classId: number, classData: UpdateCourseClass): Promise<ApiResponse<CourseClass>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/classes/${classId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(classData),
    })

    return this.handleResponse<CourseClass>(response)
  }

  async deleteCourseClass(classId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/classes/${classId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<void>(response)
  }

  // Teacher Course APIs
  async getMyAssignedCourses(): Promise<ApiResponse<Course[]>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/my-assignments`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<Course[]>(response)
  }

  async updateMyCourse(courseId: number, courseData: UpdateCourse): Promise<ApiResponse<Course>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    return this.handleResponse<Course>(response)
  }

  async getMyCourseClasses(courseId: number): Promise<ApiResponse<CourseClass[]>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/classes`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<CourseClass[]>(response)
  }

  async createMyCourseClass(classData: CreateCourseClass): Promise<ApiResponse<CourseClass>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${classData.courseId}/classes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(classData),
    })

    return this.handleResponse<CourseClass>(response)
  }

  async updateMyCourseClass(classId: number, classData: UpdateCourseClass): Promise<ApiResponse<CourseClass>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/classes/${classId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(classData),
    })

    return this.handleResponse<CourseClass>(response)
  }

  async deleteMyCourseClass(classId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/classes/${classId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<void>(response)
  }

  // Assistant Dashboard API methods
  async getAssistantDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await fetch(`${API_BASE_URL}/assistant/dashboard/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async testConnection(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    } catch (error) {
      console.error("Connection test failed:", error)
      throw error
    }
  }

  async testTeacherAccess(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/test/teacher`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.text()
  }

  async testAdminAccess(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/test/admin`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.text()
  }
}

export const apiService = new ApiService()
