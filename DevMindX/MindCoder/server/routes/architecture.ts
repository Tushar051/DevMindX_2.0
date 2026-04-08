import { Router } from "express";
import { requireUser } from "../middleware/require-user.js";
import { chatWithAIModel } from "../services/aiService.js";

const router = Router();
router.use(requireUser);

const EMPTY = {
  systemArchitecture: null as any,
  classDiagram: null as any,
  erDiagram: null as any,
  sequenceDiagram: null as any,
  restApiBlueprint: null as any,
  dataFlowDiagram: null as any,
};

const FIELD_FOR_TYPE: Record<string, keyof typeof EMPTY> = {
  system: "systemArchitecture",
  class: "classDiagram",
  er: "erDiagram",
  sequence: "sequenceDiagram",
  api: "restApiBlueprint",
  dataflow: "dataFlowDiagram",
};

router.post("/generate", async (req, res) => {
  try {
    const { description, diagramType } = req.body as { description?: string; diagramType?: string };
    if (!description?.trim()) {
      return res.status(400).json({ message: "description is required" });
    }
    const type = diagramType && FIELD_FOR_TYPE[diagramType] ? diagramType : "system";
    const field = FIELD_FOR_TYPE[type];

    const instructions: Record<string, string> = {
      system: "Create a system architecture diagram. For mermaid use 'flowchart TB' syntax.",
      class: "Create a class diagram. For mermaid use 'classDiagram' syntax.",
      er: "Create an Entity-Relationship diagram. For mermaid use 'erDiagram' syntax.",
      sequence: "Create a sequence diagram. For reactFlow, map actors and actions as nodes and messages as edges. For mermaid use 'sequenceDiagram' syntax.",
      api: "Create a REST API blueprint. For reactFlow, map endpoints/resources as nodes. For mermaid use 'flowchart LR' or describe appropriately.",
      dataflow: "Create a data-flow map. For mermaid use 'flowchart LR' syntax.",
    };

    const prompt = `You are an expert system architect mapping out software diagrams.

Task: ${instructions[type]}

User description:
${description.trim()}

CRITICAL RULES:
1. You MUST provide exactly two markdown code blocks: one \`\`\`json block and one \`\`\`mermaid block.
2. The \`\`\`json block MUST contain the React Flow data with exactly "nodes" and "edges" arrays. Nodes must have "id" and "data": {"label": "..."}. Edges must have "id", "source", "target".
3. The \`\`\`mermaid block MUST contain the raw Mermaid syntax string.
4. Do not wrap the entire response in JSON.

Example Response:
\`\`\`json
{
  "nodes": [{"id": "1", "data": {"label": "App"}}],
  "edges": []
}
\`\`\`
\`\`\`mermaid
flowchart TB
  App
\`\`\`
`;

    const out = await chatWithAIModel({
      message: prompt,
      model: "ollama",
      chatHistory: [],
      projectContext: {},
    });

    let parsed: Record<string, any> = { ...EMPTY };
    let content = out.content.trim();
    
    let reactFlow = { nodes: [], edges: [] };
    let mermaid = "";

    // Extract JSON block
    const jsonMatch = content.match(/\`\`\`json\s*(\{[\s\S]*?\})\s*\`\`\`/);
    if (jsonMatch) {
      try {
        reactFlow = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse reactFlow json:", e);
      }
    } else {
      // Fallback if the LLM just returned raw JSON without ticks
      try {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) reactFlow = JSON.parse(m[0]);
      } catch (e) {}
    }

    // Extract mermaid block
    const mermaidMatch = content.match(/\`\`\`mermaid\s*([\s\S]*?)\s*\`\`\`/);
    if (mermaidMatch) {
      mermaid = mermaidMatch[1].trim();
    } else {
      // If it forgot to wrap mermaid context, try to find flowchart or similar
      const fallbackMatch = content.match(/(flowchart|sequenceDiagram|classDiagram|erDiagram)[\s\S]*/);
      if (fallbackMatch && !fallbackMatch[0].includes("```json")) {
        mermaid = fallbackMatch[0].replace(/\`\`\`/g, "").trim();
      }
    }
    
    // If we extracted the old format, map it
    if ((reactFlow as any).reactFlow) reactFlow = (reactFlow as any).reactFlow;
    if ((reactFlow as any).mermaid && !mermaid) mermaid = (reactFlow as any).mermaid;

    parsed[field] = { reactFlow, mermaid: mermaid || content };

    res.json({
      ...EMPTY,
      ...parsed,
      description: (parsed as any).description || description.trim().slice(0, 200),
    });
  } catch (e) {
    console.error("POST /architecture/generate:", e);
    res.status(500).json({ message: (e as Error).message || "Failed to generate architecture" });
  }
});

export default router;
