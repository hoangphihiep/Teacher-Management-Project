"use client"

import type React from "react"

import { AssistantSidebar } from "@/components/layout/assistant-sidebar"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="ASSISTANT">
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex">
          <AssistantSidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-white" />
          <main className="flex-1 ml-64 p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
