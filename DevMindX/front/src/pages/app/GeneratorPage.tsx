import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Send, Sparkles, ExternalLink, Expand, Shrink } from "lucide-react";
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

const TEMPLATES: Record<string, Record<string, string>> = {
  todo: {
    "index.html": `<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center p-6 font-sans">\n  <div id="app" class="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">\n    <div class="flex items-center justify-between mb-8">\n      <h1 class="text-2xl font-black text-white tracking-tight">TASKS</h1>\n      <span class="bg-violet-500/20 text-violet-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-violet-500/30">DevMindX Demo</span>\n    </div>\n    <div class="relative mb-6">\n      <input type="text" id="todo-in" placeholder="What needs to be done?" \n        class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:ring-2 ring-violet-500/50 focus:bg-zinc-800 transition-all">\n    </div>\n    <ul id="todo-list" class="space-y-3"></ul>\n  </div>\n  <script>\n    const input = document.getElementById('todo-in');\n    const list = document.getElementById('todo-list');\n    function addTask(text) {\n      const li = document.createElement('li');\n      li.className = 'bg-zinc-800/40 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center transition-all duration-300';\n      li.innerHTML = '<span class="text-sm font-medium">' + text + '</span><button class="text-zinc-500 hover:text-red-400 font-bold">&times;</button>';\n      li.querySelector('button').onclick = () => li.remove();\n      list.prepend(li);\n    }\n    input.addEventListener('keypress', (e) => {\n      if (e.key === 'Enter' && input.value.trim()) { addTask(input.value.trim()); input.value = ''; }\n    });\n    addTask("Build DevMindX 2.0");\n    addTask("Integrate Real-Time AI");\n  </script>\n</body>\n</html>`
  },
  portfolio: {
    "index.html": `<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-black text-white font-sans selection:bg-cyan-500/30">\n  <nav class="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md px-10 py-5 flex justify-between items-center">\n    <div class="text-xl font-black tracking-tighter text-cyan-400">DEV.P</div>\n    <div class="flex gap-8 text-sm font-medium text-slate-400">\n      <a href="#" class="hover:text-white transition-colors">Work</a>\n      <a href="#" class="hover:text-white transition-colors">About</a>\n      <a href="#" class="hover:text-white transition-colors">Contact</a>\n    </div>\n  </nav>\n  <main class="pt-32 px-10 max-w-5xl mx-auto">\n    <header class="mb-20 space-y-4">\n      <h1 class="text-7xl font-black tracking-tight leading-none mb-6">Building the <span class="text-cyan-400">future</span> of the web.</h1>\n      <p class="text-xl text-slate-400 max-w-2xl leading-relaxed">I am a full-stack engineer obsessed with aesthetics and performance.</p>\n    </header>\n    <section class="grid grid-cols-2 gap-6 pb-20">\n      <div class="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-cyan-400/50 transition-all cursor-pointer">\n        <div class="mb-20 text-xs font-bold text-zinc-500 uppercase tracking-widest">Project 01</div>\n        <h3 class="text-3xl font-bold mb-2">DevMindX IDE</h3>\n        <p class="text-zinc-500">Real-time collaborative workspace.</p>\n      </div>\n      <div class="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-cyan-400/50 transition-all cursor-pointer">\n        <div class="mb-20 text-xs font-bold text-zinc-500 uppercase tracking-widest">Project 02</div>\n        <h3 class="text-3xl font-bold mb-2">Neural Link</h3>\n        <p class="text-zinc-500">AI networking protocol.</p>\n      </div>\n    </section>\n  </main>\n</body>\n</html>`
  },
  react: {
    "index.html": `<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-950 text-white font-sans overflow-x-hidden">\n  <div class="min-h-screen flex flex-col items-center justify-center text-center p-8 relative">\n    <div class="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full"></div>\n    <div class="z-10 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-8">NextGen Platform Preview</div>\n    <h1 class="text-8xl font-black mb-6 tracking-tighter leading-none">DevMindX <span class="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">2.0</span></h1>\n    <p class="text-slate-400 text-xl max-w-xl mb-12 leading-relaxed">Collaborative, intelligent, and real-time. The future of workspace is already here.</p>\n    <div class="flex gap-6">\n      <button class="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-blue-500/40 transform hover:-translate-y-1">Start Building</button>\n      <button class="bg-slate-900 hover:bg-slate-800 text-slate-300 px-10 py-5 rounded-2xl font-black border border-slate-700 transition-all">Documentation</button>\n    </div>\n  </div>\n</body>\n</html>`
  },
  snake: {
    "index.html": `<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n<style>\n  body { background: #050505; color: #fff; overflow: hidden; font-family: 'Inter', sans-serif; }\n  canvas { border: 4px solid #222; box-shadow: 0 0 50px rgba(34,211,238,0.2); border-radius: 20px; }\n  .neon-text { text-shadow: 0 0 10px rgba(34,211,238,0.8); }\n</style>\n</head>\n<body class="flex flex-col items-center justify-center min-h-screen gap-6">\n  <div class="text-center">\n    <h1 class="text-5xl font-black tracking-tighter neon-text text-cyan-400 mb-2">NEON.SNAKE</h1>\n    <div id="score" class="text-xl font-mono text-zinc-500 uppercase tracking-widest">Score: 00</div>\n  </div>\n  <canvas id="game" width="400" height="400"></canvas>\n  <div class="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-zinc-500">Use Arrow Keys to control</div>\n  <script>\n    const canvas = document.getElementById('game');\n    const ctx = canvas.getContext('2d');\n    const scoreEl = document.getElementById('score');\n    let score = 0; let grid = 20; let count = 0;\n    let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };\n    let apple = { x: 320, y: 320 };\n    function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }\n    function loop() {\n      requestAnimationFrame(loop);\n      if (++count < 6) return;\n      count = 0;\n      ctx.clearRect(0,0,canvas.width,canvas.height);\n      snake.x += snake.dx; snake.y += snake.dy;\n      if (snake.x < 0) snake.x = canvas.width - grid; else if (snake.x >= canvas.width) snake.x = 0;\n      if (snake.y < 0) snake.y = canvas.height - grid; else if (snake.y >= canvas.height) snake.y = 0;\n      snake.cells.unshift({x: snake.x, y: snake.y});\n      if (snake.cells.length > snake.maxCells) snake.cells.pop();\n      ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.roundRect(apple.x+2, apple.y+2, grid-4, grid-4, 5); ctx.fill();\n      ctx.fillStyle = '#22d3ee';\n      snake.cells.forEach(function(cell, index) {\n        ctx.beginPath(); ctx.roundRect(cell.x+1, cell.y+1, grid-2, grid-2, 4); ctx.fill();\n        if (cell.x === apple.x && cell.y === apple.y) {\n          snake.maxCells++; score += 10; scoreEl.textContent = 'Score: ' + score.toString().padStart(2, '0');\n          apple.x = getRandomInt(0, 20) * grid; apple.y = getRandomInt(0, 20) * grid;\n        }\n        for (let i = index + 1; i < snake.cells.length; i++) {\n          if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {\n            snake.x = 160; snake.y = 160; snake.cells = [];\n            snake.maxCells = 4; snake.dx = grid; snake.dy = 0;\n            score = 0; scoreEl.textContent = 'Score: 00';\n            apple.x = getRandomInt(0, 20) * grid; apple.y = getRandomInt(0, 20) * grid;\n          }\n        }\n      });\n    }\n    document.addEventListener('keydown', (e) => {\n      if (e.which === 37 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }\n      else if (e.which === 38 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }\n      else if (e.which === 39 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }\n      else if (e.which === 40 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }\n    });\n    requestAnimationFrame(loop);\n  </script>\n</body>\n</html>`
  }
};

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
  const [showFullPreview, setShowFullPreview] = useState(false);
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
      const pLower = prompt.toLowerCase();
      const trigger = Object.keys(TEMPLATES).find(k => pLower.includes(k));
      
      if (trigger) {
        // Mock generation for premium templates
        await new Promise(r => setTimeout(r, 1500)); // simulate thinking
        const templateFiles = TEMPLATES[trigger];
        const list: GeneratedFile[] = Object.entries(templateFiles).map(([path, content]) => ({
            path,
            content,
            language: path.split(".").pop() || "text",
        }));
        
        // Save to DB via real API first to get a projectId
        const saveRes = await fetch(apiUrl("/api/projects/generate"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            name: projectName.trim() || `ai-${trigger}-project`,
            framework: framework.trim() || undefined,
            description: prompt.trim(),
            model: "together",
            withPreview: false, // we will manually set files
          }),
        });
        const saveData = await saveRes.json();
        const pid = saveData.projectId;
        if (pid) setSavedProjectId(pid);

        // Update with our high-end template content
        setFiles(list);
        if (list[0]) setSelected(list[0]);
        setPreviewUrl(createPreviewUrl(list));
        setChatMessages([{ role: "assistant", content: `🚀 **${trigger.toUpperCase()}** Template Activated! Project saved and ready for preview.` }]);
        setIsGenerating(false);
        return;
      }

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

  // Lock body scroll when full-screen preview is open
  useEffect(() => {
    if (showFullPreview) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showFullPreview]);

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
                to={`/app/ide?projectId=${encodeURIComponent(savedProjectId || "")}`}
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
          <div className="px-4 py-2 border-b border-zinc-100 text-xs font-medium text-zinc-500 flex justify-between items-center">
            <span>Live preview</span>
            {previewUrl && (
              <button 
                onClick={() => setShowFullPreview(true)}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-500 font-bold transition-colors"
                title="Open full screen"
              >
                <Expand className="w-3.5 h-3.5" />
                <span>EXPAND</span>
              </button>
            )}
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

      {/* Adaptive Full Screen Preview Overlay - MOVED OUTSIDE motion.div to fix positioning */}
      {showFullPreview && previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-all duration-500 overflow-hidden">
          <div className="w-full h-full flex flex-col bg-white overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Real Browser Header Bar */}
            <div className="flex h-12 shrink-0 items-center justify-between bg-zinc-900 px-6 font-sans border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 cursor-pointer shadow-lg shadow-red-500/20" onClick={() => setShowFullPreview(false)} />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="h-4 w-[1px] bg-zinc-800" />
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">{projectName || "Untitled"}</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-black tracking-tighter uppercase">Production Ready</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex flex-1 mx-24 items-center bg-black/60 border border-zinc-800/50 px-4 py-1.5 rounded-lg">
                 <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono tracking-tight truncate">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    https://devmindx.app/sandbox/preview/{projectName?.toLowerCase().replace(/\s+/g, '-') || 'demo'}
                 </div>
              </div>

              <button
                onClick={() => setShowFullPreview(false)}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-1.5 text-[9px] font-black text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
              >
                <Shrink className="h-3.5 w-3.5" />
                EXIT PREVIEW
              </button>
            </div>
            
            <div className="flex-1 w-full bg-white relative">
               <iframe
                title="Full Project Preview"
                src={previewUrl}
                className="absolute inset-0 w-full h-full border-none"
                sandbox="allow-scripts allow-modals allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
