import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { Profile as GitHubProfile } from "passport-github2";
import type { Profile as GoogleProfile } from "passport-google-oauth20";
import type { User } from "@shared/schema.js";
import { getStorage } from "../storage.js";
import { hashPassword } from "../services/auth.js";

function apiBase(): string {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/$/, "");
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  const port = process.env.PORT || "5000";
  return `http://localhost:${port}`;
}

function googleCallbackURL(): string {
  return (
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    `${apiBase()}/api/auth/google/callback`
  );
}

function githubCallbackURL(): string {
  return (
    process.env.GITHUB_CALLBACK_URL?.trim() ||
    `${apiBase()}/api/auth/github/callback`
  );
}

async function ensureVerifiedOAuthUser(
  provider: "google" | "github",
  profileId: string,
  email: string,
  displayName: string,
): Promise<User> {
  const storage = await getStorage();
  const randomPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));

  if (provider === "google") {
    let user = await storage.getUserByGoogleId(profileId);
    if (user) return user;
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return storage.updateUser(existing.id, { googleId: profileId, isVerified: true });
    }
    const base = (displayName || email.split("@")[0] || "user")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .slice(0, 24);
    const username = `${base}_${profileId.slice(-4)}`;
    let created = await storage.createUser({
      username,
      email,
      password: randomPassword,
      googleId: profileId,
    });
    return storage.updateUser(created.id, { isVerified: true });
  }

  let user = await storage.getUserByGithubId(profileId);
  if (user) return user;
  const existing = await storage.getUserByEmail(email);
  if (existing) {
    return storage.updateUser(existing.id, { githubId: profileId, isVerified: true });
  }
  const base = (displayName || email.split("@")[0] || "user")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 24);
  const username = `${base}_${profileId.slice(-4)}`;
  let created = await storage.createUser({
    username,
    email,
    password: randomPassword,
    githubId: profileId,
  });
  return storage.updateUser(created.id, { isVerified: true });
}

/**
 * Registers OAuth strategies from .env (GOOGLE_*, GITHUB_*).
 * Callback URLs must hit this API (e.g. http://localhost:5000/...) — add the same URIs in Google/GitHub developer consoles.
 */
export function registerPassportStrategies(): void {
  const gid = process.env.GOOGLE_CLIENT_ID?.trim();
  const gsec = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (gid && gsec) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: gid,
          clientSecret: gsec,
          callbackURL: googleCallbackURL(),
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: GoogleProfile,
          done: (err: Error | null, user?: User) => void,
        ) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("Google did not return an email (check OAuth scopes)."));
            }
            const user = await ensureVerifiedOAuthUser(
              "google",
              profile.id,
              email,
              profile.displayName || email.split("@")[0],
            );
            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        },
      ),
    );
  } else {
    console.warn("[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled.");
  }

  const hid = process.env.GITHUB_CLIENT_ID?.trim();
  const hsec = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (hid && hsec) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: hid,
          clientSecret: hsec,
          callbackURL: githubCallbackURL(),
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: GitHubProfile,
          done: (err: Error | null, user?: User) => void,
        ) => {
          try {
            const githubId = String(profile.id);
            const email =
              (profile.emails && profile.emails[0] && profile.emails[0].value) ||
              (profile.username ? `${profile.username}@users.noreply.github.com` : "");
            if (!email) {
              return done(new Error("GitHub did not return an email; try granting user:email scope."));
            }
            const displayName = profile.displayName || profile.username || email.split("@")[0];
            const user = await ensureVerifiedOAuthUser("github", githubId, email, displayName);
            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        },
      ),
    );
  } else {
    console.warn("[auth] GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set — GitHub login disabled.");
  }
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function isGitHubOAuthConfigured(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim());
}
