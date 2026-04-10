import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgCode, setSvgCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !chart.trim()) {
        if (isMounted) setSvgCode("");
        return;
      }
      try {
        if (isMounted) setError(null);
        // Robustly extract just the mermaid block if conversational text was added
        let cleanChart = chart;
        const blockMatch = chart.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
        if (blockMatch && blockMatch[1]) {
          cleanChart = blockMatch[1].trim();
        } else {
          // Fallback if no code block was used
          cleanChart = chart.replace(/```mermaid\n?/g, "").replace(/```/g, "").trim();
        }
        
        // Auto-sanitize common LLM syntax hallucinations
        cleanChart = cleanChart
          .replace(/;(\s*[-=.]+>)/g, "$1") // Fix `A[Node]; --> B[Node]`
          .replace(/;(\s*[-=]+)/g, "$1")   // Fix `A[Node]; --- B[Node]`
          .replace(/\/\/.*$/gm, "")        // Strip C-style `// comments` since Mermaid uses `%%`
          .replace(/;\s*$/gm, "");         // Strip empty trailing semicolons
        
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvgCode(svg);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError("Failed to render diagram. It might contain unsupported syntax.");
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleExportPng = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      
      // We wrap the SVG in a container with a white background for the export, otherwise it might be transparent.
      const dataUrl = await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      const link = document.createElement("a");
      link.download = `architecture-diagram-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
      alert("Failed to export PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm">
        {error}
        <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svgCode) {
    return <div className="text-sm text-zinc-500 italic p-4">No content to render.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExportPng}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export PNG
        </button>
      </div>
      <div 
        ref={containerRef} 
        className="flex justify-center p-8 bg-white overflow-auto rounded-xl border border-zinc-100 mx-auto"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
      <div className="mt-8 pt-4 border-t border-zinc-200">
        <h4 className="text-xs font-semibold text-zinc-600 mb-2">Source Output</h4>
        <pre className="text-xs font-mono text-zinc-800 whitespace-pre-wrap break-words bg-zinc-50 p-4 rounded-xl">
          {chart}
        </pre>
      </div>
    </div>
  );
}
