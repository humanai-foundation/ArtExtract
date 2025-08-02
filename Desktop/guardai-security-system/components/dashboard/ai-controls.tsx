"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Mic, Users, Brain, Settings, RefreshCw, Zap, Shield, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { soundManager } from "@/components/audio/sound-manager"

export function AIControls() {
  const [visionEnabled, setVisionEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(true)
  const [intrusionDetection, setIntrusionDetection] = useState(true)
  const [sensitivity, setSensitivity] = useState([85])
  const [threatLevel, setThreatLevel] = useState([60])
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean, name: string) => {
    setter(!currentValue)
    soundManager.playSystemBeep()
    toast({
      title: `${name} ${!currentValue ? "ACTIVATED" : "DEACTIVATED"}`,
      description: `System module ${!currentValue ? "online" : "offline"}`,
    })
  }

  const handleCalibration = () => {
    setIsCalibrating(true)
    soundManager.playSystemBeep()
    setTimeout(() => {
      setIsCalibrating(false)
      soundManager.playAccessGranted()
      toast({
        title: "CALIBRATION COMPLETE",
        description: "All AI modules optimized for maximum threat detection",
      })
    }, 3000)
  }

  const handleDeepScan = () => {
    setIsScanning(true)
    soundManager.playAlertBeep()
    setTimeout(() => {
      setIsScanning(false)
      soundManager.playAccessGranted()
      toast({
        title: "DEEP SCAN COMPLETE",
        description: "No anomalies detected in surveillance grid",
      })
    }, 5000)
  }

  return (
    <Card className="bg-black/90 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-400 font-mono">
          <Brain className="h-5 w-5 animate-pulse" />
          <span>AI COMMAND CENTER</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Module Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Eye className={`h-4 w-4 ${visionEnabled ? "text-green-400 animate-pulse" : "text-gray-500"}`} />
              <Label htmlFor="vision-ai" className="text-green-400 font-mono">
                VISION MATRIX
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="vision-ai"
                checked={visionEnabled}
                onCheckedChange={() => handleToggle(setVisionEnabled, visionEnabled, "VISION MATRIX")}
                className="data-[state=checked]:bg-green-600"
              />
              <Badge
                variant={visionEnabled ? "default" : "secondary"}
                className={`font-mono ${visionEnabled ? "bg-green-600 text-white" : "bg-gray-600"}`}
              >
                {visionEnabled ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Mic className={`h-4 w-4 ${audioEnabled ? "text-green-400 animate-pulse" : "text-gray-500"}`} />
              <Label htmlFor="audio-ai" className="text-green-400 font-mono">
                AUDIO SCANNER
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="audio-ai"
                checked={audioEnabled}
                onCheckedChange={() => handleToggle(setAudioEnabled, audioEnabled, "AUDIO SCANNER")}
                className="data-[state=checked]:bg-green-600"
              />
              <Badge
                variant={audioEnabled ? "default" : "secondary"}
                className={`font-mono ${audioEnabled ? "bg-green-600 text-white" : "bg-gray-600"}`}
              >
                {audioEnabled ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Users
                className={`h-4 w-4 ${faceRecognitionEnabled ? "text-green-400 animate-pulse" : "text-gray-500"}`}
              />
              <Label htmlFor="face-recognition" className="text-green-400 font-mono">
                BIOMETRIC ID
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="face-recognition"
                checked={faceRecognitionEnabled}
                onCheckedChange={() => handleToggle(setFaceRecognitionEnabled, faceRecognitionEnabled, "BIOMETRIC ID")}
                className="data-[state=checked]:bg-green-600"
              />
              <Badge
                variant={faceRecognitionEnabled ? "default" : "secondary"}
                className={`font-mono ${faceRecognitionEnabled ? "bg-green-600 text-white" : "bg-gray-600"}`}
              >
                {faceRecognitionEnabled ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
            <div className="flex items-center space-x-3">
              <Shield className={`h-4 w-4 ${intrusionDetection ? "text-red-400 animate-pulse" : "text-gray-500"}`} />
              <Label htmlFor="intrusion-detection" className="text-red-400 font-mono">
                INTRUSION ALERT
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="intrusion-detection"
                checked={intrusionDetection}
                onCheckedChange={() => handleToggle(setIntrusionDetection, intrusionDetection, "INTRUSION ALERT")}
                className="data-[state=checked]:bg-red-600"
              />
              <Badge
                variant={intrusionDetection ? "destructive" : "secondary"}
                className={`font-mono ${intrusionDetection ? "bg-red-600 text-white animate-pulse" : "bg-gray-600"}`}
              >
                {intrusionDetection ? "ARMED" : "DISARMED"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Sensitivity Controls */}
        <div className="space-y-4">
          <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-yellow-500/20">
            <Label className="text-yellow-400 font-mono">DETECTION SENSITIVITY</Label>
            <div className="px-3">
              <Slider
                value={sensitivity}
                onValueChange={setSensitivity}
                max={100}
                min={0}
                step={5}
                className="w-full"
                onValueCommit={() => soundManager.playSystemBeep()}
              />
              <div className="flex justify-between text-xs text-yellow-400/70 mt-1 font-mono">
                <span>MINIMAL</span>
                <span className="text-yellow-400 font-bold">{sensitivity[0]}%</span>
                <span>MAXIMUM</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
            <Label className="text-red-400 font-mono">THREAT ASSESSMENT</Label>
            <div className="px-3">
              <Slider
                value={threatLevel}
                onValueChange={setThreatLevel}
                max={100}
                min={0}
                step={10}
                className="w-full"
                onValueCommit={() => soundManager.playSystemBeep()}
              />
              <div className="flex justify-between text-xs text-red-400/70 mt-1 font-mono">
                <span>LOW</span>
                <span className="text-red-400 font-bold">LEVEL {Math.floor(threatLevel[0] / 10)}</span>
                <span>CRITICAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Status */}
        <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-green-500/20">
          <Label className="text-green-400 font-mono">NEURAL NETWORK STATUS</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-300 font-mono">YOLO-v8 CORE</span>
              <Badge className="bg-green-600 text-white font-mono animate-pulse">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-300 font-mono">AUDIO NEURAL NET</span>
              <Badge className="bg-green-600 text-white font-mono animate-pulse">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-300 font-mono">FACIAL RECOGNITION</span>
              <Badge className="bg-green-600 text-white font-mono animate-pulse">ACTIVE</Badge>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleCalibration}
            disabled={isCalibrating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono"
            variant="default"
          >
            {isCalibrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                CALIBRATING SYSTEMS...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                RECALIBRATE MATRIX
              </>
            )}
          </Button>

          <Button
            onClick={handleDeepScan}
            disabled={isScanning}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-mono"
            variant="default"
          >
            {isScanning ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                DEEP SCANNING...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                INITIATE DEEP SCAN
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono bg-transparent"
            onClick={() => soundManager.playSystemBeep()}
          >
            <Settings className="h-4 w-4 mr-2" />
            ADVANCED CONFIG
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
