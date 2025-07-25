import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  Star,
  Award,
  BookOpen,
} from "lucide-react";
import { ATSCalculatorResponse } from "@shared/api";

interface ATSCalculatorProps {
  onBack?: () => void;
}

const ATSCalculator = ({ onBack }: ATSCalculatorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ATSCalculatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Both resume text and job description are required");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ats-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysisResult = await response.json();

      // Convert FastAPI response format to our component format
      const convertedResult: ATSCalculatorResponse = {
        overall_score: analysisResult.score || 0,
        similarity_score: analysisResult.score || 0,
        keyword_match: analysisResult.score || 0,
        matched_keywords: [],
        missing_keywords: [],
        recommendations: [analysisResult.message || "Analysis completed"],
        job_keywords: [],
        resume_keywords: [],
      };

      setResult(convertedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70)
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        label: "Excellent",
      };
    if (score >= 50)
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Good",
      };
    return {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Needs Work",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ATS Score Calculator
            </h2>
            <p className="text-gray-600">
              Optimize your resume for Applicant Tracking Systems
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Input Areas */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Your Resume Text</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                Characters: {resumeText.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span>Job Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px] text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                Characters: {jobDescription.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyze Button */}
      {!result && !isProcessing && (
        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3"
            disabled={!resumeText.trim() || !jobDescription.trim()}
          >
            <Target className="w-4 h-4 mr-2" />
            Calculate ATS Score
          </Button>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Analyzing Your Resume</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={75} className="w-full" />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Analyzing keyword matching and semantic similarity...</span>
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
                setResult(null);
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
                <span className="font-medium">ATS Analysis Complete!</span>
              </div>
            </CardContent>
          </Card>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Overall Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(result.overall_score)}`}
                  >
                    {result.overall_score}%
                  </div>
                  <div className="text-gray-600 mb-2">ATS Match</div>
                  <Badge className={getScoreBadge(result.overall_score).color}>
                    {getScoreBadge(result.overall_score).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Similarity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.similarity_score}%
                  </div>
                  <div className="text-gray-600">Content Match</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Keywords</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.keyword_match}%
                  </div>
                  <div className="text-gray-600">Keyword Match</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matched Keywords */}
          {result.matched_keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Matched Keywords</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      className="bg-emerald-100 text-emerald-800 border-emerald-200"
                    >
                      ✓ {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Missing Keywords */}
          {result.missing_keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Missing Keywords</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      className="bg-red-100 text-red-800 border-red-200"
                    >
                      + {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg"
                  >
                    <div className="text-indigo-600 mt-1">
                      {rec.includes("🔴")
                        ? "🔴"
                        : rec.includes("🟡")
                          ? "🟡"
                          : rec.includes("🟢")
                            ? "🟢"
                            : "💡"}
                    </div>
                    <div className="text-indigo-800 flex-1">
                      {rec.replace(/🔴|🟡|🟢|💡|📝|✅|📊|🎯|📋/g, "").trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setResult(null);
                setResumeText("");
                setJobDescription("");
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSCalculator;
