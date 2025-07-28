"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "TEACHER" | "ADMIN"| "ASSISTANT"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/")
        return
      }

      // Role-based access control
      if (user?.role) {
        const currentPath = window.location.pathname

        // Admin can access everything
        if (user.role === "ADMIN") {
          return
        }

        // Assistant can only access assistant and general areas
        if (user.role === "ASSISTANT") {
          if (currentPath.startsWith("/admin")) {
            console.log("Assistant trying to access admin area, redirecting...")
            window.location.href = "/assistant/dashboard"
            return
          }
          if (requiredRole && requiredRole !== "ASSISTANT" && requiredRole !== "TEACHER") {
            window.location.href = "/assistant/dashboard"
            return
          }
        }

        // Teacher can only access teacher and general areas
        if (user.role === "TEACHER") {
          if (currentPath.startsWith("/admin") || currentPath.startsWith("/assistant")) {
            console.log("Teacher trying to access restricted area, redirecting...")
            window.location.href = "/dashboard"
            return
          }
          if (requiredRole && requiredRole !== "TEACHER") {
            window.location.href = "/dashboard"
            return
          }
        }

        // Check specific required role
        if (requiredRole && user.role !== requiredRole && user.role !== "ADMIN") {
          if (user.role === "ASSISTANT") {
            window.location.href = "/assistant/dashboard"
          } else {
            window.location.href = "/dashboard"
          }
          return
        }
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Không có quyền truy cập</h1>
          <p className="text-gray-600 mt-2">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
