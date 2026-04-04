import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema.js";
import { verifyToken } from "../services/auth.js";
import { getStorage } from "../storage.js";
import { resolveUserFromJwtPayload } from "../lib/resolve-user.js";

export type AuthedRequest = Request & { devmindxUser: User };

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = verifyToken(auth.slice(7)) as { id?: string | number; email?: string };
    const storage = await getStorage();
    const user = await resolveUserFromJwtPayload(storage, payload);
    if (!user) {
      return res.status(401).json({ message: "Account not found for this session" });
    }
    (req as AuthedRequest).devmindxUser = user;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
