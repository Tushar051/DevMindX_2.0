import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 font-inter_tight">
      <h1 className="text-4xl font-semibold text-zinc-900">404</h1>
      <p className="text-zinc-600 mt-2 text-center max-w-md">This page does not exist.</p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
      >
        Back home
      </Link>
    </div>
  );
}
