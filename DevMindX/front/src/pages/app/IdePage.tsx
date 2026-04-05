import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Bug,
  ChevronDown,
  ChevronRight,
  Code2,
  Container,
  Copy,
  FileText,
  FileIcon,
  FilePlus,
  FolderPlus,
  GitBranch,
  History,
  Keyboard,
  LayoutTemplate,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  SaveAll,
  Sparkles,
  Terminal,
  Upload,
  Users,
  Video,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useIdeCollaboration, type CollabUser } from "@/hooks/useIdeCollaboration";
import { IdeWhiteboardModal, EMPTY_WHITEBOARD } from "@/components/ide/IdeWhiteboardModal";
import { IdeModelPurchaseModal } from "@/components/ide/IdeModelPurchaseModal";
import { IdeMeetNotes } from "@/components/ide/IdeMeetNotes";
import { IdeVideoCall } from "@/components/ide/IdeVideoCall";

const DARK_CHROME = {
  bg: "#1e1e1e",
  sidebar: "#252526",
  border: "#3c3c3c",
  text: "#cccccc",
  textHi: "#e0e0e0",
  accent: "#569cd6",
};

const LIGHT_CHROME = {
  bg: "#ffffff",
  sidebar: "#f3f3f3",
  border: "#e5e5e5",
  text: "#333333",
  textHi: "#000000",
  accent: "#007acc",
};

/** Monaco options aligned with VS Code–style editing */
const MONACO_OPTIONS = {
  automaticLayout: true,
  fontSize: 14,
  fontFamily: "Consolas, 'Cascadia Code', 'Courier New', monospace",
  lineHeight: 22,
  lineNumbers: "on" as const,
  glyphMargin: true,
  folding: true,
  renderLineHighlight: "all" as const,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  minimap: { enabled: true, scale: 0.85 },
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    vertical: "auto" as const,
    horizontal: "auto" as const,
  },
  bracketPairColorization: { enabled: true },
  padding: { top: 8, bottom: 8 },
  wordWrap: "on" as const,
  tabSize: 2,
  insertSpaces: true,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on" as const,
  formatOnPaste: true,
  mouseWheelZoom: true,
  contextmenu: true,
};

function langFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    md: "markdown",
    py: "python",
    rs: "rust",
    go: "go",
  };
  return map[ext] || "plaintext";
}

type FileChangePayload = {
  filePath: string;
  newContent?: string;
  action: string;
};

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  fileChanges?: FileChangePayload[];
};

type IdeModelRow = {
  id: string;
  label: string;
  unlocked: boolean;
  priceInr: number;
  free?: boolean;
};

const FALLBACK_MODEL_ROWS: IdeModelRow[] = [
  { id: "together", label: "Together AI", unlocked: true, priceInr: 0, free: true },
  { id: "gemini", label: "Google Gemini", unlocked: false, priceInr: 749 },
  { id: "deepseek", label: "DeepSeek", unlocked: false, priceInr: 1125 },
  { id: "claude", label: "Claude", unlocked: false, priceInr: 1299 },
  { id: "chatgpt", label: "ChatGPT", unlocked: false, priceInr: 1499 },
];

function getPreviewHtml(files: Record<string, string>): string {
  if (!files["index.html"]) return "";
  let html = files["index.html"];

  // Find any potential JS/CSS files to inject if it's a simple project
  const jsCode = files["App.tsx"] || files["App.jsx"] || files["index.js"] || "";
  const cssCode = files["index.css"] || files["style.css"] || "";

  if (jsCode) {
    // Basic shim for React components in a raw HTML preview (demo only)
    if (jsCode.includes("export default") || jsCode.includes("React")) {
      // We can't really run real React here without a bundler, but we can search for a mock if we provided one
    } else {
      html = html.replace("</body>", `<script>${jsCode}<\/script></body>`);
    }
  }
  if (cssCode) {
    const tag = html.includes("</head>") ? "</head>" : "<body>";
    html = html.replace(tag, `<style>${cssCode}<\/style>${tag}`);
  }
  return html;
}

const PROJECT_TEMPLATES: Record<string, { name: string; files: Record<string, string>; message: string }> = {
  "todo": {
    name: "Todo Application",
    files: {
      "index.html": `<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center p-6 font-sans">
  <div id="app" class="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-black text-white tracking-tight">TASKS</h1>
      <span class="bg-violet-500/20 text-violet-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-violet-500/30">DevMindX Demo</span>
    </div>
    <div class="relative mb-6">
      <input type="text" id="todo-in" placeholder="What needs to be done?" 
        class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:ring-2 ring-violet-500/50 focus:bg-zinc-800 transition-all">
    </div>
    <ul id="todo-list" class="space-y-3"></ul>
  </div>
  <script>
    const input = document.getElementById('todo-in');
    const list = document.getElementById('todo-list');
    function addTask(text) {
      const li = document.createElement('li');
      li.className = 'bg-zinc-800/40 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center transition-all duration-300';
      li.innerHTML = '<span class="text-sm font-medium">' + text + '</span><button class="text-zinc-500 hover:text-red-400 font-bold">&times;</button>';
      li.querySelector('button').onclick = () => li.remove();
      list.prepend(li);
    }
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) { addTask(input.value.trim()); input.value = ''; }
    });
    addTask("Build DevMindX 2.0");
    addTask("Integrate Real-Time AI");
  </script>
</body>
</html>`
    },
    message: "✅ **Task Master Template Generated!**\n\nI've prepared a simple, responsive Todo app for you. Check the **PREVIEW** tab to see your code running!"
  },
  "portfolio": {
    name: "Developer Portfolio",
    files: {
      "index.html": `<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white font-sans selection:bg-cyan-500/30">
  <nav class="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md px-10 py-5 flex justify-between items-center">
    <div class="text-xl font-black tracking-tighter text-cyan-400">DEV.P</div>
    <div class="flex gap-8 text-sm font-medium text-slate-400">
      <a href="#" class="hover:text-white transition-colors">Work</a>
      <a href="#" class="hover:text-white transition-colors">About</a>
      <a href="#" class="hover:text-white transition-colors">Contact</a>
    </div>
  </nav>

  <main class="pt-32 px-10 max-w-5xl mx-auto">
    <header class="mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
      <h1 class="text-7xl font-black tracking-tight leading-none mb-6">Building the <span class="text-cyan-400">future</span> of the web.</h1>
      <p class="text-xl text-slate-400 max-w-2xl leading-relaxed">I am a full-stack engineer and designer obsessed with performance, aesthetics, and user experience.</p>
    </header>

    <section class="grid grid-cols-2 gap-6 pb-20">
      <div class="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-cyan-400/50 transition-all cursor-pointer">
        <div class="mb-20 text-xs font-bold text-zinc-500 uppercase tracking-widest">Project 01</div>
        <h3 class="text-3xl font-bold mb-2">DevMindX IDE</h3>
        <p class="text-zinc-500">Real-time collaborative coding environment.</p>
      </div>
      <div class="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-cyan-400/50 transition-all cursor-pointer">
        <div class="mb-20 text-xs font-bold text-zinc-500 uppercase tracking-widest">Project 02</div>
        <h3 class="text-3xl font-bold mb-2">Neural Link</h3>
        <p class="text-zinc-500">AI-powered networking protocol.</p>
      </div>
    </section>
  </main>
</body>
</html>`
    },
    message: "🎨 **Portfolio Template Generated!**\n\nYour professional developer portfolio is ready. Check the **PREVIEW** tab to see your new site!"
  },
  "react": {
    name: "React Landing Page",
    files: {
      "index.html": `<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; background: #0f172a; color: white; }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-950">
        <div class="flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-400">
           ✨ <span class="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">v2.0 PREVIEW</span>
        </div>
        <h1 class="text-6xl font-black mb-6 text-white tracking-tighter sm:text-7xl">DevMindX <span class="text-blue-500">2.0</span></h1>
        <p class="text-slate-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">Modernize your engineering workflow with fully collaborative, AI-integrated sandboxes.</p>
        <div class="flex gap-4">
          <button class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/30">Connect Your Team</button>
          <button class="bg-slate-900 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-2xl font-bold transition-all border border-slate-800">Learn More</button>
        </div>
      </div>
    </div>
  </body>
</html>`
    },
    message: "🚀 **React Landing Page Template Generated!**\n\nI've created the core files for a modern landing page. Switch to the **PREVIEW** tab to see the live results!"
  },
  "snake": {
    name: "Neon Snake Game",
    files: {
      "index.html": `<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background: #050505; color: #fff; overflow: hidden; font-family: 'Inter', sans-serif; }
  canvas { border: 4px solid #222; box-shadow: 0 0 50px rgba(34,211,238,0.2); border-radius: 20px; }
  .neon-text { text-shadow: 0 0 10px rgba(34,211,238,0.8); }
</style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen gap-6">
  <div class="text-center">
    <h1 class="text-5xl font-black tracking-tighter neon-text text-cyan-400 mb-2">NEON.SNAKE</h1>
    <div id="score" class="text-xl font-mono text-zinc-500 uppercase tracking-widest">Score: 00</div>
  </div>
  
  <canvas id="game" width="400" height="400"></canvas>
  
  <div class="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-zinc-500">
    Use <span class="text-cyan-400">Arrow Keys</span> to control
  </div>

  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    
    let score = 0;
    let grid = 20;
    let count = 0;
    
    let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
    let apple = { x: 320, y: 320 };

    function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

    function loop() {
      requestAnimationFrame(loop);
      if (++count < 6) return;
      count = 0;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      snake.x += snake.dx;
      snake.y += snake.dy;

      if (snake.x < 0) snake.x = canvas.width - grid;
      else if (snake.x >= canvas.width) snake.x = 0;
      if (snake.y < 0) snake.y = canvas.height - grid;
      else if (snake.y >= canvas.height) snake.y = 0;

      snake.cells.unshift({x: snake.x, y: snake.y});
      if (snake.cells.length > snake.maxCells) snake.cells.pop();

      // Apple
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(apple.x+2, apple.y+2, grid-4, grid-4, 5);
      ctx.fill();

      // Snake
      ctx.fillStyle = '#22d3ee';
      snake.cells.forEach(function(cell, index) {
        ctx.beginPath();
        ctx.roundRect(cell.x+1, cell.y+1, grid-2, grid-2, 4);
        ctx.fill();

        if (cell.x === apple.x && cell.y === apple.y) {
          snake.maxCells++;
          score += 10;
          scoreEl.textContent = 'Score: ' + score.toString().padStart(2, '0');
          apple.x = getRandomInt(0, 20) * grid;
          apple.y = getRandomInt(0, 20) * grid;
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
          if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
            snake.x = 160; snake.y = 160; snake.cells = [];
            snake.maxCells = 4; snake.dx = grid; snake.dy = 0;
            score = 0; scoreEl.textContent = 'Score: 00';
            apple.x = getRandomInt(0, 20) * grid;
            apple.y = getRandomInt(0, 20) * grid;
          }
        }
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.which === 37 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
      else if (e.which === 38 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
      else if (e.which === 39 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
      else if (e.which === 40 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
    });

    requestAnimationFrame(loop);
  </script>
</body>
</html>`
    },
    message: "🐍 **Neon Snake Game Generated!**\n\nI've built a high-performance arcade classic for you. Open the **PREVIEW** tab and use your arrow keys to play!"
  }
};

function stripFenceInner(raw: string): string {
  let s = raw.replace(/^\n/, "").replace(/\n$/, "");
  const lines = s.split("\n");
  const first = lines[0]?.trim() ?? "";
  const pathFromComment = first.startsWith("//")
    ? first.replace(/^\/\/\s*/, "").trim()
    : "";
  if (pathFromComment && /\.[\w]+$/.test(pathFromComment)) {
    return lines.slice(1).join("\n").replace(/^\n/, "");
  }
  if (
    /^(typescript|tsx|javascript|jsx|json|css|html|python|rust|go|bash|shell|plaintext|markdown)\s*$/i.test(
      first,
    )
  ) {
    return lines.slice(1).join("\n").replace(/^\n/, "");
  }
  return s;
}

function FormattedChatContent({
  text,
  activePath,
  onApplySnippet,
  isLight = false,
}: {
  text: string;
  activePath: string | null;
  onApplySnippet: (code: string) => void;
  isLight?: boolean;
}) {
  const parts = text.split("```");
  return (
    <div className="space-y-2">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <div key={i} className={`space-y-1.5 rounded border p-2 ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-[#1a1a1a] border-[#474747]"}`}>
            <pre className={`max-h-52 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed ${isLight ? "text-violet-900" : "text-[#dcdcaa]"}`}>
              {stripFenceInner(part)}
            </pre>
            <button
              type="button"
              disabled={!activePath}
              title={activePath ? `Replace ${activePath} with this code` : "Select a file in the tree first"}
              onClick={() => onApplySnippet(stripFenceInner(part))}
              className="w-full rounded-md border border-violet-500/50 bg-violet-600/20 px-2 py-1.5 text-[11px] font-semibold text-violet-200 hover:bg-violet-600/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activePath ? `Apply to ${activePath}` : "Apply to current file (select a file first)"}
            </button>
          </div>
        ) : (
          <p key={i} className="whitespace-pre-wrap break-words text-[#ccc]">
            {part}
          </p>
        ),
      )}
    </div>
  );
}

function ToolBtn({
  children,
  className = "",
  title,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium text-[#d4d4d4] transition-colors hover:bg-white/5 ${className}`}
    >
      {children}
    </button>
  );
}

function groupPaths(paths: string[]) {
  const folders: Record<string, string[]> = {};
  const root: string[] = [];
  for (const p of paths) {
    const i = p.indexOf("/");
    if (i === -1) root.push(p);
    else {
      const folder = p.slice(0, i);
      if (!folders[folder]) folders[folder] = [];
      folders[folder].push(p);
    }
  }
  Object.values(folders).forEach((arr) => arr.sort());
  root.sort();
  return { folders, root };
}
function CollabPanel({
  open,
  onClose,
  sessionId,
  connected,
  users,
  hostId,
  isAdmin,
  onEndSession,
  onLeaveSession,
  chrome,
}: {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  connected: boolean;
  users: CollabUser[];
  hostId: string | null;
  isAdmin?: boolean;
  onEndSession?: () => void;
  onLeaveSession?: () => void;
  chrome: any;
}) {
  if (!open) return null;
  const shareUrl = `${window.location.origin}/app/ide?session=${encodeURIComponent(sessionId)}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" role="dialog">
      <div
        className="w-full max-w-md rounded-xl border p-4 shadow-2xl"
        style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#e0e0e0]">Live collaboration</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-2 text-[11px] text-[#888]">
          Socket status:{" "}
          <span className={connected ? "text-emerald-400" : "text-amber-400"}>
            {connected ? "connected" : "disconnected (log in or check API)"}
          </span>
        </p>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[#666]">Meet Code / Session</p>
        <code className="mb-3 block rounded bg-[#1e1e1e] px-2 py-1.5 text-[11px] text-[#aaa]">{sessionId}</code>
        <button
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/40 py-2 text-xs text-violet-200 hover:bg-violet-500/10"
          onClick={() => {
            void navigator.clipboard.writeText(shareUrl);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy invite link
        </button>
        <p className="mb-2 text-[10px] uppercase tracking-wide text-[#666]">People in session</p>
        <ul className="max-h-40 space-y-1.5 overflow-y-auto text-[12px]">
          {users.length === 0 ? (
            <li className="text-[#666]">No one else yet — share the link.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: u.color }} />
                <span className="text-[#ccc]">
                  {u.username}
                  {u.id === hostId && <span className="ml-2 text-[10px] font-semibold text-amber-500">(Admin)</span>}
                </span>
              </li>
            ))
          )}
        </ul>
        <p className="mt-3 text-[10px] leading-relaxed text-[#555]">
          Editor changes sync both ways. Open the same meet code (or use the link) in another browser while logged in.
        </p>

        <div className="mt-4 pt-3 border-t flex flex-col gap-2" style={{ borderColor: chrome.border }}>
          {onLeaveSession && (
            <button
              type="button"
              className="w-full rounded-lg border border-[#444] py-2 text-xs font-semibold text-[#ddd] hover:bg-white/5"
              onClick={onLeaveSession}
            >
              Leave Meet
            </button>
          )}

          {isAdmin && onEndSession && (
            <button
              type="button"
              className="w-full rounded-lg bg-red-500/20 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/30"
              onClick={onEndSession}
            >
              End Meet for Everyone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function IdePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");
  const sessionFromUrl = searchParams.get("session");

  const { user, isAuthenticated, token } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const chrome = useMemo(() => (theme === "dark" ? DARK_CHROME : LIGHT_CHROME), [theme]);
  const uploadRef = useRef<HTMLInputElement>(null);

  const sessionId = sessionFromUrl || `ide-${projectId || "scratch"}`;

  const [loading, setLoading] = useState(Boolean(projectId));
  const [projectName, setProjectName] = useState("Untitled");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activePath, setActivePath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set(["src"]));
  const [bottomTab, setBottomTab] = useState<"terminal" | "debug" | "preview">(() => {
    const t = searchParams.get("tab");
    if (t === "preview" || t === "debug") return t as any;
    return "terminal";
  });
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "DevMindX Interactive Terminal.",
    "Type commands and press Enter. Try: run, clear",
    "$ ",
  ]);
  const [termInput, setTermInput] = useState("");
  const [modelRows, setModelRows] = useState<IdeModelRow[]>(FALLBACK_MODEL_ROWS);
  const [model, setModel] = useState("together");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState<{
    id: string;
    label: string;
    priceInr: number;
  } | null>(null);
  const [ollamaHint, setOllamaHint] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [whiteboardSnap, setWhiteboardSnap] = useState(EMPTY_WHITEBOARD);
  const [notesOpen, setNotesOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Chat History
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatHistoryList, setChatHistoryList] = useState<any[]>([]);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const termDragRef = useRef<{ y: number; h: number } | null>(null);

  const [chatWidth, setChatWidth] = useState(320);
  const chatDragRef = useRef<{ x: number; w: number } | null>(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const onWhiteboardRemote = useCallback((json: string) => {
    setWhiteboardSnap(!json || json.length === 0 ? EMPTY_WHITEBOARD : json);
  }, []);

  const paths = useMemo(() => Object.keys(files).sort(), [files]);
  const { folders, root } = useMemo(() => groupPaths(paths), [paths]);

  const {
    connected: collabConnected,
    users: collabUsers,
    hostId,
    panelOpen: collabPanelOpen,
    setPanelOpen: setCollabPanelOpen,
    scheduleCodeSync,
    broadcastFileCreate,
    emitFileOpen,
    emitWhiteboardUpdate,
    socketRef,
  } = useIdeCollaboration({
    sessionId,
    userId: user?.id,
    enabled: isAuthenticated,
    setFiles,
    onWhiteboardData: onWhiteboardRemote,
  });

  const commitWhiteboard = useCallback(
    (json: string) => {
      setWhiteboardSnap(json);
      emitWhiteboardUpdate(json);
    },
    [emitWhiteboardUpdate],
  );

  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/projects/${id}`), { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load project");
      const project = await res.json();
      setProjectName(project.name || "Project");
      const f: Record<string, string> = project.files || {};
      setFiles(f);
      const keys = Object.keys(f).sort();
      setActivePath(keys[0] ?? null);
      const roots = new Set(keys.map((k) => k.split("/")[0]).filter(Boolean));
      setExpandedFolders((prev) => new Set([...prev, ...roots]));
    } catch {
      setFiles({});
      setActivePath(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) loadProject(projectId);
    else {
      setLoading(false);
      setFiles({});
      setActivePath(null);
      setProjectName("Scratch pad");
    }
  }, [projectId, loadProject]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(apiUrl("/api/ide/ai/history"), { headers: authHeaders() });
        if (res.ok) {
          const list = await res.json();
          setChatHistoryList(list);
          if (list.length > 0) {
            setChatSessionId(list[0].id);
            setAiMessages(list[0].messages || []);
          }
        }
      } catch (e) { }
    };
    fetchHistory();
  }, [isAuthenticated]);

  const startNewChat = () => {
    setChatSessionId(null);
    setAiMessages([]);
    setHistoryMenuOpen(false);
  };

  const loadIdeModels = useCallback(async (): Promise<IdeModelRow[]> => {
    let result = FALLBACK_MODEL_ROWS;
    try {
      const res = await fetch(apiUrl("/api/ide/models"), { headers: authHeaders() });
      if (!res.ok) return result;
      const data = await res.json();
      const opts: IdeModelRow[] = Array.isArray(data.routingOptions)
        ? data.routingOptions.map(
          (r: {
            id: string;
            label: string;
            unlocked?: boolean;
            priceInr?: number;
            free?: boolean;
          }) => ({
            id: r.id,
            label: r.label,
            unlocked: Boolean(r.unlocked ?? r.free),
            priceInr: typeof r.priceInr === "number" ? r.priceInr : 0,
            free: Boolean(r.free),
          }),
        )
        : [];
      result = opts.length ? opts : FALLBACK_MODEL_ROWS;
      setModelRows(result);
      if (data.useOllama && data.defaultOllamaModel) {
        setOllamaHint(`Ollama: ${data.defaultOllamaModel} @ ${data.ollamaBaseUrl || "http://localhost:11434"}`);
      } else {
        setOllamaHint(data.useOllama ? null : "Ollama not detected — set USE_OLLAMA=true or start Ollama.");
      }
    } catch {
      /* ignore */
    }
    return result;
  }, [token]);

  useEffect(() => {
    void loadIdeModels();
  }, [loadIdeModels]);

  useEffect(() => {
    if (!isAuthenticated) setModel("together");
  }, [isAuthenticated]);

  /** After pricing checkout, select the newly unlocked model once lists refresh. */
  useEffect(() => {
    const st = location.state as { unlockedModel?: string } | null;
    const id = st?.unlockedModel;
    if (!id) return;
    navigate(".", { replace: true, state: null });
    void (async () => {
      const rows = await loadIdeModels();
      if (rows.some((r) => r.id === id && r.unlocked)) setModel(id);
    })();
  }, [location.state, loadIdeModels, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && whiteboardOpen) {
        e.preventDefault();
        setWhiteboardOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [whiteboardOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [paletteOpen]);

  useEffect(() => {
    if (activePath) emitFileOpen(activePath);
  }, [activePath, emitFileOpen]);

  const content = activePath ? files[activePath] ?? "" : "";
  const language = useMemo(() => (activePath ? langFromPath(activePath) : "plaintext"), [activePath]);

  const onEdit = (value: string | undefined) => {
    if (!activePath || value === undefined) return;
    setFiles((prev) => ({ ...prev, [activePath]: value }));
    scheduleCodeSync(activePath, value);
  };

  const appendTerminal = useCallback((line: string) => {
    setTerminalLines((prev) => [...prev.slice(0, -1), line, "$ "]);
  }, []);

  const runCode = async () => {
    if (!activePath || !content.trim()) {
      appendTerminal("(no file or empty buffer)");
      return;
    }
    appendTerminal(`> run ${activePath} (${language})`);
    try {
      const res = await fetch(apiUrl("/api/ide/execute"), {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          code: content,
          language,
          filename: activePath.split("/").pop(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        appendTerminal(`Error: ${data.error || res.statusText}`);
        return;
      }
      if (data.output) appendTerminal(String(data.output));
      if (data.error) appendTerminal(`stderr: ${data.error}`);
      appendTerminal(`exit ${data.exitCode ?? "?"}`);
    } catch (e) {
      appendTerminal(`Request failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const applyFileChange = (fc: FileChangePayload) => {
    if (fc.action === "delete") {
      setFiles((prev) => {
        const n = { ...prev };
        delete n[fc.filePath];
        return n;
      });
      if (activePath === fc.filePath) setActivePath(null);
      return;
    }
    setFiles((prev) => ({ ...prev, [fc.filePath]: fc.newContent ?? "" }));
    setActivePath(fc.filePath);
    broadcastFileCreate(fc.filePath, fc.newContent ?? "");
  };

  const applySnippetToActive = useCallback(
    (code: string) => {
      if (!activePath) return;
      const next = code.trimEnd();
      setFiles((prev) => ({ ...prev, [activePath]: next }));
      scheduleCodeSync(activePath, next);
    },
    [activePath, scheduleCodeSync],
  );

  const sendAi = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;

    // Check for fuzzy match template triggers (e.g. "create react", "portfolio app", "snake game")
    const tLower = text.toLowerCase();
    const trigger = Object.keys(PROJECT_TEMPLATES).find(k => {
      // Check for exact key or common synonyms
      if (tLower.includes(k)) return true;
      if (k === "snake" && tLower.includes("game")) return true;
      if (k === "react" && (tLower.includes("landing") || tLower.includes("website"))) return true;
      if (k === "todo" && tLower.includes("tasks")) return true;
      return false;
    });

    if (trigger) {
      const template = PROJECT_TEMPLATES[trigger];
      const userMsg: AIMessage = { id: `u-${Date.now()}`, role: "user", content: text, ts: Date.now() };
      const assistantMsg: AIMessage = { id: `a-${Date.now()}`, role: "assistant", content: template.message, ts: Date.now() };
      setAiInput("");
      setAiMessages((m) => [...m, userMsg, assistantMsg]);

      const newFiles = { ...files };
      Object.entries(template.files).forEach(([path, content]) => {
        newFiles[path] = content;
        // Persistence: trigger code sync for each file to save to DB
        scheduleCodeSync(path, content);
      });
      setFiles(newFiles);
      setBottomTab("preview");

      Object.entries(template.files).forEach(([path, content]) => {
        broadcastFileCreate(path, content);
      });
      return;
    }

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setAiInput("");
    setAiMessages((m) => [...m, userMsg]);
    setAiLoading(true);

    const fullCurrentMessages = [...aiMessages, userMsg];
    const apiHistory = fullCurrentMessages.map((x) => ({ role: x.role, content: x.content }));

    try {
      const res = await fetch(apiUrl("/api/ide/ai/chat"), {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiHistory,
          model,
          context: activePath || undefined,
          filesSnapshot: files,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.error || "AI request failed.",
            ts: Date.now(),
          },
        ]);
        return;
      }
      const fcs: FileChangePayload[] = Array.isArray(data.fileChanges) ? data.fileChanges : [];
      const assistantMsg: AIMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response || "(empty response)",
        ts: Date.now(),
        fileChanges: fcs.length ? fcs : undefined,
      };
      const finalMessages = [...fullCurrentMessages, assistantMsg];
      setAiMessages(finalMessages);

      try {
        const resHist = await fetch(apiUrl("/api/ide/ai/history"), {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            id: chatSessionId,
            projectId: projectId || "ide-scratch",
            messages: finalMessages,
          }),
        });
        if (resHist.ok) {
          const saved = await resHist.json();
          if (!chatSessionId) {
            setChatSessionId(saved.id);
            setChatHistoryList((prev) => [saved, ...prev]);
          } else {
            setChatHistoryList((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
          }
        }
      } catch (err) { }
    } catch (e) {
      setAiMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: e instanceof Error ? e.message : "Network error",
          ts: Date.now(),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const onTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = termInput.trim().toLowerCase();
    if (!cmd) return;
    setTerminalLines((prev) => [...prev.slice(0, -1), `$ ${termInput}`, "$ "]);
    setTermInput("");
    if (cmd === "clear") {
      setTerminalLines(["$ "]);
      return;
    }
    if (cmd === "run") {
      void runCode();
    }
  };

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const createNewFile = () => {
    const p = window.prompt("New file path (e.g. src/App.tsx)", "src/newfile.ts");
    if (!p?.trim()) return;
    const path = p.trim().replace(/\\/g, "/");
    setFiles((prev) => ({ ...prev, [path]: prev[path] ?? "" }));
    setActivePath(path);
    broadcastFileCreate(path, "");
    const seg = path.split("/")[0];
    if (seg) setExpandedFolders((e) => new Set([...e, seg]));
  };

  const createNewFolder = () => {
    const d = window.prompt("Folder path (e.g. src/components)", "src/components");
    if (!d?.trim()) return;
    const base = d.trim().replace(/\\/g, "/").replace(/\/$/, "");
    const path = `${base}/.gitkeep`;
    setFiles((prev) => ({ ...prev, [path]: "" }));
    setActivePath(path);
    broadcastFileCreate(path, "");
    const firstSeg = base.split("/").filter(Boolean)[0];
    if (firstSeg) setExpandedFolders((e) => new Set([...e, firstSeg]));
  };

  const onUploadPick = () => uploadRef.current?.click();

  const onUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    Array.from(list).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const path = `uploads/${file.name.replace(/^.*[\\/]/, "")}`;
        setFiles((prev) => ({ ...prev, [path]: text }));
        broadcastFileCreate(path, text);
        setActivePath(path);
      };
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const checkDocker = async () => {
    try {
      const res = await fetch(apiUrl("/api/ide/sandbox/status"));
      const data = await res.json().catch(() => ({}));
      appendTerminal(`[Docker/sandbox] ${JSON.stringify(data)}`);
    } catch {
      appendTerminal("[Docker/sandbox] request failed");
    }
  };

  const joinSessionFromPrompt = () => {
    const id = window.prompt("Enter Meet Code to join an existing session (or paste from host):", sessionId);
    if (!id?.trim()) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("session", id.trim());
      return next;
    });
  };

  return (
    <div
      className="fixed inset-x-0 top-14 bottom-0 z-20 flex flex-col text-[13px] antialiased"
      style={{ backgroundColor: chrome.bg, color: chrome.text }}
    >
      <input
        ref={uploadRef}
        type="file"
        multiple
        className="hidden"
        accept=".ts,.tsx,.js,.jsx,.json,.md,.html,.css,.py,.txt"
        onChange={onUploadChange}
      />

      <CollabPanel
        open={collabPanelOpen}
        onClose={() => setCollabPanelOpen(false)}
        sessionId={sessionId}
        connected={collabConnected}
        users={collabUsers}
        hostId={hostId}
        isAdmin={hostId === String(user?.id)}
        onEndSession={() => {
          socketRef.current?.emit('end-session');
          appendTerminal("[Collab] Ended meet for everyone.");
        }}
        onLeaveSession={() => {
          window.location.href = window.location.pathname;
        }}
        chrome={chrome}
      />

      <IdeWhiteboardModal
        open={whiteboardOpen}
        onClose={() => setWhiteboardOpen(false)}
        snapshot={whiteboardSnap}
        onCommit={commitWhiteboard}
        chrome={chrome}
      />

      <IdeMeetNotes
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        socket={socketRef.current}
        chrome={chrome}
      />

      <IdeVideoCall
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        socket={socketRef.current}
        sessionId={sessionId}
        user={user ? { id: user.id.toString(), username: user.username || "User" } : null}
        chrome={chrome}
      />

      <header
        className="flex h-10 shrink-0 items-center justify-between gap-2 border-b px-2 sm:px-3"
        style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="hidden font-semibold sm:inline" style={{ color: chrome.textHi }}>
            DevMindX IDE
          </span>
          <Code2 className="h-4 w-4 shrink-0 text-cyan-400 sm:hidden" aria-hidden />

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center rounded-lg border p-1 opacity-80 hover:opacity-100 transition-all hover:bg-white/5"
            style={{ borderColor: chrome.border }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-indigo-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] text-[#aaa] hover:bg-white/5 md:inline-flex"
            style={{ borderColor: chrome.border }}
            title="Command Palette (⌘K)"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Palette
            <span className="rounded bg-[#3c3c3c] px-1 font-mono text-[10px]">⌘K</span>
          </button>
        </div>
        <div className="flex max-w-[65vw] items-center gap-1 overflow-x-auto py-1 sm:max-w-none md:gap-1.5">
          <ToolBtn title="Docker / sandbox status" className="border-blue-500/35 text-orange-300" onClick={() => void checkDocker()}>
            <Container className="h-3.5 w-3.5 text-sky-400" />
            Docker
          </ToolBtn>
          <ToolBtn title="Upload files" className="border-sky-500/40" onClick={onUploadPick}>
            <Upload className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">Upload</span>
          </ToolBtn>
          <ToolBtn title="Git (use collaboration + save flows)" className="border-emerald-500/40" onClick={() => appendTerminal("[Git] Use your repo locally; collab syncs open session files.")}>
            <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Git</span>
          </ToolBtn>
          <ToolBtn
            title="Collaborative whiteboard (same session)"
            className="border-amber-500/40"
            onClick={() => {
              if (!isAuthenticated) {
                appendTerminal("[Whiteboard] Log in to sync with your session.");
                return;
              }
              setWhiteboardOpen(true);
            }}
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden lg:inline">Whiteboard</span>
          </ToolBtn>
          <ToolBtn title="Video Call" className="border-rose-500/35" onClick={() => {
            if (!isAuthenticated) return appendTerminal("[Video] Log in to join video call.");
            setVideoOpen(true);
          }}>
            <Video className="h-3.5 w-3.5 text-rose-300" />
            <span className="hidden lg:inline">Video</span>
          </ToolBtn>
          <ToolBtn title="Meet Notes" className="border-fuchsia-500/35" onClick={() => {
            if (!isAuthenticated) return appendTerminal("[Notes] Log in to view meeting notes.");
            setNotesOpen(true);
          }}>
            <FileText className="h-3.5 w-3.5 text-fuchsia-300" />
            <span className="hidden lg:inline">Notes</span>
          </ToolBtn>
          <ToolBtn title="AI" className="border-violet-500/40" onClick={() => document.getElementById("ide-ai-input")?.focus()}>
            <Lightbulb className="h-3.5 w-3.5 text-violet-300" />
            AI
          </ToolBtn>
          <ToolBtn title="Join another session" className="border-sky-500/35" onClick={joinSessionFromPrompt}>
            <History className="h-3.5 w-3.5 text-sky-300" />
            <span className="hidden xl:inline">Session</span>
          </ToolBtn>
          <ToolBtn title="Collaboration" className="border-purple-500/40" onClick={() => setCollabPanelOpen(true)}>
            <Users className="h-3.5 w-3.5 text-purple-300" />
            <span className="hidden xl:inline">Collaborate</span>
            {collabConnected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="connected" />}
          </ToolBtn>
          <ToolBtn title="Save (local workspace)" className="border-emerald-500/45" onClick={() => appendTerminal("[Save] Workspace kept in this tab; use Projects API to persist.")}>
            <Save className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </ToolBtn>
          <button
            type="button"
            title="Run code"
            onClick={() => void runCode()}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Run Code</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className="flex max-h-40 w-full shrink-0 flex-col border-b lg:max-h-none lg:w-56 xl:w-60 lg:border-b-0 lg:border-r"
          style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
        >
          <div
            className="flex h-9 items-center justify-between border-b px-2 text-[11px] font-bold tracking-wide"
            style={{ borderColor: chrome.border, color: "#bbb" }}
          >
            <span>EXPLORER</span>
            <div className="flex items-center gap-0.5">
              <button type="button" className="rounded p-1 hover:bg-white/10" title="New File" onClick={createNewFile}>
                <FilePlus className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded p-1 hover:bg-white/10" title="New Folder" onClick={createNewFolder}>
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="rounded p-1 hover:bg-white/10"
                title="Refresh"
                onClick={() => projectId && loadProject(projectId)}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button type="button" className="rounded p-1 hover:bg-white/10" title="Save All" onClick={() => appendTerminal("[Save all] — persist via Projects when wired.")}>
                <SaveAll className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex justify-center py-6 text-[#888]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : paths.length === 0 ? (
              <p className="px-1 text-[11px] leading-relaxed text-[#888]">
                No files. Use <strong className="text-[#aaa]">New File</strong>, <strong>Upload</strong>, or open a project from{" "}
                <strong className="text-[#aaa]">Projects</strong>.
              </p>
            ) : (
              <ul className="space-y-0.5 text-[12px]">
                {root.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => setActivePath(p)}
                      className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left ${activePath === p ? "bg-[#37373d] text-white" : "hover:bg-white/5"
                        }`}
                    >
                      <FileIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{p}</span>
                    </button>
                  </li>
                ))}
                {Object.keys(folders)
                  .sort()
                  .map((folder) => (
                    <li key={folder}>
                      <button
                        type="button"
                        onClick={() => toggleFolder(folder)}
                        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-white/5"
                      >
                        {expandedFolders.has(folder) ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                        )}
                        <span className="font-medium text-[#ccc]">{folder}</span>
                      </button>
                      {expandedFolders.has(folder) && (
                        <ul className="ml-4 border-l border-[#3c3c3c] pl-1">
                          {folders[folder].map((p) => (
                            <li key={p}>
                              <button
                                type="button"
                                onClick={() => setActivePath(p)}
                                className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left ${activePath === p ? "bg-[#37373d] text-white" : "hover:bg-white/5"
                                  }`}
                              >
                                <FileIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <span className="truncate">{p.slice(folder.length + 1)}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="border-t px-2 py-1 text-[10px] text-[#666]" style={{ borderColor: chrome.border }}>
            {projectName} · {sessionId}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="flex h-9 shrink-0 items-end gap-px border-b px-1 pt-1"
            style={{ backgroundColor: theme === 'dark' ? "#2d2d2d" : "#f3f3f3", borderColor: chrome.border }}
          >
            {activePath ? (
              <div
                className="flex max-w-[min(100%,28rem)] items-center gap-2 rounded-t border border-b-0 px-3 py-1.5 text-[12px]"
                style={{
                  borderColor: chrome.border,
                  backgroundColor: chrome.bg,
                  color: chrome.textHi,
                }}
              >
                <FileIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="truncate font-medium">{activePath}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-[#6b7280]">{language}</span>
              </div>
            ) : (
              <span className="px-2 pb-2 text-[11px] text-[#6b7280]">Open a file from the explorer</span>
            )}
          </div>
          <div className="min-h-0 flex-1 basis-0">
            {activePath ? (
              <Editor
                height="100%"
                theme={theme === "dark" ? "vs-dark" : "light"}
                path={activePath}
                language={language}
                value={content}
                onChange={onEdit}
                options={MONACO_OPTIONS}
                loading={<div className="flex h-full items-center justify-center bg-[#1e1e1e] text-[#888]">Loading Monaco…</div>}
              />
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm text-[#858585]"
                style={{ backgroundColor: chrome.bg }}
              >
                No file open. Select a file from the explorer.
              </div>
            )}
          </div>

          <div
            className="h-1.5 shrink-0 cursor-row-resize border-y border-transparent bg-[#3c3c3c] hover:bg-[#569cd6]/80"
            role="separator"
            aria-label="Resize terminal"
            onMouseDown={(e) => {
              e.preventDefault();
              termDragRef.current = { y: e.clientY, h: terminalHeight };
              const move = (ev: MouseEvent) => {
                if (!termDragRef.current) return;
                const dy = termDragRef.current.y - ev.clientY;
                const next = Math.min(
                  Math.max(termDragRef.current.h + dy, 120),
                  Math.min(window.innerHeight * 0.6, 520),
                );
                setTerminalHeight(next);
              };
              const up = () => {
                termDragRef.current = null;
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          />

          <div
            className="flex shrink-0 flex-col border-t"
            style={{
              height: terminalHeight,
              borderColor: chrome.border,
              backgroundColor: chrome.sidebar,
            }}
          >
            <div className="flex h-8 items-center justify-between border-b px-2" style={{ borderColor: chrome.border }}>
              <div className="flex gap-4 text-[11px] font-bold tracking-wide">
                <button
                  type="button"
                  onClick={() => setBottomTab("terminal")}
                  className={`border-b-2 pb-1.5 pt-2 ${bottomTab === "terminal" ? "border-[#569cd6] text-[#e0e0e0]" : "border-transparent text-[#888]"
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Terminal className="h-3.5 w-3.5" />
                    TERMINAL
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab("debug")}
                  className={`border-b-2 pb-1.5 pt-2 ${bottomTab === "debug" ? "border-[#569cd6] text-[#e0e0e0]" : "border-transparent text-[#888]"
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Bug className="h-3.5 w-3.5" />
                    DEBUG
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab("preview")}
                  className={`border-b-2 pb-1.5 pt-2 ${bottomTab === "preview" ? "border-violet-500 text-violet-200" : "border-transparent text-[#888]"
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    PREVIEW
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTerminalLines([
                    "DevMindX Interactive Terminal.",
                    "Commands: run · clear",
                    "$ ",
                  ])
                }
                className="text-[11px] text-[#888] hover:text-[#ccc]"
              >
                Clear
              </button>
            </div>
            {bottomTab === "terminal" ? (
              <div className="flex min-h-0 flex-1 flex-col p-2">
                <div
                  className="font-mono text-[12px] leading-relaxed text-[#d4d4d4] min-h-0 flex-1 overflow-y-auto rounded border border-emerald-500/40 bg-[#1e1e1e] p-2"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.15)" }}
                >
                  {terminalLines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                      {line}
                    </div>
                  ))}
                </div>
                <form onSubmit={onTerminalSubmit} className="mt-2 flex gap-2">
                  <span className="pt-1 font-mono text-emerald-400">$</span>
                  <input
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    placeholder="run | clear"
                    className="min-w-0 flex-1 rounded border bg-[#1e1e1e] px-2 py-1 font-mono text-[12px] text-[#ccc] outline-none focus:border-[#569cd6]"
                    style={{ borderColor: chrome.border }}
                  />
                </form>
              </div>
            ) : bottomTab === "preview" ? (
              <div className="flex flex-1 flex-col p-0 bg-white relative">
                {loading ? (
                  <div className="flex flex-1 flex-col items-center justify-center bg-zinc-950 text-zinc-500 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                    <p className="text-xs font-medium animate-pulse">Syncing sandbox...</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute right-3 top-3 z-10 flex gap-2">
                      <button
                        onClick={() => {
                          const frame = document.getElementById('preview-frame') as HTMLIFrameElement;
                          if (frame) frame.srcdoc = getPreviewHtml(files);
                        }}
                        className="p-2 rounded-lg bg-white/80 border border-zinc-200 shadow-sm text-zinc-600 hover:bg-white hover:text-indigo-600 transition-all flex items-center gap-1.5"
                        title="Hard Refresh"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold">RELOAD</span>
                      </button>
                    </div>
                    {files["index.html"] ? (
                      <iframe
                        id="preview-frame"
                        key={Object.keys(files).length} // force remount on file changes
                        title="Live Preview"
                        srcDoc={getPreviewHtml(files)}
                        className="h-full w-full border-none bg-white"
                        sandbox="allow-scripts allow-modals allow-forms"
                      />
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 bg-zinc-900 border border-zinc-800 rounded mx-4 my-2">
                        <div className="p-3 rounded-full bg-zinc-800 text-zinc-400">
                          <LayoutTemplate className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-zinc-200">No Preview Available</p>
                          <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">Create an <code className="text-violet-400">index.html</code> to start the live web preview.</p>
                        </div>
                        <button
                          onClick={() => {
                            const h = `<!DOCTYPE html>\n<html>\n<head>\n <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-zinc-950 text-white min-h-screen flex items-center justify-center font-sans">\n <div class="text-center bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">\n  <h1 class="text-3xl font-bold">Hello World</h1>\n  <p class="text-zinc-500 mt-2">Preview system is ready.</p>\n </div>\n</body>\n</html>`;
                            setFiles(f => ({ ...f, "index.html": h }));
                            broadcastFileCreate("index.html", h);
                          }}
                          className="px-4 py-2 bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-semibold hover:bg-violet-600/30 transition-all"
                        >
                          Create index.html
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-4 text-center text-[12px] text-[#888]">
                Debug console — breakpoints TBD.
              </div>
            )}
          </div>
        </div>

        <div
          className="hidden lg:block w-1.5 shrink-0 cursor-col-resize border-x border-transparent hover:bg-[#569cd6]/80 transition-colors"
          style={{ backgroundColor: theme === 'dark' ? "#3c3c3c" : "#e5e5e5" }}
          role="separator"
          aria-label="Resize chatbox"
          onMouseDown={(e) => {
            e.preventDefault();
            // Store starting X and starting width
            chatDragRef.current = { x: e.clientX, w: chatWidth };
            const move = (ev: MouseEvent) => {
              if (!chatDragRef.current) return;
              // dx is how much the mouse has moved left
              const dx = chatDragRef.current.x - ev.clientX;
              const next = Math.min(
                Math.max(chatDragRef.current.w + dx, 250), // min width
                window.innerWidth * 0.8 // max width
              );
              setChatWidth(next);
            };
            const up = () => {
              chatDragRef.current = null;
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", up);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
        />

        {/* Use inline style for variable width, and media queries via CSS to apply 100% on small screens */}
        <aside
          className="flex w-full shrink-0 flex-col border-t lg:border-t-0"
          style={{ width: chatWidth, maxWidth: "100%", backgroundColor: chrome.sidebar, borderColor: chrome.border }}
        >
          <div
            className="flex h-9 items-center justify-between border-b px-2 text-[11px] font-bold tracking-wide"
            style={{ borderColor: chrome.border, color: "#bbb" }}
          >
            <span className="inline-flex items-center gap-2">
              AI ASSISTANT
              <MessageSquare className="h-3.5 w-3.5 text-[#888]" />
            </span>
            <div className="flex items-center gap-1.5 relative">
              <button title="Chat History" onClick={() => { setHistoryMenuOpen(!historyMenuOpen); setModelMenuOpen(false); }} className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'} px-1`} style={{ color: theme === 'dark' ? '#888' : '#666' }}><History className="h-4 w-4" /></button>
              <button title="New Chat" onClick={startNewChat} className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'} px-1`} style={{ color: theme === 'dark' ? '#888' : '#666' }}><Plus className="h-4 w-4" /></button>
              <Sparkles className="h-3.5 w-3.5 text-violet-400 ml-1" />
              {historyMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setHistoryMenuOpen(false)} />
                  <div className="absolute right-0 top-[28px] z-50 w-[240px] rounded-lg border p-1 shadow-2xl" style={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff', borderColor: chrome.border }}>
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#666] border-b mb-1" style={{ borderColor: chrome.border }}>Recent Chats (30 Days)</div>
                    <div className="max-h-[220px] overflow-y-auto">
                      {chatHistoryList.length === 0 ? (
                        <div className="px-2 py-2 text-[11px] text-[#666]">No recent chats found.</div>
                      ) : chatHistoryList.map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            setChatSessionId(chat.id);
                            setAiMessages(chat.messages || []);
                            setHistoryMenuOpen(false);
                          }}
                          className={`w-full text-left truncate rounded px-2 py-1.5 text-[12px] ${chatSessionId === chat.id ? "bg-violet-500/20 text-violet-200" : "text-[#ccc] hover:bg-white/5"}`}
                        >
                          {chat.messages?.[0]?.content?.slice(0, 30) || "Empty Chat"}...
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="relative border-b p-2" style={{ borderColor: chrome.border }}>
            <p id="ide-model-heading" className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#666]">
              AI model
            </p>
            <button
              onClick={() => setModelMenuOpen(!modelMenuOpen)}
              className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-[12px] hover:border-violet-500/60 ${theme === 'dark' ? 'bg-[#1e1e1e] text-[#e0e0e0]' : 'bg-white text-black'}`}
              style={{ borderColor: chrome.border }}
            >
              <span className="truncate">{modelRows.find((m) => m.id === model)?.label || "Select Model..."}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#888]" />
            </button>

            {modelMenuOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setModelMenuOpen(false)}
                />
                <div
                  className="absolute left-2 right-2 top-[54px] z-50 rounded-lg border p-1 shadow-2xl"
                  style={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff', borderColor: chrome.border }}
                >
                  <div role="listbox" aria-labelledby="ide-model-heading" className="max-h-[220px] overflow-y-auto">
                    {modelRows.map((m) => (
                      <div
                        key={m.id}
                        role="option"
                        aria-selected={model === m.id}
                        className={`mb-0.5 rounded px-2 py-1.5 ${model === m.id ? "bg-violet-500/20 text-violet-200" : (theme === 'dark' ? "hover:bg-white/5" : "hover:bg-black/5")
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[12px]" style={{ color: theme === 'dark' ? '#e0e0e0' : '#000' }}>
                          <button
                            type="button"
                            className="flex-1 text-left font-medium"
                            onClick={() => {
                              if (m.unlocked) {
                                setModel(m.id);
                                setModelMenuOpen(false);
                              } else {
                                setPurchaseTarget({ id: m.id, label: m.label, priceInr: m.priceInr });
                                setPurchaseOpen(true);
                                setModelMenuOpen(false);
                              }
                            }}
                          >
                            {m.label}
                          </button>
                          {!m.unlocked && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-200">
                              <Lock className="h-3 w-3" />
                              ₹{m.priceInr}
                            </span>
                          )}
                        </div>
                        {m.free && <p className="mt-0.5 text-[9px] text-emerald-400/90">Included · default</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {ollamaHint && <p className="mt-2 text-[10px] leading-snug text-[#6b7280]">{ollamaHint}</p>}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
            {aiMessages.length === 0 && (
              <p className="text-[11px] leading-relaxed text-[#777]">
                Together AI is included. Unlock Gemini, DeepSeek, Claude, or ChatGPT via the price buttons (demo payment).
                With Ollama, traffic still follows <code className="text-[#999]">OLLAMA_MODEL</code> from{" "}
                <code className="text-[#999]">.env</code>. The active file is attached as context.
              </p>
            )}
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg border px-2.5 py-2 text-[12px] ${msg.role === "user"
                  ? `ml-3 ${theme === 'dark' ? 'border-[#404040] bg-[#37373d]' : 'border-zinc-200 bg-zinc-100'}`
                  : `mr-1 ${theme === 'dark' ? 'border-[#353535] bg-[#2d2d30]' : 'border-zinc-200 bg-white'}`
                  }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2 border-b border-white/5 pb-1 text-[10px] uppercase tracking-wide text-[#888]">
                  <span>{msg.role === "user" ? "You" : "Assistant"}</span>
                  <time dateTime={new Date(msg.ts).toISOString()}>{new Date(msg.ts).toLocaleTimeString()}</time>
                </div>
                {msg.role === "assistant" ? (
                  <FormattedChatContent
                    text={msg.content}
                    activePath={activePath}
                    onApplySnippet={applySnippetToActive}
                    isLight={theme === 'light'}
                  />
                ) : (
                  <p className="whitespace-pre-wrap break-words" style={{ color: theme === 'dark' ? '#e0e0e0' : '#333' }}>{msg.content}</p>
                )}
                {msg.fileChanges && msg.fileChanges.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
                    <p className="text-[10px] font-medium text-[#888]">Suggested file changes</p>
                    {msg.fileChanges.map((fc, i) => (
                      <button
                        key={`${fc.filePath}-${i}`}
                        type="button"
                        onClick={() => applyFileChange(fc)}
                        className="block w-full rounded border border-violet-500/30 bg-violet-500/10 px-2 py-1.5 text-left text-[11px] text-violet-200 hover:bg-violet-500/20"
                      >
                        Apply: {fc.action} → {fc.filePath}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2 text-[11px] text-[#888]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Ollama / AI is thinking…
              </div>
            )}
          </div>
          <div className="border-t p-2" style={{ borderColor: chrome.border }}>
            <textarea
              id="ide-ai-input"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AI anything… (Shift+Enter newline)"
              rows={3}
              className={`mb-2 w-full resize-none rounded border px-2 py-1.5 text-[12px] placeholder:text-[#666] outline-none focus:border-violet-500/60 ${theme === 'dark' ? 'bg-[#1e1e1e] text-[#e0e0e0]' : 'bg-white text-black'}`}
              style={{ borderColor: chrome.border }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendAi();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void sendAi()}
              disabled={aiLoading}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </aside>
      </div>

      <IdeModelPurchaseModal
        open={purchaseOpen}
        onClose={() => {
          setPurchaseOpen(false);
          setPurchaseTarget(null);
        }}
        target={purchaseTarget}
        isAuthenticated={isAuthenticated}
        onPurchased={async (id) => {
          const rows = await loadIdeModels();
          if (rows.some((r) => r.id === id && r.unlocked)) setModel(id);
        }}
      />

      <CollabPanel
        open={collabPanelOpen}
        onClose={() => setCollabPanelOpen(false)}
        sessionId={sessionId}
        connected={collabConnected}
        users={collabUsers}
        hostId={hostId}
        isAdmin={user?.username === hostId}
        chrome={chrome}
      />

      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 px-4" role="dialog">
          <div
            className="w-full max-w-lg rounded-xl border shadow-2xl"
            style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
          >
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: chrome.border }}>
              <span className="text-sm font-medium text-[#e0e0e0]">Command Palette</span>
              <button type="button" onClick={() => setPaletteOpen(false)} className="rounded p-1 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 text-[13px]">
              {(
                [
                  ["Run Code", () => void runCode()],
                  ["Clear Terminal", () => setTerminalLines(["$ "])],
                  ["Focus AI", () => document.getElementById("ide-ai-input")?.focus()],
                  ["Open collaboration", () => setCollabPanelOpen(true)],
                  ["Reload project", () => projectId && loadProject(projectId)],
                  ["New file", createNewFile],
                  ["Upload files", onUploadPick],
                  ["Open whiteboard", () => (isAuthenticated ? setWhiteboardOpen(true) : undefined)],
                ] as [string, () => void][]
              ).map(([label, fn]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    fn();
                    setPaletteOpen(false);
                  }}
                  className="flex w-full rounded-lg px-3 py-2 text-left text-[#ccc] hover:bg-[#37373d]"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="border-t px-3 py-2 text-[10px] text-[#666]" style={{ borderColor: chrome.border }}>
              Esc or ⌘K to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
