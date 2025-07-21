"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  })
  const [error, setError] = useState("")

  const { login, isLoading } = useAuth()

  console.log("LoginForm rendered, formData:", formData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submitted with:", formData)

    setError("")

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    try {
      await login({
        username: formData.username,
        password: formData.password,
      })
    } catch (error) {
      console.error("Login failed:", error)
      setError("Tên đăng nhập hoặc mật khẩu không đúng")
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Form field ${field} changed to:`, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-50 via-white to-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-royal-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Đăng nhập hệ thống</CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Quản lý giáo viên - Hệ thống giáo dục thông minh
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="h-11"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-11 pr-10"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => handleInputChange("remember", !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm text-slate-700 cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Button
                variant="link"
                className="px-0 text-royal-600 hover:text-royal-700"
                type="button"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-royal-500 hover:bg-royal-600 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center text-sm text-slate-600">
              <div className="mb-2">Tài khoản demo:</div>
              <div className="space-y-1 text-xs">
                <div>
                  <strong>Admin:</strong> admin / password123
                </div>
                <div>
                  <strong>Giáo viên:</strong> teacher1 / password123
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-slate-600 mt-4">
              Cần hỗ trợ?{" "}
              <Button variant="link" className="px-0 text-royal-600 hover:text-royal-700">
                Liên hệ IT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
