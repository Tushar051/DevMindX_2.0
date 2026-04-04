import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Pen, Scissors, Trash2 } from "lucide-react";

export const EMPTY_WHITEBOARD = '{"v":2,"strokes":[]}';

export type Stroke = {
  c: string;
  w: number;
  pts: [number, number][];
  /** True = erase (canvas destination-out), syncs across collaborators */
  eraser?: boolean;
};

function parseDoc(json: string): Stroke[] {
  try {
    const o = JSON.parse(json) as { v?: number; strokes?: Stroke[] };
    if (!Array.isArray(o.strokes)) return [];
    return o.strokes.map((s) => ({
      c: s.c ?? "#e5e5e5",
      w: typeof s.w === "number" ? s.w : 4,
      pts: Array.isArray(s.pts) ? s.pts : [],
      eraser: s.eraser === true,
    }));
  } catch {
    return [];
  }
}

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    if (s.pts.length < 2) continue;
    const isEraser = s.eraser === true;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : s.c;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) {
      ctx.lineTo(s.pts[i][0], s.pts[i][1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}

type Props = {
  open: boolean;
  onClose: () => void;
  snapshot: string;
  onCommit: (json: string) => void;
  chrome: { bg: string; sidebar: string; border: string; textHi: string };
};

const COLORS = [
  "#569cd6",
  "#4ec9b0",
  "#6a9955",
  "#dcdcaa",
  "#ce9178",
  "#c586c0",
  "#f48771",
  "#4ade80",
  "#fbbf24",
  "#f472b6",
  "#e5e5e5",
  "#ffffff",
];

const WIDTH_MIN = 2;
const WIDTH_MAX = 28;

export function IdeWhiteboardModal({ open, onClose, snapshot, onCommit, chrome }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(6);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const drawing = useRef(false);
  const current = useRef<Stroke | null>(null);
  const dprRef = useRef(1);

  useEffect(() => {
    if (!open) return;
    setStrokes(parseDoc(snapshot));
  }, [open, snapshot]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = chrome.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStrokes(ctx, strokes, dpr);
  }, [strokes, chrome.bg]);

  useEffect(() => {
    if (!open) return;
    redraw();
    const ro = new ResizeObserver(() => redraw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [open, redraw]);

  const toLocal = (e: React.PointerEvent | PointerEvent): [number, number] => {
    const wrap = wrapRef.current;
    if (!wrap) return [0, 0];
    const r = wrap.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const [x, y] = toLocal(e);
    if (tool === "eraser") {
      current.current = { c: "#000", w: Math.max(width, 8), pts: [[x, y]], eraser: true };
    } else {
      current.current = { c: color, w: width, pts: [[x, y]] };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !current.current) return;
    const [x, y] = toLocal(e);
    const last = current.current.pts[current.current.pts.length - 1];
    if (last && Math.hypot(x - last[0], y - last[1]) < 0.5) return;
    current.current.pts.push([x, y]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const dpr = dprRef.current || 1;
    const isEraser = current.current.eraser === true;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : current.current.c;
    ctx.lineWidth = current.current.w;
    const pts = current.current.pts;
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2][0], pts[pts.length - 2][1]);
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.stroke();
    ctx.restore();
  };

  const finishStroke = () => {
    if (!drawing.current || !current.current) return;
    drawing.current = false;
    const s = current.current;
    current.current = null;
    if (s.pts.length < 2) return;
    const next = [...strokes, s];
    setStrokes(next);
    const json = JSON.stringify({ v: 2, strokes: next });
    onCommit(json);
  };

  const clearAll = () => {
    setStrokes([]);
    onCommit(EMPTY_WHITEBOARD);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wb-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(88vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: chrome.sidebar,
          borderColor: chrome.border,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Title row */}
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-4"
          style={{ borderColor: chrome.border }}
        >
          <h2 id="wb-title" className="text-sm font-semibold sm:text-base" style={{ color: chrome.textHi }}>
            Whiteboard
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-[#ccc] hover:bg-white/10 sm:text-xs"
            title="Close whiteboard"
          >
            <Scissors className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            Close
          </button>
        </div>

        {/* Tools */}
        <div
          className="flex shrink-0 flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4"
          style={{ borderColor: chrome.border }}
        >
          <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: chrome.border }}>
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                tool === "pen" ? "bg-[#569cd6] text-white" : "text-[#aaa] hover:bg-white/10"
              }`}
              title="Pen"
            >
              <Pen className="h-3.5 w-3.5" />
              Pen
            </button>
            <button
              type="button"
              onClick={() => setTool("eraser")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                tool === "eraser" ? "bg-amber-600/90 text-white" : "text-[#aaa] hover:bg-white/10"
              }`}
              title="Eraser"
            >
              <Eraser className="h-3.5 w-3.5" />
              Erase
            </button>
          </div>

          {tool === "pen" && (
            <div
              className="flex flex-wrap items-center gap-1.5 sm:border-l sm:pl-3"
              style={{ borderColor: chrome.border }}
            >
              <span className="text-[10px] uppercase tracking-wide text-[#666]">Colors</span>
              <div className="flex flex-wrap gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 sm:h-6 sm:w-6 ${
                      color === c ? "border-white ring-1 ring-white/50" : "border-white/20 hover:border-white/40"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          <div
            className="flex min-w-[140px] flex-1 flex-col gap-1 sm:min-w-[200px] sm:border-l sm:pl-3"
            style={{ borderColor: chrome.border }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wide text-[#666]">
                {tool === "eraser" ? "Eraser size" : "Pen size"}
              </span>
              <span className="font-mono text-[11px] text-[#999]">{width}px</span>
            </div>
            <input
              type="range"
              min={WIDTH_MIN}
              max={WIDTH_MAX}
              step={1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#569cd6]"
            />
            <div className="flex justify-between text-[9px] text-[#555]">
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-500/20"
            title="Clear entire board"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear board
          </button>
        </div>

        {/* Drawing surface */}
        <div
          ref={wrapRef}
          className="relative min-h-[300px] flex-1 touch-none"
          style={{ minHeight: "clamp(300px, 48vh, 520px)" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block h-full w-full cursor-crosshair"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            onPointerLeave={() => {
              if (drawing.current) finishStroke();
            }}
          />
        </div>

        <p
          className="shrink-0 border-t px-3 py-2 text-center text-[10px] leading-relaxed text-[#666] sm:text-[11px]"
          style={{ borderColor: chrome.border }}
        >
          Draw with mouse or finger. Same session syncs strokes when you use Collaborate.{" "}
          <kbd className="rounded border border-[#555] bg-[#2a2a2a] px-1 py-0.5 text-[9px]">Esc</kbd> closes.
        </p>
      </div>
    </div>
  );
}
