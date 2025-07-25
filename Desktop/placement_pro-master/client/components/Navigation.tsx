import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";
import Dashboard from "./Dashboard";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems: { name: string; href: string }[] = [];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AΣ</span>
              </div>
              <span className="text-xl font-bold text-white">
                Placement Pro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-brand-600 hover:scale-105 ${
                    location.pathname === item.href
                      ? "text-brand-600 font-semibold"
                      : isScrolled
                        ? "text-gray-700"
                        : "text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsDashboardOpen(true)}
                  className={`${
                    isScrolled
                      ? "text-gray-700 hover:text-brand-600"
                      : "text-white hover:text-brand-200"
                  } hover:bg-brand-50 transition-all duration-300`}
                  size="sm"
                >
                  Dashboard
                </Button>

                {isAuthenticated ? (
                  <>
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        isScrolled
                          ? "bg-brand-50 text-brand-700"
                          : "bg-white/20 backdrop-blur-sm text-white"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.fullName}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={logout}
                      className={`${
                        isScrolled
                          ? "border-red-500 text-red-700 hover:bg-red-100 bg-white"
                          : "border-white text-white hover:bg-white hover:text-red-700 bg-white/20 backdrop-blur-sm"
                      } transition-all duration-300 hover:scale-105 font-semibold`}
                      size="sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsLoginOpen(true)}
                      className={`${
                        isScrolled
                          ? "border-brand-500 text-brand-700 hover:bg-brand-100 bg-white"
                          : "border-white text-white hover:bg-white hover:text-brand-700 bg-white/20 backdrop-blur-sm"
                      } transition-all duration-300 hover:scale-105 font-semibold`}
                      size="sm"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => setIsSignupOpen(true)}
                      className="bg-gradient-to-r from-brand-500 to-violet-500 hover:from-brand-600 hover:to-violet-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-brand-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-100">
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 text-sm font-medium transition-all duration-300 hover:text-brand-600 hover:bg-gradient-to-r hover:from-brand-50 hover:to-violet-50 rounded-lg ${
                      location.pathname === item.href
                        ? "text-brand-600 bg-gradient-to-r from-brand-50 to-violet-50 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDashboardOpen(true)}
                    className="w-full text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all duration-300"
                  >
                    Dashboard
                  </Button>

                  {isAuthenticated ? (
                    <>
                      <div className="w-full p-3 bg-brand-50 rounded-lg flex items-center space-x-2">
                        <User className="w-4 h-4 text-brand-600" />
                        <span className="text-sm font-medium text-brand-700">
                          {user?.fullName}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full border-red-500 text-red-700 hover:bg-red-100 bg-white font-semibold transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsLoginOpen(true)}
                        className="w-full border-brand-500 text-brand-700 hover:bg-brand-100 bg-white font-semibold transition-all duration-300"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => setIsSignupOpen(true)}
                        className="w-full bg-gradient-to-r from-brand-500 to-violet-500 hover:from-brand-600 hover:to-violet-600 text-white border-0 shadow-lg transition-all duration-300"
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onOpenSignup={() => {
          setIsDashboardOpen(false);
          setIsSignupOpen(true);
        }}
      />
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
};

export default Navigation;
