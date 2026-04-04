import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Github } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      setVerificationEmail(data.email);
      setIsVerifying(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Enter the verification code from your email.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed");
      login(data.token, data.user);
      navigate("/features", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const oauth = (provider: "google" | "github") => {
    const base = import.meta.env.VITE_API_URL ?? "";
    window.location.href = `${base}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950 flex items-center justify-center px-4 py-12 font-inter_tight">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
          <p className="text-sm text-zinc-600">Start building with DevMindX</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {!isVerifying ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSignup}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign up
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-500">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => oauth("google")}
                className="py-2.5 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => oauth("github")}
                className="py-2.5 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50 inline-flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              Enter the code sent to <strong>{verificationEmail}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={handleVerifyOtp}
              className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verify email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
        <p className="text-center">
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-800">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
