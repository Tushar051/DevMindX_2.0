import type { User } from "@shared/schema.js";
import type { IStorage } from "../storage.js";

type JwtUserPayload = {
  id?: string | number;
  email?: string;
};

/**
 * Maps a verified JWT payload to a storage user. Tries id as string, numeric id, and email
 * so checkout works when JWT id type does not match DB keys (e.g. MemStorage key "1" vs number 1).
 */
export async function resolveUserFromJwtPayload(
  storage: IStorage,
  payload: JwtUserPayload,
): Promise<User | undefined> {
  const idsToTry: (string | number)[] = [];

  if (payload.id !== undefined && payload.id !== null && payload.id !== "") {
    if (typeof payload.id === "number" && !Number.isNaN(payload.id)) {
      idsToTry.push(payload.id);
      idsToTry.push(String(payload.id));
    } else {
      const s = String(payload.id).trim();
      if (s.length > 0) {
        idsToTry.push(s);
        const n = Number(s);
        if (!Number.isNaN(n) && Number.isFinite(n)) idsToTry.push(n);
      }
    }
  }

  const seen = new Set<string>();
  for (const id of idsToTry) {
    const key = `${typeof id}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const user = await storage.getUser(id);
    if (user) return user;
  }

  const rawEmail = typeof payload.email === "string" ? payload.email.trim() : "";
  if (rawEmail.length > 0) {
    let user = await storage.getUserByEmail(rawEmail);
    if (!user && rawEmail !== rawEmail.toLowerCase()) {
      user = await storage.getUserByEmail(rawEmail.toLowerCase());
    }
    if (user) return user;
  }

  return undefined;
}
