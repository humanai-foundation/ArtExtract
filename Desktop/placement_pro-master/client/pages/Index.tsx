import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: "10K+", label: "Students Placed" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Partner Companies" },
    { number: "24/7", label: "AI Support" },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "AI-Powered Prep",
      description:
        "Advanced AI tools for interview preparation, resume optimization, and skill assessment.",
    },
    {
      icon: Shield,
      title: "ATS Optimization",
      description:
        "Smart ATS calculator and resume checker to ensure your profile passes all screening.",
    },
    {
      icon: Globe,
      title: "Company Materials",
      description:
        "Exclusive placement materials and insider tips from top tech companies worldwide.",
    },
    {
      icon: Users,
      title: "Expert Mentors",
      description:
        "Industry professionals providing personalized guidance and mock interview sessions.",
    },
  ];

  const features = [
    "AI Speech & Gesture Analysis",
    "ATS Score Calculator",
    "YT to PDF Converter",
    "DSA Practice Sheets",
    "Company-Specific Prep",
  ];

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-blue-500/20 to-violet-600/30"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-400/20 via-transparent to-rose-500/20"></div>

        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-500"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg rotate-45 opacity-20 animate-bounce"></div>
          <div className="absolute bottom-32 right-32 w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-25 animate-pulse delay-700"></div>
          <div className="absolute top-1/3 right-20 w-8 h-20 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-300"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-white/20 to-cyan-200/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30 shadow-xl">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <span className="text-white text-sm font-semibold tracking-wide">
                ✨ Your Dream Job Awaits ✨
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              AI-Powered Placement
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent animate-pulse">
                Preparation
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-white mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Master your placement journey with AI-driven tools, personalized
              preparation, and expert guidance to land your dream job at top
              companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="bg-gradient-to-r from-white via-cyan-50 to-white text-purple-700 hover:from-cyan-50 hover:to-pink-50 px-10 py-5 text-lg font-bold group shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 border border-white/50"
              >
                🎯 Start Preparation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsSignupOpen(true)}
                className="border-2 border-white text-white hover:bg-white hover:text-purple-700 backdrop-blur-sm px-10 py-5 text-lg font-bold shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 bg-white/20"
              >
                📝 Sign Up
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-1000 delay-${index * 200} ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white text-sm lg:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 relative overflow-hidden">
        {/* Enhanced Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full filter blur-2xl animate-bounce"></div>

        {/* Floating elements */}
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-20 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-bounce delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block mb-4 transform hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg font-bold px-6 py-2 border border-white/30 rounded-full backdrop-blur-sm bg-white/20 shadow-lg">
                💜 OUR MISSION 💜
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 hover:scale-105 transition-transform duration-300">
              Our Mission
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium opacity-0 animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards">
              We're on a mission to revolutionize placement preparation with
              AI-powered tools, helping students and professionals secure their
              dream jobs at top companies worldwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="animate-in slide-in-from-left-8 duration-1000 delay-500">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 hover:text-yellow-200 transition-colors duration-300">
                Empowering Your Career Journey
              </h3>
              <p className="text-white/90 mb-8 text-lg leading-relaxed font-medium relative">
                At Placement Pro, we believe every student deserves a shot at
                their dream job. Our AI-powered platform provides comprehensive
                placement preparation tools designed by industry experts.
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-yellow-300 to-white rounded-full opacity-60"></div>
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/20 hover:shadow-md transition-all duration-300 hover:translate-x-2 group backdrop-blur-sm"
                  >
                    <div className="relative">
                      <CheckCircle className="w-5 h-5 text-yellow-300 group-hover:text-white transition-colors duration-300" />
                      <div className="absolute inset-0 bg-yellow-300/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                    </div>
                    <span className="text-white font-semibold group-hover:text-yellow-100 transition-colors duration-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right-8 duration-1000 delay-700">
              {/* Enhanced layered background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 rounded-3xl transform rotate-6 opacity-50 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-pink-200 rounded-3xl transform -rotate-3 opacity-30 animate-pulse delay-500"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-emerald-200 to-blue-200 rounded-3xl transform rotate-2 opacity-20 animate-pulse delay-1000"></div>

              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105 hover:-rotate-1 group overflow-hidden">
                {/* Animated background overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating particles */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 left-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-700"></div>

                <div className="bg-white/20 rounded-full p-3 w-fit mb-6 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 relative z-10">
                  <TrendingUp className="w-12 h-12 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="text-2xl font-bold mb-4 group-hover:text-yellow-100 transition-colors duration-300 relative z-10">
                  🌟 Success Stories
                </h4>
                <p className="text-white text-lg leading-relaxed font-medium group-hover:text-gray-100 transition-colors duration-300 relative z-10">
                  Your placement success is our success! Join thousands of
                  students who've landed their dream jobs with our AI-powered
                  preparation. 🚀
                </p>

                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 relative overflow-hidden">
        {/* Enhanced background decorations with more elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-green-300 to-cyan-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-15 animate-bounce"></div>

        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full opacity-25 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-20 animate-bounce delay-700"></div>

        {/* Geometric shapes */}
        <div
          className="absolute top-20 right-1/4 w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rotate-45 opacity-30 animate-spin"
          style={{ animationDuration: "8s" }}
        ></div>
        <div className="absolute bottom-32 left-1/5 w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg rotate-12 opacity-25 animate-pulse delay-300"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block mb-4 transform hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg font-bold px-6 py-3 border border-white/30 rounded-full backdrop-blur-sm bg-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                ⭐ WHY CHOOSE US ⭐
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 hover:scale-105 transition-transform duration-300">
              Why Choose Placement Pro
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium opacity-0 animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards">
              Experience the difference with our comprehensive approach to
              technology solutions. 🌈
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const gradients = [
                "from-pink-500 to-orange-500",
                "from-cyan-500 to-blue-500",
                "from-purple-500 to-pink-500",
                "from-green-500 to-emerald-500",
              ];
              const bgGradients = [
                "from-pink-900/40 to-orange-900/40",
                "from-cyan-900/40 to-blue-900/40",
                "from-purple-900/40 to-pink-900/40",
                "from-green-900/40 to-emerald-900/40",
              ];
              const shadowColors = [
                "hover:shadow-pink-200/50",
                "hover:shadow-cyan-200/50",
                "hover:shadow-purple-200/50",
                "hover:shadow-emerald-200/50",
              ];
              const hoverBorders = [
                "hover:border-pink-400",
                "hover:border-cyan-400",
                "hover:border-purple-400",
                "hover:border-emerald-400",
              ];

              return (
                <Card
                  key={index}
                  className={`group hover:shadow-2xl ${shadowColors[index]} transition-all duration-700 border-2 border-transparent ${hoverBorders[index]} bg-gradient-to-br ${bgGradients[index]} backdrop-blur-sm hover:scale-105 hover:-rotate-1 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-1000`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Enhanced animated background effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Floating particles */}
                  <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-opacity duration-500"></div>
                  <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-50 group-hover:animate-pulse transition-opacity duration-500 delay-200"></div>

                  <CardContent className="p-8 text-center relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${gradients[index]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl relative overflow-hidden`}
                    >
                      {/* Icon glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-100 transition-colors group-hover:scale-105 transform duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-white/90 leading-relaxed text-sm font-medium group-hover:text-white transition-colors duration-300">
                      {benefit.description}
                    </p>

                    {/* Bottom accent line */}
                    <div
                      className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${gradients[index]} group-hover:w-full transition-all duration-500`}
                    ></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-600 via-pink-600 via-orange-500 to-yellow-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full filter blur-2xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-8 animate-bounce">
            <Award className="w-16 h-16 text-yellow-200" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            🚀 Ready to Transform Your Business? ✨
          </h2>
          <p className="text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Join hundreds of companies that have already revolutionized their
            operations with our solutions. The future is here! 🌟
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-white via-cyan-50 to-white text-purple-700 hover:from-yellow-50 hover:to-pink-50 px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
            >
              🎯 Start Your Journey
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/70 text-black hover:bg-white/20 backdrop-blur-sm px-10 py-5 text-lg font-bold shadow-xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 bg-white"
            >
              📅 Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
}
