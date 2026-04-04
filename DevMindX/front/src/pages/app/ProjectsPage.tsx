import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, Trash2, Download, Loader2, Search } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/projects"), { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load");
      setProjects(await res.json());
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase()),
  );

  const openInIde = async (projectId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/projects/${projectId}/load`), { headers: authHeaders() });
      if (!res.ok) throw new Error("Load failed");
      navigate(`/app/ide?projectId=${projectId}&t=${Date.now()}`);
    } catch {
      window.alert("Could not open project in IDE.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      const res = await fetch(apiUrl(`/api/projects/${id}`), { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      window.alert("Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const exportZip = async (id: string, name: string) => {
    try {
      const res = await fetch(apiUrl(`/api/projects/${id}/export`), { headers: authHeaders() });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Export failed.");
    }
  };

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Soft Pastel Gradient Background */}
      <div
        className="absolute top-[-50px] left-[-50px] w-[calc(100%+100px)] h-[800px] overflow-hidden pointer-events-none z-[-1] opacity-60 rounded-[3rem]"
        style={{
            background: 'radial-gradient(circle at 15% 15%, rgba(224, 242, 254, 0.8) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(254, 243, 199, 0.8) 0%, transparent 50%)'
        }}
      />
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-5xl font-semibold text-zinc-900 flex items-center gap-3 drop-shadow-sm">
          <span>DevMindX</span> <span className="font-[cursive] text-emerald-600 font-light tracking-wide">Projects</span>
        </h1>
        <p className="text-base text-zinc-600 mt-3 max-w-2xl">Open in the IDE, export, or delete saved work.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-3"
            >
              <div>
                <h2 className="font-semibold text-zinc-900">{p.name}</h2>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description}</p>
                {p.framework && (
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                    {p.framework}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <button
                  type="button"
                  onClick={() => openInIde(p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Open in IDE
                </button>
                <Link
                  to={`/app/learning?projectId=${encodeURIComponent(p.id)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium hover:bg-zinc-50 text-zinc-800"
                >
                  Learning
                </Link>
                <Link
                  to={`/app/architecture?projectId=${encodeURIComponent(p.id)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium hover:bg-zinc-50 text-zinc-800"
                >
                  Architecture
                </Link>
                <button
                  type="button"
                  onClick={() => exportZip(p.id, p.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium hover:bg-zinc-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  type="button"
                  disabled={deleting === p.id}
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-zinc-500 py-12">No projects yet. Generate one from the generator.</p>
      )}
      </motion.div>
    </div>
  );
}
