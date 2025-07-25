import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import SpeechAnalysis from "./SpeechAnalysis";
import ATSCalculator from "./ATSCalculator";
import YouTubeConverter from "./YouTubeConverter";
import CompanyMaterials from "./CompanyMaterials";
import DSASheets from "./DSASheets";
import {
  X,
  Mic,
  FileText,
  Calculator,
  Youtube,
  Building,
  Code,
  Sparkles,
  Brain,
  Target,
  Zap,
  TrendingUp,
  BookOpen,
  Star,
  Lock,
  Shield,
  UserPlus,
} from "lucide-react";

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup?: () => void;
}

const Dashboard = ({ isOpen, onClose, onOpenSignup }: DashboardProps) => {
  const { isAuthenticated, user } = useAuth();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      opacity: number;
      scale: number;
      rotation: number;
    }>
  >([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef(0);

  // Mouse tracking and sparkle effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!modalRef.current) return;

      const rect = modalRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });

      // Generate sparkles occasionally
      if (Math.random() < 0.3) {
        const newSparkle = {
          id: sparkleIdRef.current++,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          opacity: Math.random() * 0.8 + 0.2,
          scale: Math.random() * 0.5 + 0.5,
          rotation: Math.random() * 360,
        };

        setSparkles((prev) => [...prev.slice(-20), newSparkle]);
      }
    };

    if (isOpen && modalRef.current) {
      modalRef.current.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isOpen]);

  // Clean up sparkles
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.filter((sparkle) => Date.now() - sparkle.id < 2000),
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: "ai-speech",
      title: "AI Speech & Gesture",
      description:
        "Practice interviews with AI-powered speech and gesture analysis",
      icon: Mic,
      gradient: "from-purple-400 to-pink-400",
      bgGradient: "from-purple-900/20 to-pink-900/20",
      color: "text-purple-300",
      glowColor: "shadow-purple-500/50",
    },

    {
      id: "ats-calculator",
      title: "ATS Calculator",
      description: "Optimize your resume score for Applicant Tracking Systems",
      icon: Calculator,
      gradient: "from-emerald-400 to-green-400",
      bgGradient: "from-emerald-900/20 to-green-900/20",
      color: "text-emerald-300",
      glowColor: "shadow-emerald-500/50",
    },
    {
      id: "yt-converter",
      title: "YT Video to PDF",
      description: "Transform YouTube tutorials into structured PDF notes",
      icon: Youtube,
      gradient: "from-red-400 to-orange-400",
      bgGradient: "from-red-900/20 to-orange-900/20",
      color: "text-red-300",
      glowColor: "shadow-red-500/50",
    },
    {
      id: "placement-materials",
      title: "Company Materials",
      description: "Access exclusive placement materials from top companies",
      icon: Building,
      gradient: "from-indigo-400 to-purple-400",
      bgGradient: "from-indigo-900/20 to-purple-900/20",
      color: "text-indigo-300",
      glowColor: "shadow-indigo-500/50",
    },
    {
      id: "dsa-sheets",
      title: "DSA Practice Sheets",
      description: "Curated Data Structures & Algorithms practice problems",
      icon: Code,
      gradient: "from-yellow-400 to-orange-400",
      bgGradient: "from-yellow-900/20 to-orange-900/20",
      color: "text-yellow-300",
      glowColor: "shadow-yellow-500/50",
    },
  ];

  const renderFeatureContent = (featureId: string) => {
    switch (featureId) {
      case "ai-speech":
        return <SpeechAnalysis onBack={() => setActiveFeature(null)} />;
      case "ats-calculator":
        return <ATSCalculator onBack={() => setActiveFeature(null)} />;
      case "yt-converter":
        return <YouTubeConverter onBack={() => setActiveFeature(null)} />;
      case "placement-materials":
        return <CompanyMaterials onBack={() => setActiveFeature(null)} />;
      case "dsa-sheets":
        return <DSASheets />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30"
        style={{
          boxShadow:
            "0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 50px rgba(168, 85, 247, 0.1)",
        }}
      >
        {/* Galaxy Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated stars */}
          <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-300 rounded-full opacity-80 animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-purple-300 rounded-full opacity-70 animate-pulse delay-700"></div>
          <div className="absolute bottom-10 right-10 w-1 h-1 bg-pink-300 rounded-full opacity-60 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-cyan-300 rounded-full opacity-75 animate-pulse delay-500"></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full opacity-65 animate-pulse delay-800"></div>

          {/* Nebula clouds */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-600/15 to-indigo-600/15 rounded-full filter blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Mouse-following sparkles */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: sparkle.x - 6,
              top: sparkle.y - 6,
              opacity: sparkle.opacity,
              transform: `scale(${sparkle.scale}) rotate(${sparkle.rotation}deg)`,
              transition: "opacity 0.5s ease-out",
            }}
          >
            <Star className="w-3 h-3 text-yellow-300 animate-pulse" />
          </div>
        ))}
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 backdrop-blur-sm p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-6 h-6 text-white animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🌌 Galaxy Dashboard
                </h2>
                <p className="text-purple-200">
                  Your AI-powered career preparation hub
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-200 hover:text-white hover:bg-purple-500/20 rounded-full w-10 h-10 p-0 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Header sparkle effect */}
          <div className="absolute top-2 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-32 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 overflow-y-auto border-r border-purple-500/30">
            <h3 className="text-lg font-bold text-purple-200 mb-6">
              🚀 Galaxy Features
            </h3>
            <div className="space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 border relative ${
                      activeFeature === feature.id
                        ? `bg-gradient-to-r ${feature.bgGradient} shadow-xl ${feature.glowColor} ring-2 ring-purple-400/50 border-purple-400/50`
                        : "bg-slate-800/30 hover:bg-slate-700/40 border-slate-600/50 hover:border-purple-400/30"
                    } backdrop-blur-sm ${!isAuthenticated ? "opacity-60" : ""}`}
                    onClick={() =>
                      isAuthenticated ? setActiveFeature(feature.id) : null
                    }
                  >
                    {!isAuthenticated && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <Lock className="w-6 h-6 text-red-400" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center shrink-0 shadow-lg ${feature.glowColor}`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4
                            className={`font-semibold text-sm ${activeFeature === feature.id ? feature.color : "text-gray-200"}`}
                          >
                            {feature.title}
                            {!isAuthenticated && (
                              <Lock className="w-3 h-3 inline-block ml-1" />
                            )}
                          </h4>
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${
                              activeFeature === feature.id
                                ? "text-gray-300"
                                : "text-gray-400"
                            }`}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-900/20 to-purple-900/20 backdrop-blur-sm">
            {!isAuthenticated ? (
              // Authentication Wall
              <div className="flex items-center justify-center h-full text-center">
                <div className="relative max-w-md">
                  {/* Floating lock icons */}
                  <div className="absolute -top-8 -left-8 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="absolute -top-4 right-4 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse delay-300">
                    <Shield className="w-3 h-3 text-orange-400" />
                  </div>
                  <div className="absolute bottom-0 -left-4 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse delay-700">
                    <Lock className="w-3 h-3 text-yellow-400" />
                  </div>

                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-red-500/30 shadow-xl shadow-red-500/20">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      🔒 Secure Login Required
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Please create an account or sign in to access all our
                      premium AI-powered placement preparation features.
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span>Secure & encrypted account creation</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Access to premium AI tools</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span>Personalized learning experience</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Button
                        onClick={() => {
                          onClose();
                          onOpenSignup?.();
                        }}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account / Sign In
                      </Button>
                      <p className="text-xs text-gray-500">
                        Click above to create your account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeFeature ? (
              <div className="animate-in slide-in-from-right-5 duration-300">
                {renderFeatureContent(activeFeature)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="relative">
                  {/* Floating stars around the central content */}
                  <div className="absolute -top-8 -left-8 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute -top-4 right-4 w-1 h-1 bg-blue-300 rounded-full opacity-80 animate-pulse delay-300"></div>
                  <div className="absolute bottom-0 -left-4 w-1 h-1 bg-purple-300 rounded-full opacity-70 animate-pulse delay-700"></div>
                  <div className="absolute -bottom-4 right-8 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-pulse delay-1000"></div>

                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 shadow-xl shadow-green-500/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                        <Shield className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          <span className="text-green-400">Welcome back, </span>
                          <span className="text-cyan-300 font-semibold">
                            {user?.fullName}
                          </span>
                        </p>
                      </div>
                    </div>
                    <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">
                      🌟 Select a Feature to Get Started
                    </h3>
                    <p className="text-purple-300/80">
                      Choose from our AI-powered tools to accelerate your
                      placement preparation journey through the galaxy
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
