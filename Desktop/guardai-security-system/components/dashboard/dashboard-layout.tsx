"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Shield, Settings, LogOut, User, Bell, Zap, Eye, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { soundManager } from "@/components/audio/sound-manager"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<"online" | "scanning" | "alert">("scanning")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("guardai_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Simulate system status changes
    const statusInterval = setInterval(() => {
      const statuses = ["online", "scanning", "alert"] as const
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      setSystemStatus(randomStatus)

      if (randomStatus === "alert") {
        soundManager.playSystemBeep()
      }
    }, 8000)

    return () => clearInterval(statusInterval)
  }, [])

  const handleLogout = () => {
    soundManager.playSystemBeep()
    localStorage.removeItem("guardai_token")
    localStorage.removeItem("guardai_user")
    toast({
      title: "System Logout",
      description: "Secure session terminated",
    })
    router.push("/")
  }

  const getStatusColor = () => {
    switch (systemStatus) {
      case "online":
        return "bg-green-500"
      case "scanning":
        return "bg-blue-500 animate-pulse"
      case "alert":
        return "bg-red-500 animate-pulse"
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fillRule='evenodd'%3e%3cg fill='%23059669' fillOpacity='0.05'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
              backgroundSize: "60px 60px",
            }}
            className="animate-pulse"
          ></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/90 border-b border-green-500/30 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor()} rounded-full`}></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-400 font-mono">GUARD.AI</h1>
              <p className="text-sm text-green-300/70 font-mono">CLASSIFIED SYSTEM</p>
            </div>
            <Badge variant="outline" className="border-green-500/50 text-green-400 font-mono">
              STATUS: {systemStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            {/* System Indicators */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-mono">VISION</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-xs text-yellow-400 font-mono">SECURE</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => soundManager.playSystemBeep()}
            >
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-green-500/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                    <AvatarFallback className="bg-green-600 text-white">{user?.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/95 border-green-500/30" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-green-400 font-mono">{user?.name}</p>
                    <p className="text-xs leading-none text-green-300/70 font-mono">{user?.email}</p>
                    <Badge variant="outline" className="w-fit text-xs border-green-500/50 text-green-400">
                      CLEARANCE: {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-500/30" />
                <DropdownMenuItem className="text-green-300 hover:text-green-400 hover:bg-green-500/10">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-mono">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-green-300 hover:text-green-400 hover:bg-green-500/10">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="font-mono">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-green-500/30" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-mono">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">{children}</main>
    </div>
  )
}

export { DashboardLayout }
