import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, Heart, Target, Trophy, Sparkles } from "lucide-react";

export default function About() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full filter blur-2xl animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto animate-spin" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-8">
              🌟 About Placement Pro 🌟
            </h1>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
              This beautiful page is coming soon! We'll showcase our amazing
              company background, incredible team, core values, and exciting
              milestones here. ✨
            </p>

            {/* Preview cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-purple-800 mb-2">Our Team</h3>
                <p className="text-sm text-purple-700">
                  Meet our amazing experts
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <Heart className="w-8 h-8 text-pink-600 mx-auto mb-4" />
                <h3 className="font-bold text-pink-800 mb-2">Our Values</h3>
                <p className="text-sm text-pink-700">What drives us forward</p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-4" />
                <h3 className="font-bold text-orange-800 mb-2">Our Mission</h3>
                <p className="text-sm text-orange-700">
                  Transforming the future
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <Trophy className="w-8 h-8 text-cyan-600 mx-auto mb-4" />
                <h3 className="font-bold text-cyan-800 mb-2">Milestones</h3>
                <p className="text-sm text-cyan-700">Our achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
