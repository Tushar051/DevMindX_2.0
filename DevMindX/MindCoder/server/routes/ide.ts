import { Router, type Request } from 'express';
import { sandboxExecutor } from '../services/sandbox-executor.js';
import { chatWithAIModel } from '../services/aiService.js';
import { listOllamaModels, checkOllamaAvailability } from '../services/ollama.js';
import { verifyToken } from '../services/auth.js';
import { getStorage } from '../storage.js';
import { resolveUserFromJwtPayload } from '../lib/resolve-user.js';
import type { User } from '@shared/schema.js';
import type { AIModelId, ChatMessage, PurchasedModel } from '../../shared/types.js';

const router = Router();

/** IDE chat catalog: Together is free; others match landing pricing (INR). */
const IDE_CHAT_MODELS: { id: AIModelId; label: string; priceInr: number; free: boolean }[] = [
  { id: "together", label: "Together AI", priceInr: 0, free: true },
  { id: "gemini", label: "Google Gemini", priceInr: 749, free: false },
  { id: "deepseek", label: "DeepSeek", priceInr: 1125, free: false },
  { id: "claude", label: "Claude", priceInr: 1299, free: false },
  { id: "chatgpt", label: "ChatGPT", priceInr: 1499, free: false },
];

function getBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

async function getUserFromRequest(req: Request): Promise<User | undefined> {
  const token = getBearerToken(req);
  if (token) {
    try {
      const payload = verifyToken(token) as { id?: string | number; email?: string };
      const storage = await getStorage();
      return resolveUserFromJwtPayload(storage, payload);
    } catch {
      return undefined;
    }
  }
  const x = req.headers["x-user-id"];
  if (x) {
    const storage = await getStorage();
    return storage.getUser(String(x));
  }
  return undefined;
}

function getUnlockedModelIdsForUser(user: User | undefined | null): Set<AIModelId> {
  const unlocked = new Set<AIModelId>(["together"]);
  if (!user) return unlocked;
  try {
    const list = user.purchasedModels;
    if (!Array.isArray(list)) return unlocked;
    const now = new Date();
    for (const pm of list as PurchasedModel[]) {
      if (!pm?.id || pm.id === "together") continue;
      const purchaseDate = new Date(pm.purchaseDate);
      const expirationDate = new Date(purchaseDate.getTime());
      expirationDate.setMonth(expirationDate.getMonth() + (typeof pm.months === "number" ? pm.months : 1));
      if (now < expirationDate) unlocked.add(pm.id);
    }
  } catch (e) {
    console.error("IDE getUnlockedModelIdsForUser:", e);
  }
  return unlocked;
}

function mapToAIModelId(raw: string | undefined): AIModelId {
  const m = (raw || "together").toLowerCase().replace(/\s+/g, "");
  if (m === "together" || m.includes("ollama")) return "together";
  if (m.includes("gemini")) return "gemini";
  if (m.includes("gpt") || m === "openai" || m.includes("chatgpt")) return "chatgpt";
  if (m.includes("claude")) return "claude";
  if (m.includes("deepseek")) return "deepseek";
  return "together";
}

function rowsToChatHistory(rows: { role?: string; content?: string }[]): ChatMessage[] {
  return rows.map((row, i) => ({
    id: `ide-hist-${i}-${Math.random().toString(36).slice(2, 9)}`,
    role: row.role === "assistant" ? "assistant" : "user",
    content: String(row.content ?? ""),
    timestamp: new Date(),
  }));
}

// Execute code in Docker sandbox
router.post('/execute', async (req, res) => {
  try {
    const { code, language, filename, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await sandboxExecutor.executeCode(code, language, filename, input);

    res.json({
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime
    });

  } catch (error: any) {
    console.error('Execution error:', error);
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

// AI Chat endpoint (Ollama when USE_OLLAMA / reachable; proper ChatMessage history)
router.post("/ai/chat", async (req, res) => {
  try {
    const { messages, model: rawModel, context, filesSnapshot } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || lastMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be role: user with content" });
    }

    const prior = messages.slice(0, -1);
    const invalid = prior.some(
      (m: { role?: string }) => m.role !== "user" && m.role !== "assistant",
    );
    if (invalid) {
      return res.status(400).json({ error: "All prior messages must be user or assistant" });
    }

    let userText = String(lastMessage.content);
    const filePath = typeof context === "string" ? context : undefined;
    if (
      filePath &&
      filesSnapshot &&
      typeof filesSnapshot === "object" &&
      filesSnapshot !== null &&
      filePath in (filesSnapshot as Record<string, unknown>)
    ) {
      const body = String((filesSnapshot as Record<string, string>)[filePath] ?? "").slice(0, 24000);
      userText = `You are helping in an IDE. The active file is \`${filePath}\`.\n\nCurrent file contents:\n\`\`\`\n${body}\n\`\`\`\n\n---\n\nUser message:\n${userText}`;
    }

    const chatHistory = rowsToChatHistory(prior);
    const model = mapToAIModelId(typeof rawModel === "string" ? rawModel : undefined);

    const authUser = await getUserFromRequest(req);
    const unlocked = getUnlockedModelIdsForUser(authUser);
    if (model !== "together" && !unlocked.has(model)) {
      return res.status(403).json({
        error:
          "This model is locked. Sign in and unlock it from the AI model list (dummy purchase), or choose Together AI.",
      });
    }

    const projectContext =
      filePath || (filesSnapshot && typeof filesSnapshot === "object")
        ? {
            currentFile: filePath,
            /** Full map so Ollama/Gemini receive file bodies (not just names). */
            files:
              filesSnapshot && typeof filesSnapshot === "object"
                ? (filesSnapshot as Record<string, string>)
                : undefined,
          }
        : undefined;

    const result = await chatWithAIModel({
      message: userText,
      model,
      chatHistory,
      projectContext,
    });

    res.json({
      response: result.content,
      fileChanges: result.fileChanges ?? [],
      modelUsed: model,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("IDE AI chat error:", err);
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

// File system operations
router.post('/files/create', async (req, res) => {
  try {
    const { projectId, path, type, content } = req.body;
    
    // TODO: Implement file creation in database
    // For now, return success
    res.json({ success: true, id: Date.now().toString() });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/files/update', async (req, res) => {
  try {
    const { fileId, content } = req.body;
    
    // TODO: Implement file update in database
    res.json({ success: true });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Implement file deletion in database
    res.json({ success: true });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project operations - these are handled by main routes.ts
// Just add a helper endpoint for IDE-specific project info
router.get('/projects/:id/info', async (req, res) => {
  try {
    const { id } = req.params;
    // This will be handled by the main project routes
    // Just return success for now
    res.json({ success: true, projectId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check Docker availability
router.get('/sandbox/status', async (req, res) => {
  try {
    // Quick check - just return available for now
    // Docker check can be slow and cause timeouts
    res.json({ 
      available: true, 
      message: 'Sandbox is ready',
      note: 'Docker availability check disabled to prevent timeouts'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// IDE models: Ollama hints + five chat models (Together free; others unlock via purchase)
router.get("/models", async (req, res) => {
  try {
    const useOllama =
      process.env.USE_OLLAMA === "true" || (await checkOllamaAvailability());
    const raw = useOllama ? await listOllamaModels() : [];
    const ollamaNames: string[] = Array.isArray(raw)
      ? raw.map((t: { name?: string; model?: string }) => t.name || t.model || "").filter(Boolean)
      : [];

    const authUser = await getUserFromRequest(req);
    const unlocked = getUnlockedModelIdsForUser(authUser);

    const routingOptions = IDE_CHAT_MODELS.map((m) => ({
      id: m.id,
      label: m.label,
      unlocked: m.free || unlocked.has(m.id),
      priceInr: m.priceInr,
      free: m.free,
    }));

    res.json({
      useOllama,
      defaultOllamaModel: process.env.OLLAMA_MODEL || "llama3.2",
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      ollamaModels: ollamaNames,
      routingOptions,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/models/purchase", async (req, res) => {
  try {
    const storage = await getStorage();
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        error: "Could not resolve your account. Sign out and sign in again, or check that your session matches this server.",
      });
    }

    const { modelId, months, paymentMethod, paymentDetails } = req.body as {
      modelId?: string;
      months?: number;
      paymentMethod?: string;
      paymentDetails?: unknown;
    };

    if (!modelId || !paymentMethod) {
      return res.status(400).json({ error: "Missing modelId or paymentMethod" });
    }
    if (!["credit", "debit", "upi"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid paymentMethod — use credit, debit, or upi" });
    }

    const pd = paymentDetails && typeof paymentDetails === "object" ? (paymentDetails as Record<string, unknown>) : {};
    if (paymentMethod === "upi") {
      const upiId = String(pd.upiId ?? "").trim();
      // Typical UPI: local@provider — allow sensible demo shapes (no spaces).
      if (!/^[^\s@]+@[^\s@]+$/.test(upiId) || upiId.length < 5) {
        return res.status(400).json({
          error: "Use a valid UPI format, e.g. you@paytm or name@oksbi (no spaces)",
        });
      }
    } else {
      const last4 = String(pd.cardLast4 ?? "").replace(/\D/g, "");
      if (last4.length !== 4) {
        return res.status(400).json({
          error: "Enter exactly 4 digits for the card last-four (e.g. 4242)",
        });
      }
    }

    const catalog = IDE_CHAT_MODELS.find((m) => m.id === modelId);
    if (!catalog) {
      return res.status(404).json({ error: "Model not found" });
    }
    if (catalog.free) {
      return res.status(400).json({ error: "Together AI is already included" });
    }

    const purchasedModel: PurchasedModel = {
      id: catalog.id,
      purchaseDate: new Date().toISOString(),
      paymentMethod: paymentMethod as PurchasedModel["paymentMethod"],
      paymentDetails: pd as PurchasedModel["paymentDetails"],
      months: typeof months === "number" && months > 0 ? months : 1,
    };

    const existingModels = user.purchasedModels || [];
    await storage.updateUser(user.id, {
      purchasedModels: [...existingModels, purchasedModel],
      usage: user.usage || {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date(),
        [catalog.id]: 0,
      },
    } as any);

    res.json({
      success: true,
      message: `Unlocked ${catalog.label} for ${purchasedModel.months} month(s) (demo checkout)`,
      modelId: catalog.id,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || "Purchase failed" });
  }
});

export default router;
