import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function LeaveRequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
