import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Mic,
  Video,
  Brain,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { SpeechAnalysisResponse, SpeechAnalysisProgress } from "@shared/api";

interface SpeechAnalysisProps {
  onBack?: () => void;
}

const SpeechAnalysis = ({ onBack }: SpeechAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<SpeechAnalysisProgress | null>(null);
  const [result, setResult] = useState<SpeechAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((file) => file.type.startsWith("video/"));

    if (videoFile) {
      handleFileUpload(videoFile);
    } else {
      setError("Please upload a video file (MP4, MOV, AVI, etc.)");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("video", file);

    // Simulate progress updates
    const progressStages: SpeechAnalysisProgress[] = [
      { stage: "uploading", progress: 10, message: "Uploading video..." },
      {
        stage: "transcribing",
        progress: 30,
        message: "Transcribing speech...",
      },
      {
        stage: "analyzing_speech",
        progress: 50,
        message: "Analyzing speech patterns...",
      },
      {
        stage: "analyzing_body",
        progress: 70,
        message: "Analyzing body language...",
      },
      {
        stage: "generating_feedback",
        progress: 90,
        message: "Generating AI feedback...",
      },
      { stage: "completed", progress: 100, message: "Analysis complete!" },
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setProgress(progressStages[currentStage]);
        currentStage++;
      } else {
        clearInterval(progressInterval);
      }
    }, 1000);

    try {
      const response = await fetch("/api/speech-analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysisResult: SpeechAnalysisResponse = await response.json();
      setResult(analysisResult);
      clearInterval(progressInterval);
      setProgress({
        stage: "completed",
        progress: 100,
        message: "Analysis complete!",
      });
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Speech & Gesture Analysis
            </h2>
            <p className="text-gray-600">
              Upload a video to get detailed feedback on your presentation
              skills
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Upload Area */}
      {!result && !isAnalyzing && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
          <CardContent className="p-8">
            <div
              className={`text-center space-y-4 ${
                dragActive ? "bg-purple-50 border-purple-300" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Your Presentation Video
                </h3>
                <p className="text-gray-600 mb-4">
                  Drop your video file here or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Video File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-500">
                Supported formats: MP4, MOV, AVI, WebM (Max size: 100MB)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Display */}
      {isAnalyzing && progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Analyzing Your Presentation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress.progress} className="w-full" />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="w-4 h-4" />
              <span>{progress.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setProgress(null);
              }}
              className="mt-3"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Success Header */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Analysis Complete!</span>
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <span>Speech Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(result.speechScore)}`}
                  >
                    {result.speechScore}
                  </div>
                  <div className="text-gray-600 mb-3">out of 100</div>
                  <Badge className={getScoreBadgeColor(result.speechScore)}>
                    {result.speechScore >= 80
                      ? "Excellent"
                      : result.speechScore >= 60
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-pink-600" />
                  <span>Body Language</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(result.bodyLanguageScore)}`}
                  >
                    {result.bodyLanguageScore}
                  </div>
                  <div className="text-gray-600 mb-3">out of 100</div>
                  <Badge
                    className={getScoreBadgeColor(result.bodyLanguageScore)}
                  >
                    {result.bodyLanguageScore >= 80
                      ? "Excellent"
                      : result.bodyLanguageScore >= 60
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Transcript</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                {result.transcript}
              </div>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>AI Feedback & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {result.feedback}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setResult(null);
                setProgress(null);
                setError(null);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Analyze Another Video
            </Button>
            {result.reportUrl && (
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechAnalysis;
