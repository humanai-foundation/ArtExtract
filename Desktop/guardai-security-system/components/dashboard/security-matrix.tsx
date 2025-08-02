"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Shield, Eye, Mic, Zap, Lock, Unlock, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react"
import { soundManager } from "@/components/audio/sound-manager"

interface SecurityNode {
  id: string
  name: string
  type: "camera" | "audio" | "motion" | "access"
  status: "online" | "offline" | "alert" | "maintenance"
  location: string
  lastPing: Date
}

export function SecurityMatrix() {
  const [nodes, setNodes] = useState<SecurityNode[]>([])
  const [lockdownMode, setLockdownMode] = useState(false)
  const [autoResponse, setAutoResponse] = useState(true)
  const [isMatrixActive, setIsMatrixActive] = useState(true)

  useEffect(() => {
    // Initialize security nodes
    const initialNodes: SecurityNode[] = [
      {
        id: "CAM-01",
        name: "Main Entrance",
        type: "camera",
        status: "online",
        location: "Sector A",
        lastPing: new Date(),
      },
      {
        id: "CAM-02",
        name: "Parking Lot",
        type: "camera",
        status: "online",
        location: "Sector B",
        lastPing: new Date(),
      },
      {
        id: "AUD-01",
        name: "Reception Audio",
        type: "audio",
        status: "online",
        location: "Sector A",
        lastPing: new Date(),
      },
      {
        id: "MOT-01",
        name: "Corridor Motion",
        type: "motion",
        status: "alert",
        location: "Sector C",
        lastPing: new Date(),
      },
      {
        id: "ACC-01",
        name: "Server Room",
        type: "access",
        status: "online",
        location: "Sector D",
        lastPing: new Date(),
      },
      {
        id: "CAM-03",
        name: "Emergency Exit",
        type: "camera",
        status: "maintenance",
        location: "Sector E",
        lastPing: new Date(),
      },
    ]
    setNodes(initialNodes)
  }, [])

  useEffect(() => {
    if (!isMatrixActive) return

    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => {
          const random = Math.random()
          let newStatus = node.status

          // Simulate status changes
          if (random > 0.95) {
            newStatus = "alert"
            soundManager.playAlertBeep()
          } else if (random > 0.9) {
            newStatus = "offline"
            soundManager.playSystemBeep()
          } else if (random > 0.85 && node.status !== "online") {
            newStatus = "online"
          }

          return {
            ...node,
            status: newStatus,
            lastPing: new Date(),
          }
        }),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isMatrixActive])

  const getNodeIcon = (type: SecurityNode["type"]) => {
    switch (type) {
      case "camera":
        return <Eye className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "motion":
        return <Activity className="h-4 w-4" />
      case "access":
        return <Lock className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: SecurityNode["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-400 animate-pulse" />
      case "maintenance":
        return <Zap className="h-4 w-4 text-blue-400" />
    }
  }

  const getStatusColor = (status: SecurityNode["status"]) => {
    switch (status) {
      case "online":
        return "border-green-500/30 bg-green-900/10"
      case "offline":
        return "border-red-500/30 bg-red-900/10"
      case "alert":
        return "border-yellow-500/30 bg-yellow-900/10 animate-pulse"
      case "maintenance":
        return "border-blue-500/30 bg-blue-900/10"
    }
  }

  const handleLockdown = () => {
    setLockdownMode(!lockdownMode)
    if (!lockdownMode) {
      soundManager.playHighPriorityAlert()
      setNodes((prev) => prev.map((node) => ({ ...node, status: "alert" })))
    } else {
      soundManager.playAccessGranted()
      setNodes((prev) => prev.map((node) => ({ ...node, status: "online" })))
    }
  }

  const onlineNodes = nodes.filter((n) => n.status === "online").length
  const alertNodes = nodes.filter((n) => n.status === "alert").length
  const offlineNodes = nodes.filter((n) => n.status === "offline").length

  return (
    <Card className="bg-black/95 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-blue-400 font-mono neon-text">
            <Shield className="h-5 w-5 animate-pulse" />
            <span>SECURITY MATRIX</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600/20 text-green-400 border-green-500/50 font-mono">
              {onlineNodes}/{nodes.length} ONLINE
            </Badge>
            {alertNodes > 0 && (
              <Badge className="bg-red-600/20 text-red-400 border-red-500/50 font-mono animate-pulse">
                {alertNodes} ALERTS
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Panel */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between">
            <Label htmlFor="lockdown" className="text-red-400 font-mono">
              LOCKDOWN MODE
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="lockdown"
                checked={lockdownMode}
                onCheckedChange={handleLockdown}
                className="data-[state=checked]:bg-red-600"
              />
              {lockdownMode ? (
                <Lock className="h-4 w-4 text-red-400 animate-pulse" />
              ) : (
                <Unlock className="h-4 w-4 text-green-400" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-response" className="text-blue-400 font-mono">
              AUTO RESPONSE
            </Label>
            <Switch
              id="auto-response"
              checked={autoResponse}
              onCheckedChange={(checked) => {
                setAutoResponse(checked)
                soundManager.playSystemBeep()
              }}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>

        {/* Security Nodes Grid */}
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${getStatusColor(node.status)}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getNodeIcon(node.type)}
                  {getStatusIcon(node.status)}
                </div>
                <div>
                  <div className="font-mono text-sm font-medium text-white">
                    {node.id} • {node.name}
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    {node.location} • Last: {node.lastPing.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <Badge
                className={`font-mono text-xs ${
                  node.status === "online"
                    ? "bg-green-600 text-white"
                    : node.status === "alert"
                      ? "bg-yellow-600 text-black animate-pulse"
                      : node.status === "offline"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                }`}
              >
                {node.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        {/* Emergency Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setNodes((prev) => prev.map((node) => ({ ...node, status: "online" })))
              soundManager.playAccessGranted()
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-mono"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            ALL SYSTEMS GO
          </Button>

          <Button
            onClick={() => {
              setIsMatrixActive(!isMatrixActive)
              soundManager.playSystemBeep()
            }}
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-mono"
            size="sm"
          >
            {isMatrixActive ? "PAUSE" : "RESUME"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
