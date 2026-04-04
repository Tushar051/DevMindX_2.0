/** Same-origin when served by Express; override with VITE_API_URL for split deploys */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem("devmindx_token");
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
