import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/** Handles ?token=&user= after OAuth redirect (same pattern as legacy client). */
export function OAuthCallbackHandler() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userData = params.get("user");
    const oauthError = params.get("error");
    const provider = params.get("provider");

    if (oauthError === "oauth_not_configured" && provider) {
      window.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured on the server.`,
      );
      const u = new URL(window.location.href);
      u.searchParams.delete("error");
      u.searchParams.delete("provider");
      window.history.replaceState({}, "", u.toString());
      return;
    }

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        login(token, user);
        const u = new URL(window.location.href);
        u.searchParams.delete("token");
        u.searchParams.delete("user");
        window.history.replaceState({}, "", u.toString());
        navigate("/app/generator", { replace: true });
      } catch {
        console.error("OAuth user parse failed");
      }
    }
  }, [login, navigate]);

  return null;
}
