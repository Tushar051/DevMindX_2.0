import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, GraduationCap } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { motion } from "framer-motion";

type Tab = "summary" | "explanations" | "quiz" | "viva";

interface LearningPayload {
  summary?: string;
  explanations?: Array<{
    file: string;
    lines: Array<{ lineNumber: number; code: string; explanation: string }>;
  }>;
  quiz?: Array<{ question: string; options: string[]; correctAnswer: number }>;
  vivaQuestions?: string[];
}

export function LearningPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [code, setCode] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [data, setData] = useState<LearningPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectLoadStatus, setProjectLoadStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [quizPick, setQuizPick] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!projectId) {
      setProjectLoadStatus("idle");
      return;
    }
    let cancelled = false;
    setProjectLoadStatus("loading");
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/projects/${projectId}`), { headers: authHeaders() });
        if (!res.ok) throw new Error("load");
        const p = (await res.json()) as { name?: string; files?: Record<string, string> };
        if (cancelled) return;
        const files = p.files && typeof p.files === "object" ? p.files : {};
        const paths = Object.keys(files);
        const blob = paths
          .map((path) => `// ${path}\n${String(files[path] ?? "")}`)
          .join("\n\n---\n\n");
        setCode(
          blob.trim()
            ? `// Project: ${p.name ?? "saved project"}\n\n${blob}`
            : `// Project: ${p.name ?? "saved project"} (no files)`,
        );
        setProjectLoadStatus("ok");
      } catch {
        if (!cancelled) setProjectLoadStatus("err");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const loadFromFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const readers = [...fileList].map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(`// ${file.name}\n${String(r.result ?? "")}`);
          r.onerror = () => reject(new Error("read"));
          r.readAsText(file);
        }),
    );
    try {
      const parts = await Promise.all(readers);
      setCode((prev) => (prev.trim() ? `${prev.trim()}\n\n---\n\n` : "") + parts.join("\n\n---\n\n"));
    } catch {
      window.alert("Could not read one or more files.");
    }
  };

  const run = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/learning/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      setData(json as LearningPayload);
      setTab("summary");
      setQuizPick({});
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "explanations", label: "Line explanations" },
    { id: "quiz", label: "Quiz" },
    { id: "viva", label: "Viva" },
  ];

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
          <GraduationCap className="w-12 h-12 text-indigo-600" />
          <span>DevMindX</span> <span className="font-[cursive] text-indigo-600 font-light tracking-wide">Learning</span>
        </h1>
        <p className="text-base text-zinc-600 mt-3 max-w-2xl">
          Paste code, upload files, or open a saved project from{" "}
          <Link to="/app/projects" className="text-indigo-600 font-medium hover:underline">
            Projects
          </Link>{" "}
          (<code className="text-xs bg-zinc-100 px-1 rounded">?projectId=</code>) for AI explanations and quizzes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >

      {projectId && (
        <div
          className={`rounded-xl border px-3 py-2 text-xs ${
            projectLoadStatus === "err"
              ? "border-red-200 bg-red-50 text-red-800"
              : projectLoadStatus === "loading"
                ? "border-zinc-200 bg-zinc-50 text-zinc-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {projectLoadStatus === "loading" && "Loading project into the editor…"}
          {projectLoadStatus === "ok" && `Loaded project ${projectId}. Edit the text if needed, then Analyze.`}
          {projectLoadStatus === "err" && "Could not load that project (sign in or check the link)."}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">
            <input
              type="file"
              multiple
              className="hidden"
              accept=".ts,.tsx,.js,.jsx,.json,.css,.html,.md,.py,.rs,.go,.txt"
              onChange={(e) => {
                void loadFromFiles(e.target.files);
                e.target.value = "";
              }}
            />
            Upload code files
          </label>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          placeholder="Paste source code or a detailed project write-up…"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-mono resize-y min-h-[200px]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={run}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Analyze
        </button>
      </div>

      {data && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-100 bg-zinc-50">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  tab === t.id ? "bg-white shadow text-zinc-900" : "text-zinc-600 hover:bg-white/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 max-h-[560px] overflow-y-auto text-sm text-zinc-700 space-y-4">
            {tab === "summary" && (
              <p className="whitespace-pre-wrap">{data.summary ?? "—"}</p>
            )}
            {tab === "explanations" &&
              (data.explanations?.length ? (
                data.explanations.map((ex, i) => (
                  <div key={i} className="border border-zinc-100 rounded-xl p-3 space-y-2">
                    <p className="font-semibold text-zinc-900 text-xs">{ex.file}</p>
                    {ex.lines?.map((line, j) => (
                      <div key={j} className="text-xs border-l-2 border-indigo-200 pl-2">
                        <span className="text-zinc-400">L{line.lineNumber}</span>{" "}
                        <code className="bg-zinc-100 px-1 rounded">{line.code}</code>
                        <p className="mt-1 text-zinc-600">{line.explanation}</p>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No explanations in response.</p>
              ))}
            {tab === "quiz" &&
              (data.quiz?.length ? (
                <div className="space-y-4">
                  {data.quiz.map((q, qi) => (
                    <div key={qi} className="rounded-xl border border-zinc-100 p-3">
                      <p className="font-medium text-zinc-900 mb-2">{q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${qi}`}
                              checked={quizPick[qi] === oi}
                              onChange={() => setQuizPick((p) => ({ ...p, [qi]: oi }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {quizPick[qi] !== undefined && (
                        <p
                          className={`mt-2 text-xs font-medium ${
                            quizPick[qi] === q.correctAnswer ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {quizPick[qi] === q.correctAnswer ? "Correct" : "Incorrect"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500">No quiz in response.</p>
              ))}
            {tab === "viva" &&
              (data.vivaQuestions?.length ? (
                <ol className="list-decimal list-inside space-y-2">
                  {data.vivaQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-zinc-500">No viva questions in response.</p>
              ))}
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
