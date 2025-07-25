import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Clock,
  Globe,
  List,
} from "lucide-react";
import { YouTubeConverterResponse } from "@shared/api";

interface YouTubeConverterProps {
  onBack?: () => void;
}

const YouTubeConverter = ({ onBack }: YouTubeConverterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<YouTubeConverterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [progress, setProgress] = useState(0);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  };

  const simulateProgress = () => {
    const stages = [
      { progress: 10, delay: 500 },
      { progress: 30, delay: 1000 },
      { progress: 60, delay: 1500 },
      { progress: 80, delay: 1000 },
      { progress: 95, delay: 500 },
      { progress: 100, delay: 200 },
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress);
        currentStage++;
      } else {
        clearInterval(progressInterval);
      }
    }, stages[0]?.delay || 500);

    return progressInterval;
  };

  const handleConvert = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await fetch("/api/youtube-converter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: youtubeUrl,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Conversion failed: ${response.status} ${errorText}`);
      }

      const conversionResult: YouTubeConverterResponse = await response.json();

      if (conversionResult.success) {
        setResult(conversionResult);
      } else {
        setError(conversionResult.error || "Conversion failed");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              YouTube to PDF Converter
            </h2>
            <p className="text-gray-600">
              Transform YouTube videos into structured PDF transcripts
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Input Area */}
      {!result && !isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Youtube className="w-5 h-5 text-red-600" />
              <span>YouTube URL</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=example"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                Paste any YouTube video URL (youtube.com/watch or youtu.be)
              </div>
            </div>

            <Button
              onClick={handleConvert}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white"
              disabled={!youtubeUrl.trim()}
            >
              <Play className="w-4 h-4 mr-2" />
              Convert to PDF Transcript
            </Button>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Features:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Automatic transcript extraction</li>
                <li>• Timestamp navigation</li>
                <li>• Key points highlighting</li>
                <li>• Downloadable PDF notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              <span>Converting YouTube Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>
                {progress < 30
                  ? "Analyzing video..."
                  : progress < 60
                    ? "Extracting audio..."
                    : progress < 90
                      ? "Generating transcript..."
                      : "Creating PDF..."}
              </span>
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
              <span className="font-medium">Conversion Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setResult(null);
                setProgress(0);
              }}
              className="mt-3"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && result.success && (
        <div className="space-y-6">
          {/* Success Header */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Conversion Complete!</span>
              </div>
            </CardContent>
          </Card>

          {/* Video Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <span>Video Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium text-gray-900">
                  {result.video_info?.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">Video Title</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {result.video_info?.duration
                      ? formatDuration(result.video_info.duration)
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm capitalize">
                    {result.transcript?.language || "English"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Preview */}
          {result.transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Transcript Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed max-h-40 overflow-y-auto">
                  {result.transcript.full_text.substring(0, 500)}
                  {result.transcript.full_text.length > 500 && "..."}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {result.transcript.segments.length} timestamped segments •{" "}
                  {result.transcript.full_text.split(" ").length} words
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamped Segments Preview */}
          {result.transcript?.segments &&
            result.transcript.segments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <List className="w-5 h-5 text-purple-600" />
                    <span>Timestamped Segments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {result.transcript.segments
                      .slice(0, 5)
                      .map((segment, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-purple-200 pl-4"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {formatTimestamp(segment.start)} -{" "}
                              {formatTimestamp(segment.end)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            {segment.text}
                          </div>
                        </div>
                      ))}
                    {result.transcript.segments.length > 5 && (
                      <div className="text-center text-sm text-gray-500 italic">
                        ...and {result.transcript.segments.length - 5} more
                        segments in the PDF
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setResult(null);
                setYoutubeUrl("");
                setProgress(0);
              }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Convert Another Video
            </Button>
            {result.pdf_url && (
              <Button
                variant="outline"
                onClick={() => window.open(result.pdf_url, "_blank")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Transcript
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeConverter;
