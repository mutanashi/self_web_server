import type React from "react"
import { UserDashboardLayout } from "@/components/user-dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>
}
