import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Copy, Check } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { motion } from "framer-motion";

export function ResearchPage() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl("/api/research/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { message?: string }).message || "Research failed");
      setResult(data as Record<string, unknown>);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const prompt = typeof result?.devmindxPrompt === "string" ? result.devmindxPrompt : "";

  return (
    <div className="space-y-6 max-w-4xl relative min-h-screen">
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
          <Search className="w-12 h-12 text-orange-500" />
          <span>DevMindX</span> <span className="font-[cursive] text-orange-500 font-light tracking-wide">Research</span>
        </h1>
        <p className="text-base text-zinc-600 mt-3 max-w-2xl">
          Turn an idea into structured research and a DevMindX generator prompt (legacy{" "}
          <code className="text-xs bg-zinc-100 px-1 rounded">/api/research/analyze</code>).
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={6}
          placeholder="Describe your product idea, stack constraints, or paste project notes…"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm resize-y min-h-[140px]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={run}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Analyze idea
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          {typeof result.error === "string" ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <>
              {typeof result.overview === "string" && (
                <section>
                  <h2 className="text-sm font-semibold text-zinc-800 mb-2">Overview</h2>
                  <p className="text-sm text-zinc-600 whitespace-pre-wrap">{result.overview}</p>
                </section>
              )}
              {Array.isArray(result.keyFeatures) && (
                <section>
                  <h2 className="text-sm font-semibold text-zinc-800 mb-2">Key features</h2>
                  <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
                    {(result.keyFeatures as string[]).map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </section>
              )}
              {Array.isArray(result.techStack) && (
                <section>
                  <h2 className="text-sm font-semibold text-zinc-800 mb-2">Tech stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {(result.techStack as string[]).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {prompt && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    Copy generator prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/app/generator", { state: { prompt } })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    Open in generator
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </motion.div>
    </div>
  );
}
