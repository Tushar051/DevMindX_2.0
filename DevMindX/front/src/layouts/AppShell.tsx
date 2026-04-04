import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutGrid, ChevronLeft, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-inter_tight">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="font-semibold text-zinc-900 truncate">
              DevMindX
            </Link>
            <Link
              to="/features"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <LayoutGrid className="w-4 h-4" />
              Features
            </Link>
            <Link
              to="/app/profile"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm text-zinc-500 truncate max-w-[120px] sm:max-w-[200px]">
              {user?.username ?? user?.email}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
