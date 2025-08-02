"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radar, Target, Crosshair, AlertTriangle } from "lucide-react"
import { soundManager } from "@/components/audio/sound-manager"

interface ThreatBlip {
  id: string
  x: number
  y: number
  type: "hostile" | "unknown" | "friendly"
  distance: number
  bearing: number
}

export function ThreatRadar() {
  const [threats, setThreats] = useState<ThreatBlip[]>([])
  const [isScanning, setIsScanning] = useState(true)
  const [sweepAngle, setSweepAngle] = useState(0)
  const [alertLevel, setAlertLevel] = useState<"green" | "yellow" | "red">("green")

  useEffect(() => {
    if (!isScanning) return

    const sweepInterval = setInterval(() => {
      setSweepAngle((prev) => (prev + 2) % 360)
    }, 50)

    const threatInterval = setInterval(() => {
      // Generate random threats
      if (Math.random() > 0.7) {
        const newThreat: ThreatBlip = {
          id: Date.now().toString(),
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          type: Math.random() > 0.7 ? "hostile" : Math.random() > 0.5 ? "unknown" : "friendly",
          distance: Math.random() * 100,
          bearing: Math.random() * 360,
        }

        setThreats((prev) => [newThreat, ...prev.slice(0, 8)])

        // Set alert level and play sounds based on threat type
        if (newThreat.type === "hostile") {
          setAlertLevel("red")
          soundManager.playHighPriorityAlert()
        } else if (newThreat.type === "unknown") {
          setAlertLevel("yellow")
          soundManager.playAlertBeep()
        } else {
          soundManager.playSystemBeep()
        }

        // Reset alert level after some time
        setTimeout(() => setAlertLevel("green"), 5000)
      }
    }, 4000)

    return () => {
      clearInterval(sweepInterval)
      clearInterval(threatInterval)
    }
  }, [isScanning])

  const getThreatColor = (type: ThreatBlip["type"]) => {
    switch (type) {
      case "hostile":
        return "text-red-400"
      case "unknown":
        return "text-yellow-400"
      case "friendly":
        return "text-green-400"
    }
  }

  const getAlertColor = () => {
    switch (alertLevel) {
      case "red":
        return "border-red-500/50 bg-red-900/20"
      case "yellow":
        return "border-yellow-500/50 bg-yellow-900/20"
      case "green":
        return "border-green-500/50 bg-green-900/20"
    }
  }

  return (
    <Card className={`bg-black/95 ${getAlertColor()} transition-all duration-500`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-400 font-mono neon-text">
            <Radar className="h-5 w-5 animate-spin" />
            <span>THREAT RADAR</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              className={`font-mono animate-pulse ${
                alertLevel === "red"
                  ? "bg-red-600 text-white"
                  : alertLevel === "yellow"
                    ? "bg-yellow-600 text-black"
                    : "bg-green-600 text-white"
              }`}
            >
              {alertLevel.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsScanning(!isScanning)
                soundManager.playSystemBeep()
              }}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              {isScanning ? <Target className="h-4 w-4 animate-pulse" /> : <AlertTriangle className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Radar Display */}
          <div className="relative w-64 h-64 mx-auto bg-black/80 rounded-full border-2 border-green-500/30 overflow-hidden">
            {/* Radar Grid */}
            <div className="absolute inset-0">
              {/* Concentric circles */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute border border-green-500/20 rounded-full"
                  style={{
                    width: `${i * 25}%`,
                    height: `${i * 25}%`,
                    top: `${50 - i * 12.5}%`,
                    left: `${50 - i * 12.5}%`,
                  }}
                />
              ))}

              {/* Cross lines */}
              <div className="absolute w-full h-0.5 bg-green-500/20 top-1/2 transform -translate-y-1/2" />
              <div className="absolute h-full w-0.5 bg-green-500/20 left-1/2 transform -translate-x-1/2" />
            </div>

            {/* Radar Sweep */}
            {isScanning && (
              <div
                className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left transform -translate-y-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${sweepAngle}deg)`,
                  transformOrigin: "0 50%",
                }}
              />
            )}

            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />

            {/* Threat Blips */}
            {threats.map((threat, index) => (
              <div
                key={threat.id}
                className={`absolute w-2 h-2 rounded-full animate-pulse ${getThreatColor(threat.type)}`}
                style={{
                  left: `${50 + threat.x / 4}%`,
                  top: `${50 + threat.y / 4}%`,
                  backgroundColor:
                    threat.type === "hostile" ? "#ef4444" : threat.type === "unknown" ? "#eab308" : "#22c55e",
                  opacity: Math.max(0.3, 1 - index * 0.1),
                }}
              />
            ))}
          </div>

          {/* Threat List */}
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {threats.slice(0, 5).map((threat, index) => (
              <div
                key={threat.id}
                className="flex items-center justify-between text-xs font-mono p-2 bg-slate-900/50 rounded border border-slate-500/30"
              >
                <div className="flex items-center space-x-2">
                  <Crosshair className={`h-3 w-3 ${getThreatColor(threat.type)}`} />
                  <span className={getThreatColor(threat.type)}>{threat.type.toUpperCase()}</span>
                </div>
                <div className="text-slate-400">
                  {threat.distance.toFixed(0)}m • {threat.bearing.toFixed(0)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
