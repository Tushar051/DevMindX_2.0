import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Github, RefreshCw, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useLocation } from 'wouter';

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Track mouse movement for glowing effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleEmailSignup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setVerificationEmail(data.email);
      setIsVerifying(true);
      startResendCountdown();
      toast({
        title: "Account created!",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      login(data.token, data.user);
      
      navigate('/ide');
      toast({
        title: "Welcome to DevMindX!",
        description: "Your account has been verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      startResendCountdown();
      
      toast({
        title: "Code resent!",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Resend Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    try {
      // Use the API base URL from config for OAuth
      const apiUrl = import.meta.env.VITE_API_URL || '';
      window.location.href = `${apiUrl}/api/auth/${provider}`;
    } catch (error) {
      toast({
        title: "OAuth Error", 
        description: `Failed to start ${provider} login process. Please check your internet connection.`, 
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden"
      style={{
        background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`,
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Glowing orb that follows cursor */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 80%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          transition: 'all 0.3s ease-out',
        }}
      />

      {/* 3D Glass-like Icon */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 mb-8 z-10">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full relative"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 backdrop-blur-sm"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300/30 to-purple-400/30 backdrop-blur-sm"></div>
            <div className="absolute top-2 left-2 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 mt-16">
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />
        
        <CardHeader className="text-center relative z-10">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">JOIN THE FUTURE</CardTitle>
          <CardDescription className="text-gray-600">
            Create your account and experience the next generation of development
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {isVerifying ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-900">Verification Code</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter your verification code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>
              <Button 
                onClick={handleVerifyOTP} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""} 
                Verify Account
              </Button>
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendDisabled || isLoading}
                className="w-full border-white/20 text-gray-700 hover:text-gray-900 hover:border-white/40 transition-all duration-300"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-900">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose your username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleEmailSignup} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""} 
                CREATE ACCOUNT
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-600">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleOAuthLogin('github')}
                  className="border-white/20 text-gray-700 hover:text-gray-900 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                >
                  <Github className="mr-2 h-4 w-4" /> 
                  Github
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleOAuthLogin('google')}
                  className="border-white/20 text-gray-700 hover:text-gray-900 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                >
                  <FaGoogle className="mr-2 h-4 w-4" /> 
                  Google
                </Button>
              </div>
            </>
          )}

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button 
              onClick={() => navigate('/login')} 
              className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignupPage;