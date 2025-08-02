"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Play, Square, AlertTriangle, Crosshair, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { soundManager } from "@/components/audio/sound-manager"

export function WebcamPanel() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [detections, setDetections] = useState<string[]>([])
  const [threatLevel, setThreatLevel] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate AI detections with spy-themed messages
    const interval = setInterval(() => {
      if (isStreaming) {
        const spyDetections = [
          "HOSTILE OPERATIVE IDENTIFIED",
          "UNAUTHORIZED SURVEILLANCE DEVICE",
          "SUSPICIOUS PACKAGE DETECTED",
          "FACIAL RECOGNITION: UNKNOWN SUBJECT",
          "MOVEMENT PATTERN ANOMALY",
          "POTENTIAL SECURITY BREACH",
          "CLASSIFIED DOCUMENT SPOTTED",
          "ELECTROMAGNETIC SIGNATURE DETECTED",
          "BIOMETRIC SCAN: ACCESS DENIED",
          "THREAT ASSESSMENT: ELEVATED",
        ]

        const randomDetection = spyDetections[Math.floor(Math.random() * spyDetections.length)]
        const newThreatLevel = Math.floor(Math.random() * 100)

        setDetections((prev) => [randomDetection, ...prev.slice(0, 4)])
        setThreatLevel(newThreatLevel)

        // Play sound based on threat level
        if (newThreatLevel > 80) {
          soundManager.playHighPriorityAlert()
          // Add screen flash effect
          document.body.style.backgroundColor = "rgba(239, 68, 68, 0.1)"
          setTimeout(() => {
            document.body.style.backgroundColor = ""
          }, 200)
        } else if (newThreatLevel > 50) {
          soundManager.playAlertBeep()
        } else {
          soundManager.playSystemBeep()
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        setHasPermission(true)
        soundManager.playAccessGranted()
        toast({
          title: "SURVEILLANCE ACTIVATED",
          description: "Visual monitoring system online",
        })
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      soundManager.playAccessDenied()
      toast({
        title: "CAMERA ACCESS DENIED",
        description: "Unable to initialize surveillance system",
        variant: "destructive",
      })
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setDetections([])
    setThreatLevel(0)
    soundManager.playSystemBeep()
    toast({
      title: "SURVEILLANCE DEACTIVATED",
      description: "Visual monitoring system offline",
    })
  }

  const getThreatColor = () => {
    if (threatLevel > 80) return "text-red-400 animate-pulse"
    if (threatLevel > 50) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <Card className="bg-black/90 border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-400 font-mono">
            <Camera className="h-5 w-5" />
            <span>SURVEILLANCE MATRIX</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <>
                <Badge variant="destructive" className="animate-pulse font-mono">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                  RECORDING
                </Badge>
                <Badge className={`font-mono ${getThreatColor()}`}>THREAT: {threatLevel}%</Badge>
              </>
            )}
            <Button
              onClick={isStreaming ? stopWebcam : startWebcam}
              variant={isStreaming ? "destructive" : "default"}
              size="sm"
              className="font-mono"
            >
              {isStreaming ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  TERMINATE
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  ACTIVATE
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-green-500/30">
            {isStreaming ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                {/* Spy-themed overlay elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-green-400"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-green-400"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-green-400"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-green-400"></div>

                  {/* Crosshair */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Crosshair className="h-8 w-8 text-red-400 animate-pulse" />
                  </div>

                  {/* Scanning line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400 animate-pulse"></div>

                  {/* Scanning grid overlay */}
                  <div className="absolute inset-0 surveillance-grid opacity-20"></div>

                  {/* Threat level indicator */}
                  {threatLevel > 70 && (
                    <div className="absolute top-4 right-4 animate-pulse">
                      <div className="bg-red-600/90 text-white px-3 py-1 rounded font-mono text-sm border border-red-400">
                        ⚠️ HIGH THREAT DETECTED
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-green-400">
                  <CameraOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-mono">SURVEILLANCE OFFLINE</p>
                  <p className="text-sm font-mono opacity-70">CLICK ACTIVATE TO BEGIN MONITORING</p>
                </div>
              </div>
            )}

            {/* AI Detection Overlay */}
            {isStreaming && detections.length > 0 && (
              <div className="absolute top-4 left-4 space-y-2 max-w-xs">
                {detections.slice(0, 3).map((detection, index) => (
                  <Badge
                    key={index}
                    className={`bg-red-600/90 text-white font-mono text-xs ${index === 0 ? "animate-pulse" : ""}`}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {detection}
                  </Badge>
                ))}
              </div>
            )}

            {/* System info overlay */}
            {isStreaming && (
              <div className="absolute bottom-4 right-4 text-right">
                <div className="text-xs text-green-400 font-mono space-y-1">
                  <div>REC • {new Date().toLocaleTimeString()}</div>
                  <div>CAM-01 • SECTOR-A</div>
                  <div className="flex items-center justify-end space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>NEURAL NET ACTIVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detection History */}
          {detections.length > 0 && (
            <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
              <h4 className="text-sm font-medium text-red-400 font-mono">RECENT THREAT ANALYSIS</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {detections.map((detection, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-red-300 font-mono">{detection}</span>
                    <span className="text-red-400/70 font-mono">{new Date().toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
