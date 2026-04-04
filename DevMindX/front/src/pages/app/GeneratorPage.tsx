import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Send, Sparkles, ExternalLink } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { motion } from "framer-motion";

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

function createPreviewUrl(files: GeneratedFile[]): string {
  const htmlFile = files.find((f) => f.path.endsWith(".html"));
  const jsFile = files.find((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"));
  const cssFile = files.find((f) => f.path.endsWith(".css"));
  let html = htmlFile?.content ?? "<html><body><div id=\"root\"></div></body></html>";
  if (jsFile) html = html.replace("</body>", `<script>${jsFile.content}</script></body>`);
  if (cssFile) {
    const tag = html.includes("</head>") ? "</head>" : "<body>";
    html = html.replace(tag, `<style>${cssFile.content}</style>${tag}`);
  }
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

export function GeneratorPage() {
  const location = useLocation();
  const statePrompt = (location.state as { prompt?: string } | null)?.prompt ?? "";

  const [prompt, setPrompt] = useState(statePrompt);
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selected, setSelected] = useState<GeneratedFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filesRecordFromList = (list: GeneratedFile[]): Record<string, string> => {
    const o: Record<string, string> = {};
    for (const f of list) o[f.path] = f.content;
    return o;
  };

  const listFromRecord = (rec: Record<string, string>): GeneratedFile[] =>
    Object.entries(rec).map(([path, content]) => ({
      path,
      content,
      language: path.split(".").pop() || "text",
    }));

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setFiles([]);
    setSelected(null);
    setSavedProjectId(null);
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");

    try {
      const response = await fetch(apiUrl("/api/projects/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: projectName.trim() || "ai-generated-project",
          framework: framework.trim() || undefined,
          description: prompt.trim(),
          model: "together",
          withPreview: true,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        files?: Record<string, string>;
        projectId?: string;
        preview?: { previewUrl?: string; sandboxId?: string };
      };
      if (!response.ok) throw new Error(data.message || "Generation failed");
      const list: GeneratedFile[] = Object.entries(data.files || {}).map(([path, content]) => ({
        path,
        content,
        language: path.split(".").pop() || "text",
      }));
      setFiles(list);
      if (list[0]) setSelected(list[0]);
      if (typeof data.projectId === "string" && data.projectId) setSavedProjectId(data.projectId);

      if (data.preview?.previewUrl) setPreviewUrl(data.preview.previewUrl);
      else setPreviewUrl(createPreviewUrl(list));

      setChatMessages([
        {
          role: "assistant",
          content: `Generated ${list.length} files and saved the project. Open it in the IDE to edit, or ask for changes below.`,
        },
      ]);
    } catch (e) {
      setChatMessages([
        { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Failed"}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading || files.length === 0) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const filesMap = filesRecordFromList(files);
      const body = {
        message: userMsg,
        model: "together",
        chatHistory: chatMessages.map(({ role, content }) => ({ role, content })),
        projectContext: {
          files: filesMap,
          currentFile: selected?.path,
          framework: framework.trim() || undefined,
        },
      };
      const res = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        message?: string;
        content?: string;
        fileChanges?: Array<{ filePath: string; newContent?: string; action: string }>;
      };
      if (!res.ok) throw new Error(data.message || "Chat failed");

      let nextList = files;
      const fcs = Array.isArray(data.fileChanges) ? data.fileChanges : [];
      if (fcs.length) {
        const rec = { ...filesMap };
        for (const fc of fcs) {
          if (!fc?.filePath) continue;
          if (fc.action === "delete") delete rec[fc.filePath];
          else if (fc.newContent !== undefined) rec[fc.filePath] = fc.newContent;
        }
        nextList = listFromRecord(rec);
        setFiles(nextList);
        setSelected((prev) => nextList.find((f) => f.path === prev?.path) ?? nextList[0] ?? null);
        setPreviewUrl((prev) => {
          if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return createPreviewUrl(nextList);
        });
      }

      setChatMessages((m) => [...m, { role: "assistant", content: data.content || data.message || "" }]);
    } catch (e) {
      setChatMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "Chat failed" },
      ]);
    } finally {
      setChatLoading(false);
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
          <Sparkles className="w-12 h-12 text-indigo-600" />
          <span>DevMindX</span> <span className="font-[cursive] text-indigo-600 font-light tracking-wide">Generator</span>
        </h1>
        <p className="text-base text-zinc-600 mt-3 max-w-2xl">
          Describe an app; get files and a preview. Matches the legacy{" "}
          <code className="text-xs bg-zinc-100 px-1 rounded">/api/projects/generate</code> flow.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">Project name</label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-app"
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">Framework (optional)</label>
              <input
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="react, next, …"
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">Description / prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm resize-y min-h-[120px]"
              placeholder="E.g. A todo app with dark mode and local storage…"
            />
          </div>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generate project
          </button>
          {savedProjectId && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900 flex flex-wrap items-center gap-2">
              <span>Project saved.</span>
              <Link
                to={`/app/ide?projectId=${encodeURIComponent(savedProjectId)}`}
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 underline-offset-2 hover:underline"
              >
                Open in IDE <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/app/projects"
                className="text-emerald-700 underline-offset-2 hover:underline"
              >
                Projects
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm flex flex-col min-h-[320px]">
          <div className="px-4 py-2 border-b border-zinc-100 text-xs font-medium text-zinc-500">
            Live preview
          </div>
          <iframe
            ref={iframeRef}
            title="preview"
            className="flex-1 w-full min-h-[280px] bg-white"
            src={previewUrl || undefined}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 rounded-2xl border border-zinc-200 bg-white p-3 max-h-[420px] overflow-y-auto">
            <p className="text-xs font-semibold text-zinc-500 px-2 py-1">Files</p>
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setSelected(f)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                      selected?.path === f.path ? "bg-indigo-50 text-indigo-900" : "hover:bg-zinc-50"
                    }`}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-4 min-h-[280px] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {selected?.content ?? "Select a file"}
            </pre>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
          <p className="text-sm font-medium text-zinc-800">AI assistant (project context)</p>
          <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-indigo-700" : "text-zinc-700"}
              >
                <span className="font-semibold capitalize">{m.role}: </span>
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
              placeholder="Ask for changes…"
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={chatLoading}
              onClick={handleChat}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
