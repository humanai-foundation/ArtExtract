"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Eye, Mic, Users, X, Skull, Zap, Shield } from "lucide-react"
import { soundManager } from "@/components/audio/sound-manager"

interface Alert {
  id: string
  type: "vision" | "audio" | "face" | "motion" | "intrusion" | "anomaly"
  message: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  location: string
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    // Simulate real-time alerts with spy-themed messages
    const interval = setInterval(() => {
      const alertTypes = [
        {
          type: "intrusion" as const,
          message: "UNAUTHORIZED BREACH DETECTED - SECTOR 7",
          severity: "critical" as const,
          location: "PERIMETER ALPHA",
        },
        {
          type: "vision" as const,
          message: "SUSPICIOUS INDIVIDUAL - FACIAL SCAN FAILED",
          severity: "high" as const,
          location: "CHECKPOINT BRAVO",
        },
        {
          type: "audio" as const,
          message: "CLASSIFIED CONVERSATION INTERCEPTED",
          severity: "high" as const,
          location: "COMM ROOM",
        },
        {
          type: "anomaly" as const,
          message: "ELECTROMAGNETIC INTERFERENCE DETECTED",
          severity: "medium" as const,
          location: "SERVER VAULT",
        },
        {
          type: "motion" as const,
          message: "MOVEMENT IN RESTRICTED ZONE",
          severity: "medium" as const,
          location: "CLASSIFIED AREA",
        },
        {
          type: "face" as const,
          message: "UNKNOWN BIOMETRIC SIGNATURE",
          severity: "high" as const,
          location: "MAIN ENTRANCE",
        },
      ]

      if (Math.random() > 0.6) {
        // 40% chance of new alert
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
        const newAlert: Alert = {
          id: Date.now().toString(),
          ...randomAlert,
          timestamp: new Date(),
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])

        // Play sound based on severity
        if (newAlert.severity === "critical") {
          soundManager.playHighPriorityAlert()
          setIsBlinking(true)

          // Add screen flash effect
          document.body.classList.add("animate-pulse")
          setTimeout(() => {
            document.body.classList.remove("animate-pulse")
            setIsBlinking(false)
          }, 2000)
        } else if (newAlert.severity === "high") {
          soundManager.playAlertBeep()
        } else {
          soundManager.playSystemBeep()
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "vision":
        return <Eye className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "face":
        return <Users className="h-4 w-4" />
      case "motion":
        return <AlertTriangle className="h-4 w-4" />
      case "intrusion":
        return <Skull className="h-4 w-4" />
      case "anomaly":
        return <Zap className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white animate-pulse"
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
    }
  }

  const dismissAlert = (id: string) => {
    soundManager.playSystemBeep()
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <Card className={`bg-black/90 border-red-500/30 ${isBlinking ? "animate-pulse border-red-500" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-red-400 font-mono">
            <Shield className="h-5 w-5 animate-pulse" />
            <span>THREAT MONITOR</span>
          </CardTitle>
          <Badge variant="outline" className="border-red-500/50 text-red-400 font-mono">
            {alerts.length} ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {alerts.length === 0 ? (
            <div className="text-center text-green-400 py-8">
              <Shield className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="font-mono">ALL SYSTEMS SECURE</p>
              <p className="text-sm font-mono opacity-70">NO THREATS DETECTED</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-red-900/20 border-red-500/50"
                      : alert.severity === "high"
                        ? "bg-red-900/10 border-red-500/30"
                        : "bg-slate-900/50 border-slate-500/30"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5 text-red-400">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={`text-xs font-mono ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-red-300 font-mono">{alert.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-red-400/70 font-mono">{alert.location}</p>
                      <p className="text-xs text-red-400/70 font-mono">{alert.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
