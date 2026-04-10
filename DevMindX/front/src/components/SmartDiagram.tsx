import { useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Edge,
  Node,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { MermaidDiagram } from "./MermaidDiagram";

interface SmartDiagramProps {
  data: any; // The JSON object containing { reactFlow?: { nodes: any[], edges: any[] }, mermaid?: string }
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Helper to auto-layout the nodes using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 75,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export function SmartDiagram({ data }: SmartDiagramProps) {
  const [view, setView] = useState<"reactflow" | "mermaid">("reactflow");

  const rfData = data?.reactFlow;
  const mermaidData = data?.mermaid || (typeof data === "string" ? data : "");

  const hasReactFlow = Boolean(rfData && Array.isArray(rfData.nodes) && rfData.nodes.length > 0);

  // Default to mermaid if reactFlow data is missing/invalid
  useEffect(() => {
    if (!hasReactFlow && mermaidData) {
      setView("mermaid");
    } else if (hasReactFlow) {
      setView("reactflow");
    }
  }, [hasReactFlow, mermaidData]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (hasReactFlow) {
      // Set default dimensions and styles if missing
      const initialNodes = rfData.nodes.map((n: any) => ({
        ...n,
        type: n.type || "default",
        position: n.position || { x: 0, y: 0 },
        data: n.data || { label: n.label || n.id || "Unknown Node" },
        style: n.style || {
            background: "#ffffff",
            border: "1px solid #7c3aed",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            color: "#333",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }
      }));
      const initialEdges = rfData.edges.map((e: any) => ({
        ...e,
        animated: true,
        style: { stroke: "#a78bfa", strokeWidth: 2 }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        "TB"
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [data, hasReactFlow, setNodes, setEdges]);

  if (!hasReactFlow && !mermaidData) {
    return (
      <div className="p-4 text-center text-zinc-500 text-sm">
        No diagram data available.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
      {hasReactFlow && mermaidData && (
        <div className="absolute top-4 right-4 z-10 flex border rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setView("reactflow")}
            className={`px-3 py-1.5 text-xs font-medium \${
              view === "reactflow" ? "bg-fuchsia-500 text-white" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            React Flow
          </button>
          <button
            onClick={() => setView("mermaid")}
            className={`px-3 py-1.5 text-xs font-medium \${
              view === "mermaid" ? "bg-fuchsia-500 text-white" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Mermaid
          </button>
        </div>
      )}

      {view === "reactflow" && hasReactFlow ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      ) : (
        <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
          <MermaidDiagram chart={mermaidData} />
        </div>
      )}
    </div>
  );
}
