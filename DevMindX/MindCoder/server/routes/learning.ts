import { Router } from "express";
import { requireUser } from "../middleware/require-user.js";
import { chatWithAIModel } from "../services/aiService.js";

const router = Router();
router.use(requireUser);

router.post("/analyze", async (req, res) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ message: "code is required" });
    }
    const trimmed = code.trim();
    if (trimmed.length > 120_000) {
      return res.status(400).json({ message: "Code is too long (max ~120k chars). Upload a smaller snippet or project slice." });
    }

    const prompt = `You are a patient programming tutor. Analyze the following code (or project notes) and teach the learner.

CODE / NOTES:
\`\`\`
${trimmed.slice(0, 100_000)}
\`\`\`

Return ONLY valid JSON (no markdown) with this shape:
{
  "summary": "2-4 paragraph overview of what the code does and key concepts",
  "explanations": [
    {
      "file": "logical name e.g. main.ts",
      "lines": [
        { "lineNumber": 1, "code": "short snippet", "explanation": "plain language explanation" }
      ]
    }
  ],
  "quiz": [
    { "question": "...", "options": ["A","B","C","D"], "correctAnswer": 0 }
  ],
  "vivaQuestions": ["Question 1?", "Question 2?", "Question 3?"]
}

Include at least 3 quiz questions and 5 viva questions. Explanations: 5-15 line entries covering important parts. If input is not code, treat it as a spec and still produce educational content.`;

    const out = await chatWithAIModel({
      message: prompt,
      model: "together",
      chatHistory: [],
      projectContext: {},
    });

    try {
      const m = out.content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("no json");
      const j = JSON.parse(m[0]) as Record<string, unknown>;
      res.json({
        summary: typeof j.summary === "string" ? j.summary : out.content.slice(0, 2000),
        explanations: Array.isArray(j.explanations) ? j.explanations : [],
        quiz: Array.isArray(j.quiz) ? j.quiz : [],
        vivaQuestions: Array.isArray(j.vivaQuestions) ? j.vivaQuestions : [],
      });
    } catch {
      res.json({
        summary: out.content,
        explanations: [],
        quiz: [],
        vivaQuestions: [],
      });
    }
  } catch (e) {
    console.error("POST /learning/analyze:", e);
    res.status(500).json({ message: (e as Error).message || "Learning analysis failed" });
  }
});

export default router;
