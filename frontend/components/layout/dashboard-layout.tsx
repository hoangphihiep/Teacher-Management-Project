"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: "TEACHER" | "ADMIN"
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  console.log("DashboardLayout rendered, sidebarOpen:", sidebarOpen)

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-slate-200">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
