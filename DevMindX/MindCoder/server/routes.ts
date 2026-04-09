import type { Express } from "express";
import authRoutes from "./routes/auth.js";
import ideRoutes from "./routes/ide.js";
import runRoutes from "./routes/run.js";
import llmRoutes from "./routes/llm.js";
import researchRoutes from "./routes/research.js";
import projectRoutes from "./routes/projects.js";
import architectureRoutes from "./routes/architecture.js";
import learningRoutes from "./routes/learning.js";
import aiRoutes from "./routes/ai.js";

export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/ide", ideRoutes);
  app.use("/api/run", runRoutes);
  app.use("/api/llm", llmRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/architecture", architectureRoutes);
  app.use("/api/learning", learningRoutes);
  app.use("/api/ai", aiRoutes);
}
