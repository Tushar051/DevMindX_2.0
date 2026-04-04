import { Router } from "express";
import { requireUser } from "../middleware/require-user.js";
import { chatWithAIModel } from "../services/aiService.js";

const router = Router();
router.use(requireUser);

const EMPTY = {
  systemArchitecture: "",
  classDiagram: "",
  erDiagram: "",
  sequenceDiagram: "",
  restApiBlueprint: "",
  dataFlowDiagram: "",
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
      system:
        "Produce a Mermaid `graph TB` or `C4Context`-style system architecture diagram text for the described system.",
      class: "Produce a Mermaid `classDiagram` for the main entities and relationships.",
      er: "Produce a Mermaid `erDiagram` for core entities.",
      sequence: "Produce one Mermaid `sequenceDiagram` for a primary user flow.",
      api: "Produce a concise REST API blueprint (Markdown tables or OpenAPI-style YAML in a code block).",
      dataflow: "Produce a Mermaid `flowchart LR` data-flow diagram.",
    };

    const prompt = `You are a software architect. ${instructions[type]}

User description:
${description.trim()}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{
  "systemArchitecture": "string (mermaid or text, empty string if not this diagram)",
  "classDiagram": "string",
  "erDiagram": "string",
  "sequenceDiagram": "string",
  "restApiBlueprint": "string",
  "dataFlowDiagram": "string",
  "description": "short summary of what you modeled"
}

Put the full content for the "${type}" diagram type in the matching field "${field}". Other diagram fields can be empty strings. Use valid Mermaid where applicable.`;

    const out = await chatWithAIModel({
      message: prompt,
      model: "together",
      chatHistory: [],
      projectContext: {},
    });

    let parsed: Record<string, string> = { ...EMPTY };
    try {
      const m = out.content.match(/\{[\s\S]*\}/);
      if (m) {
        const j = JSON.parse(m[0]) as Record<string, string>;
        for (const k of Object.keys(EMPTY)) {
          if (typeof j[k] === "string") parsed[k] = j[k];
        }
        if (typeof j.description === "string") (parsed as any).description = j.description;
      } else {
        parsed[field] = out.content.trim();
      }
    } catch {
      parsed[field] = out.content.trim();
    }

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
