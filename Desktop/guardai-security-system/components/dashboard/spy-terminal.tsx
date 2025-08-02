"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Terminal, Zap, Eye, AlertTriangle } from "lucide-react"
import { soundManager } from "@/components/audio/sound-manager"

export function SpyTerminal() {
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [currentCommand, setCurrentCommand] = useState("")

  const spyCommands = [
    "INITIALIZING NEURAL SURVEILLANCE MATRIX...",
    "SCANNING PERIMETER FOR HOSTILE ENTITIES...",
    "BIOMETRIC SENSORS: ONLINE",
    "THREAT ASSESSMENT: ANALYZING PATTERNS...",
    "CLASSIFIED: OPERATION GUARDIAN ACTIVE",
    "ELECTROMAGNETIC SWEEP: COMPLETE",
    "FACIAL RECOGNITION: CROSS-REFERENCING DATABASE",
    "AUDIO SIGNATURE ANALYSIS: IN PROGRESS",
    "MOTION DETECTION: CALIBRATING SENSORS",
    "SECURITY PROTOCOL: DEFCON 3 MAINTAINED",
    "SURVEILLANCE GRID: ALL NODES OPERATIONAL",
    "INTRUSION DETECTION: ARMED AND READY",
  ]

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const randomCommand = spyCommands[Math.floor(Math.random() * spyCommands.length)]
      const timestamp = new Date().toLocaleTimeString()
      const newLine = `[${timestamp}] ${randomCommand}`

      setCurrentCommand(randomCommand)
      setTerminalLines((prev) => [newLine, ...prev.slice(0, 8)])

      // Play subtle system beep
      soundManager.playSystemBeep()
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <Card className="bg-black/95 border-green-500/50 spy-terminal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-400 font-mono neon-text">
            <Terminal className="h-5 w-5 animate-pulse" />
            <span>CLASSIFIED TERMINAL</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600/20 text-green-400 border-green-500/50 animate-pulse font-mono">SECURE</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsActive(!isActive)
                soundManager.playSystemBeep()
              }}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              {isActive ? <Zap className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 h-48 overflow-hidden">
          {/* Current Command Display */}
          <div className="flex items-center space-x-2 p-2 bg-green-900/20 rounded border border-green-500/30">
            <Eye className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-green-400 font-mono text-sm animate-pulse">
              {currentCommand || "SYSTEM STANDBY..."}
            </span>
          </div>

          {/* Terminal Output */}
          <div className="space-y-1 font-mono text-xs">
            {terminalLines.map((line, index) => (
              <div
                key={index}
                className={`text-green-300 transition-opacity duration-1000 ${
                  index === 0 ? "text-green-400 animate-pulse" : ""
                } ${index > 5 ? "opacity-50" : ""}`}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Matrix Rain Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-green-400 text-xs font-mono animate-matrix-rain"
                  style={{
                    left: `${i * 5}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  {Math.random().toString(36).substring(2, 8)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
