import { Router } from "express";
import archiver from "archiver";
import type { AuthedRequest } from "../middleware/require-user.js";
import { requireUser } from "../middleware/require-user.js";
import { getStorage } from "../storage.js";
import { generateProjectWithAI } from "../services/aiService.js";
import type { AIModelId } from "../../shared/types.js";
import type { InsertProject } from "@shared/schema.js";
import codeSandboxService from "../services/codesandbox.js";

const router = Router();
router.use(requireUser);

function uid(req: AuthedRequest) {
  return String(req.devmindxUser.id);
}

async function getOwnedProject(projectId: string, userId: string) {
  const storage = await getStorage();
  const p = await storage.getProject(projectId);
  if (!p || String(p.userId) !== String(userId)) return null;
  return p;
}

/** List projects (no file bodies). */
router.get("/", async (req, res) => {
  try {
    const storage = await getStorage();
    const list = await storage.getUserProjects(uid(req as unknown as AuthedRequest));
    const summaries = list.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      framework: p.framework ?? undefined,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date().toISOString(),
    }));
    res.json(summaries);
  } catch (e) {
    console.error("GET /projects:", e);
    res.status(500).json({ message: (e as Error).message });
  }
});

/** Generate with Ollama (when available) / AI pipeline, then persist. */
router.post("/generate", async (req, res) => {
  try {
    const { name, framework, description, model, withPreview } = req.body as {
      name?: string;
      framework?: string;
      description?: string;
      model?: string;
      withPreview?: boolean;
    };
    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ message: "description is required" });
    }
    const aiModel = (model || "together") as AIModelId;
    const result = await generateProjectWithAI({
      prompt: description.trim(),
      framework: typeof framework === "string" ? framework.trim() : undefined,
      name: typeof name === "string" ? name.trim() : undefined,
      model: aiModel,
    });

    const files =
      result.files && typeof result.files === "object"
        ? (result.files as Record<string, string>)
        : {};

    let previewUrl: string | null = null;
    let sandboxId: string | null = null;

    if (withPreview) {
      try {
        let template: "react" | "vue" | "angular" | "node" | "static" | "vanilla" = "vanilla";
        const detected = codeSandboxService.detectTemplate(files);
        if (["react", "vue", "angular", "node", "static", "vanilla"].includes(detected)) {
          template = detected as any;
        }

        const sandboxData = await codeSandboxService.createSandbox({
          files,
          template,
          title: (typeof name === "string" && name.trim()) || result.name || "AI Generated Project",
          description: description.trim(),
        });
        
        previewUrl = sandboxData.previewUrl;
        sandboxId = sandboxData.sandboxId;
      } catch (err) {
        console.error("CodeSandbox creation error:", err);
      }
    }

    const storage = await getStorage();
    const fw = String(
      (typeof framework === "string" && framework.trim()) || result.framework || "vanilla",
    );
    const project = await storage.createProject({
      name: (typeof name === "string" && name.trim()) || result.name || "ai-project",
      description: description.trim(),
      framework: fw,
      userId: uid(req as unknown as AuthedRequest),
      files,
    } as InsertProject & { userId: string; files: Record<string, string> });

    res.json({
      message: "Project generated and saved",
      files,
      projectId: project.id,
      preview: { previewUrl, sandboxId },
    });
  } catch (e) {
    console.error("POST /projects/generate:", e);
    res.status(500).json({ message: (e as Error).message || "Generation failed" });
  }
});

/** Warm-open for IDE (client only checks ok). */
router.get("/:id/load", async (req, res) => {
  try {
    const p = await getOwnedProject(req.params.id, uid(req as unknown as AuthedRequest));
    if (!p) return res.status(404).json({ message: "Project not found" });
    res.json({ ok: true, id: p.id });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

/** ZIP export */
router.get("/:id/export", async (req, res) => {
  try {
    const p = await getOwnedProject(req.params.id, uid(req as unknown as AuthedRequest));
    if (!p) return res.status(404).json({ message: "Project not found" });

    const safeName = String(p.name).replace(/[^a-zA-Z0-9._-]+/g, "_") || "project";
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("archiver:", err);
      if (!res.headersSent) res.status(500).end();
    });
    archive.pipe(res);

    const files = (p.files || {}) as Record<string, string>;
    for (const [path, content] of Object.entries(files)) {
      archive.append(typeof content === "string" ? content : String(content), { name: path });
    }
    await archive.finalize();
  } catch (e) {
    console.error("GET /projects/export:", e);
    if (!res.headersSent) res.status(500).json({ message: (e as Error).message });
  }
});

/** Full project for IDE */
router.get("/:id", async (req, res) => {
  try {
    const p = await getOwnedProject(req.params.id, uid(req as unknown as AuthedRequest));
    if (!p) return res.status(404).json({ message: "Project not found" });
    res.json({
      id: p.id,
      name: p.name,
      description: p.description,
      framework: p.framework,
      files: p.files || {},
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : undefined,
      updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : undefined,
    });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const p = await getOwnedProject(req.params.id, uid(req as unknown as AuthedRequest));
    if (!p) return res.status(404).json({ message: "Project not found" });
    const { name, description, framework, files } = req.body as {
      name?: string;
      description?: string;
      framework?: string;
      files?: Record<string, string>;
    };
    const storage = await getStorage();
    const updated = await storage.updateProject(req.params.id, {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(framework !== undefined ? { framework } : {}),
      ...(files !== undefined ? { files } : {}),
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const p = await getOwnedProject(req.params.id, uid(req as unknown as AuthedRequest));
    if (!p) return res.status(404).json({ message: "Project not found" });
    const storage = await getStorage();
    await storage.deleteProject(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

export default router;
