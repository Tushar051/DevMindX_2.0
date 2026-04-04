import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, LayoutTemplate } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { motion } from "framer-motion";

type DiagramId = "system" | "class" | "er" | "sequence" | "api" | "dataflow";

const DIAGRAMS: { id: DiagramId; label: string }[] = [
  { id: "system", label: "System architecture" },
  { id: "class", label: "Class diagram" },
  { id: "er", label: "ER diagram" },
  { id: "sequence", label: "Sequence diagram" },
  { id: "api", label: "REST API blueprint" },
  { id: "dataflow", label: "Data flow" },
];

function fieldForTab(tab: DiagramId): keyof DiagramData {
  const map: Record<DiagramId, keyof DiagramData> = {
    system: "systemArchitecture",
    class: "classDiagram",
    er: "erDiagram",
    sequence: "sequenceDiagram",
    api: "restApiBlueprint",
    dataflow: "dataFlowDiagram",
  };
  return map[tab];
}

interface DiagramData {
  systemArchitecture: string;
  classDiagram: string;
  erDiagram: string;
  sequenceDiagram: string;
  restApiBlueprint: string;
  dataFlowDiagram: string;
  description?: string;
}

export function ArchitecturePage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<DiagramId | null>(null);
  const [activeTab, setActiveTab] = useState<DiagramId>("system");
  const [data, setData] = useState<DiagramData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/projects/${projectId}`), { headers: authHeaders() });
        if (!res.ok || cancelled) return;
        const p = (await res.json()) as {
          name?: string;
          description?: string;
          framework?: string;
          files?: Record<string, string>;
        };
        if (cancelled) return;
        const paths = p.files && typeof p.files === "object" ? Object.keys(p.files) : [];
        const sample = paths
          .slice(0, 8)
          .map((path) => {
            const body = String((p.files as Record<string, string>)[path] ?? "").slice(0, 400);
            return `${path}:\n${body}${body.length >= 400 ? "…" : ""}`;
          })
          .join("\n\n");
        const desc = [
          `Project name: ${p.name ?? "unknown"}`,
          p.description ? `Description: ${p.description}` : null,
          p.framework ? `Framework: ${p.framework}` : null,
          paths.length ? `File tree (${paths.length} files): ${paths.slice(0, 40).join(", ")}${paths.length > 40 ? "…" : ""}` : null,
          sample ? `Excerpts:\n${sample}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        setInput((prev) => (prev.trim() ? prev : desc));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const generate = async () => {
    if (!selected || !input.trim()) {
      window.alert("Choose a diagram type and describe your project.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/architecture/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ description: input.trim(), diagramType: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      setData(json as DiagramData);
      setActiveTab(selected);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const currentText = data ? String(data[fieldForTab(activeTab)] ?? "") : "";

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
          <LayoutTemplate className="w-12 h-12 text-fuchsia-600" />
          <span>DevMindX</span> <span className="font-[cursive] text-fuchsia-600 font-light tracking-wide">Architecture</span>
        </h1>
        <p className="text-base text-zinc-600 mt-3 max-w-2xl">
          Mermaid-style outputs from{" "}
          <code className="text-xs bg-zinc-100 px-1 rounded">/api/architecture/generate</code>. Open with a saved{" "}
          <Link to="/app/projects" className="text-fuchsia-700 font-medium hover:underline">
            project
          </Link>{" "}
          via <code className="text-xs bg-zinc-100 px-1 rounded">?projectId=</code> to prefill from code.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <p className="text-xs font-medium text-zinc-600">Diagram type</p>
        <div className="flex flex-wrap gap-2">
          {DIAGRAMS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelected(d.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                selected === d.id
                  ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-900"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="Describe the system, domains, and integrations…"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={loading}
          onClick={generate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Generate
        </button>
      </div>

      {data && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-100 bg-zinc-50">
            {DIAGRAMS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveTab(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === d.id ? "bg-white shadow text-zinc-900" : "text-zinc-600 hover:bg-white/80"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="p-4 max-h-[480px] overflow-auto">
            <pre className="text-xs font-mono text-zinc-800 whitespace-pre-wrap break-words">
              {currentText || "(empty)"}
            </pre>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
