"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiService, type LoginRequest } from "@/lib/api"

interface User {
  username: string
  fullName: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isTeacher: boolean
  isAssistant?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await apiService.login(credentials)

      if (response.success && response.data) {
        const { token, username, fullName, email, role } = response.data

        // Store token and user data
        localStorage.setItem("token", token)
        const userData = { username, fullName, email, role }
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)

        // Debug log để kiểm tra role
        console.log("Login successful, user role:", role)
        console.log("User data:", userData)

        // Force redirect với window.location thay vì router.push
        if (role === "ADMIN") {
          console.log("Redirecting to admin dashboard...")
          window.location.href = "/admin/dashboard"
        } else if (role === "ASSISTANT") {
          console.log("Redirecting to teacher dashboard...")
          window.location.href = "/assistant/dashboard"
        }
        else {
          console.log("Redirecting to teacher dashboard...")
          window.location.href = "/dashboard"
        }

        return { success: true, message: "Đăng nhập thành công" }
      } else {
        return { success: false, message: response.message || "Đăng nhập thất bại" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isTeacher: user?.role === "TEACHER",
    isAssistant: user?.role === "ASSISTANT",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
