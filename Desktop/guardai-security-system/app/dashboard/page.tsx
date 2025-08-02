"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { WebcamPanel } from "@/components/dashboard/webcam-panel"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { AIControls } from "@/components/dashboard/ai-controls"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SpyTerminal } from "@/components/dashboard/spy-terminal"
import { ThreatRadar } from "@/components/dashboard/threat-radar"
import { SecurityMatrix } from "@/components/dashboard/security-matrix"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("guardai_token")
    if (!token) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitor your premises with AI-powered surveillance</p>
        </div>

        <StatsCards />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WebcamPanel />
            <ActivityLog />
          </div>

          <div className="space-y-6">
            <AIControls />
            <AlertsPanel />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <SpyTerminal />
          <ThreatRadar />
          <SecurityMatrix />
        </div>
      </div>
    </DashboardLayout>
  )
}
