import { Router } from "express";
import { requireUser } from "../middleware/require-user.js";
import { chatWithAIModel } from "../services/aiService.js";
import type { AIModelId, ChatMessage } from "../../shared/types.js";

const router = Router();
router.use(requireUser);

/** Generator / tools: chat with full project context (Ollama when running). */
router.post("/chat", async (req, res) => {
  try {
    const { message, model, chatHistory, projectContext } = req.body as {
      message?: string;
      model?: string;
      chatHistory?: { role: string; content: string }[];
      projectContext?: Record<string, unknown>;
    };
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const history: ChatMessage[] = (chatHistory || []).map((m, i) => ({
      id: `h-${i}`,
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? ""),
      timestamp: new Date(),
    }));

    const ctx = projectContext && typeof projectContext === "object" ? projectContext : {};

    const result = await chatWithAIModel({
      message: message.trim(),
      model: (model || "together") as AIModelId,
      chatHistory: history,
      projectContext: ctx as any,
    });

    res.json({
      content: result.content,
      message: result.content,
      fileChanges: result.fileChanges ?? [],
      modelUsed: result.model,
    });
  } catch (e) {
    console.error("POST /ai/chat:", e);
    res.status(500).json({ message: (e as Error).message || "Chat failed" });
  }
});

export default router;
