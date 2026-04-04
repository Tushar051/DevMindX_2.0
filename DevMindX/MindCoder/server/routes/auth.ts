import { Router, type Response } from "express";
import passport from "passport";
import type { User } from "@shared/schema.js";
import type { PurchasedModel } from "../../shared/types.js";
import { getStorage } from "../storage.js";
import { resolveUserFromJwtPayload } from "../lib/resolve-user.js";
import {
  authenticateUser,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateOTP,
  getOTPExpiry,
} from "../services/auth.js";
import { sendOTPVerificationEmail } from "../services/email.js";
import {
  isGitHubOAuthConfigured,
  isGoogleOAuthConfigured,
} from "../auth/passport-setup.js";

const router = Router();

function publicUser(u: { id: string | number; username: string; email: string }) {
  return { id: u.id, username: u.username, email: u.email };
}

/**
 * Where the SPA runs for redirects (OAuth success/failure, verify-email links).
 * In development, do not use production FRONTEND_URL — local OAuth would send
 * the browser to prod (often 404 or wrong app). Override with FRONTEND_URL_DEV if needed.
 */
function frontendBase(): string {
  const isDev = process.env.NODE_ENV === "development";
  const raw = isDev
    ? (process.env.FRONTEND_URL_DEV || "http://localhost:5173")
    : (process.env.FRONTEND_URL || "http://localhost:5173");
  return raw.replace(/\/$/, "");
}

function oauthFailureRedirect(): string {
  return `${frontendBase()}/login?error=oauth`;
}

function redirectWithJwt(res: Response, user: User) {
  const token = generateToken(user);
  const u = encodeURIComponent(JSON.stringify(publicUser(user)));
  res.redirect(`${frontendBase()}/login?token=${encodeURIComponent(token)}&user=${u}`);
}

/** Email + password login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const storage = await getStorage();
    const user = await storage.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res.status(401).json({ message: "Please set a password or use OAuth login" });
    }
    if (!user.isVerified) {
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.json({ requiresOTP: true, email: user.email });
    }
    const u = await authenticateUser(String(email).trim(), password);
    const token = generateToken(u);
    return res.json({ token, user: publicUser(u) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Login failed";
    return res.status(401).json({ message: msg });
  }
});

/** Register — sends OTP in dev (see server console) or email */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body ?? {};
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Username, email, and password required" });
    }
    const storage = await getStorage();
    const existing = await storage.getUserByEmail(String(email).trim());
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const existingName = await storage.getUserByUsername(String(username).trim());
    if (existingName) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const hashed = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    await storage.createUser({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      password: hashed,
      otp,
      otpExpiry,
    });
    await sendOTPVerificationEmail(String(email).trim(), otp);
    return res.json({ email: String(email).trim(), message: "Verification code sent" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    return res.status(400).json({ message: msg });
  }
});

/** Verify email OTP (signup or login when unverified) */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }
    const storage = await getStorage();
    const user = await storage.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (String(user.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: "Code expired — request a new one" });
    }
    const updated = await storage.updateUser(user.id, {
      isVerified: true,
      otp: null,
      otpExpiry: null,
    });
    const token = generateToken(updated);
    return res.json({ token, user: publicUser(updated) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return res.status(400).json({ message: msg });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    const storage = await getStorage();
    const user = await storage.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    await storage.updateUser(user.id, { otp, otpExpiry });
    await sendOTPVerificationEmail(String(email).trim(), otp);
    return res.json({ message: "Code sent" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to resend";
    return res.status(400).json({ message: msg });
  }
});

/** Legacy email link verification */
router.get("/verify", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }
  try {
    const storage = await getStorage();
    const user = await storage.verifyUser(token);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }
    return res.redirect(`${frontendBase()}/login?verified=1`);
  } catch {
    return res.status(400).json({ message: "Verification failed" });
  }
});

/** Google OAuth — start */
router.get("/google", (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      message: "Google OAuth is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
      error: "oauth_not_configured",
      provider: "google",
    });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
      return res.status(503).json({ message: "Google OAuth not configured" });
    }
    passport.authenticate("google", {
      session: false,
      failureRedirect: oauthFailureRedirect(),
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user as User | undefined;
    if (!user) {
      return res.redirect(oauthFailureRedirect());
    }
    return redirectWithJwt(res, user);
  },
);

/** GitHub OAuth — start */
router.get("/github", (req, res, next) => {
  if (!isGitHubOAuthConfigured()) {
    return res.status(503).json({
      message: "GitHub OAuth is not configured (set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)",
      error: "oauth_not_configured",
      provider: "github",
    });
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

router.get(
  "/github/callback",
  (req, res, next) => {
    if (!isGitHubOAuthConfigured()) {
      return res.status(503).json({ message: "GitHub OAuth not configured" });
    }
    passport.authenticate("github", {
      session: false,
      failureRedirect: oauthFailureRedirect(),
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user as User | undefined;
    if (!user) {
      return res.redirect(oauthFailureRedirect());
    }
    return redirectWithJwt(res, user);
  },
);

const MODEL_LABELS: Record<string, string> = {
  together: "Together AI",
  gemini: "Google Gemini",
  chatgpt: "ChatGPT",
  claude: "Claude",
  deepseek: "DeepSeek",
};

const MODEL_TOKEN_QUOTAS: { id: string; name: string; tokensPerMonth: number }[] = [
  { id: "together", name: "Together AI", tokensPerMonth: 10_000 },
  { id: "gemini", name: "Google Gemini", tokensPerMonth: 50_000 },
  { id: "chatgpt", name: "ChatGPT", tokensPerMonth: 100_000 },
  { id: "claude", name: "Claude", tokensPerMonth: 100_000 },
  { id: "deepseek", name: "DeepSeek", tokensPerMonth: 50_000 },
];

/** Current account: profile, purchases, token usage (Bearer JWT). */
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (typeof auth !== "string" || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let payload: { id?: string | number; email?: string };
    try {
      payload = verifyToken(auth.slice(7)) as { id?: string | number; email?: string };
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    const storage = await getStorage();
    const user = await resolveUserFromJwtPayload(storage, payload);
    if (!user) {
      return res.status(401).json({ error: "Account not found for this session" });
    }

    const rawPurchased = (user.purchasedModels || []) as PurchasedModel[];
    const now = new Date();
    const purchasedHistory = rawPurchased.map((pm) => {
      const purchaseDate = new Date(pm.purchaseDate);
      const expirationDate = new Date(purchaseDate.getTime());
      expirationDate.setMonth(expirationDate.getMonth() + (typeof pm.months === "number" ? pm.months : 1));
      return {
        modelId: pm.id,
        modelName: MODEL_LABELS[pm.id] || pm.id,
        purchaseDate: pm.purchaseDate,
        months: pm.months,
        paymentMethod: pm.paymentMethod,
        expirationDate: expirationDate.toISOString(),
        active: expirationDate > now,
      };
    });

    const usage = user.usage || {
      totalTokens: 0,
      totalCost: 0,
      lastReset: new Date(),
    };
    const u = usage as Record<string, unknown>;

    const tokenUsageByModel = MODEL_TOKEN_QUOTAS.map((m) => {
      const used = typeof u[m.id] === "number" ? (u[m.id] as number) : 0;
      return {
        id: m.id,
        name: m.name,
        tokensPerMonth: m.tokensPerMonth,
        used,
        remaining: Math.max(0, m.tokensPerMonth - used),
      };
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        isVerified: user.isVerified ?? true,
      },
      purchasedHistory,
      usageSummary: {
        totalTokens: typeof u.totalTokens === "number" ? u.totalTokens : 0,
        totalCost: typeof u.totalCost === "number" ? u.totalCost : 0,
        lastReset: u.lastReset instanceof Date ? u.lastReset.toISOString() : String(u.lastReset ?? ""),
      },
      tokenUsageByModel,
    });
  } catch (e) {
    console.error("GET /auth/me:", e);
    res.status(500).json({ error: "Failed to load account" });
  }
});

export default router;
