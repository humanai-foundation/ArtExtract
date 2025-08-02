"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye, Mic, Users, Activity } from "lucide-react"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("guardai_token")
    if (token) {
      setIsAuthenticated(true)
      router.push("/dashboard")
    }
  }, [router])

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-white space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-600 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">GuardAI</h1>
          </div>

          <h2 className="text-3xl font-bold leading-tight">AI-Powered Security Monitoring System</h2>

          <p className="text-xl text-slate-300">
            Advanced real-time surveillance with computer vision, sound anomaly detection, and intelligent threat
            assessment.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Card className="bg-black/80 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <Eye className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-green-400">Vision AI</h3>
                  <p className="text-sm text-green-300/70">Real-time object detection</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <Mic className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-green-400">Audio AI</h3>
                  <p className="text-sm text-green-300/70">Sound anomaly detection</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-green-400">Face Recognition</h3>
                  <p className="text-sm text-green-300/70">Access control system</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <Activity className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-green-400">Live Alerts</h3>
                  <p className="text-sm text-green-300/70">Real-time notifications</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Auth Section */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{isLogin ? "Welcome Back" : "Create Account"}</h3>
                <p className="text-slate-600 mt-2">
                  {isLogin ? "Sign in to access your security dashboard" : "Join GuardAI to start monitoring"}
                </p>
              </div>

              {isLogin ? (
                <LoginForm
                  onSuccess={() => {
                    setIsAuthenticated(true)
                    router.push("/dashboard")
                  }}
                />
              ) : (
                <SignupForm
                  onSuccess={() => {
                    setIsAuthenticated(true)
                    router.push("/dashboard")
                  }}
                />
              )}

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
