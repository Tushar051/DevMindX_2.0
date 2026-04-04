import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RefreshCw, User } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type MeResponse = {
  user: {
    id: string | number;
    username: string;
    email: string;
    createdAt: string | null;
    isVerified: boolean;
  };
  purchasedHistory: {
    modelId: string;
    modelName: string;
    purchaseDate: string;
    months: number;
    paymentMethod: string;
    expirationDate: string;
    active: boolean;
  }[];
  usageSummary: {
    totalTokens: number;
    totalCost: number;
    lastReset: string;
  };
  tokenUsageByModel: {
    id: string;
    name: string;
    tokensPerMonth: number;
    used: number;
    remaining: number;
  }[];
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ProfilePage() {
  const { user: ctxUser } = useAuth();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/me"), { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof json.error === "string" ? json.error : "Could not load profile");
        setData(null);
        return;
      }
      setData(json as MeResponse);
    } catch {
      setErr("Network error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const displayUser = data?.user ?? ctxUser;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-zinc-600">Account details, purchases, and token usage.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div>
      )}

      {loading && !data ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile…
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">Account</h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-zinc-500">Username</dt>
                <dd className="font-medium text-zinc-900 mt-0.5">{displayUser?.username ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium text-zinc-900 mt-0.5 break-all">{displayUser?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">User ID</dt>
                <dd className="font-mono text-xs text-zinc-700 mt-0.5 break-all">{String(displayUser?.id ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Member since</dt>
                <dd className="font-medium text-zinc-900 mt-0.5">{formatDate(data?.user.createdAt ?? null)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Email verified</dt>
                <dd className="font-medium text-zinc-900 mt-0.5">
                  {data?.user.isVerified ? "Yes" : "Pending / not verified"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Purchase history</h2>
            <p className="text-sm text-zinc-600 mb-4">LLM unlocks from checkout (including demo payments).</p>
            {!data?.purchasedHistory?.length ? (
              <p className="text-sm text-zinc-500 py-4 text-center border border-dashed border-zinc-200 rounded-xl">
                No purchases yet.{" "}
                <Link to="/" className="text-indigo-600 font-medium hover:underline">
                  View pricing
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                {data.purchasedHistory.map((row, i) => (
                  <li key={`${row.modelId}-${row.purchaseDate}-${i}`} className="px-4 py-3 bg-zinc-50/50 hover:bg-zinc-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-zinc-900">{row.modelName}</span>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          row.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                        }`}
                      >
                        {row.active ? "Active" : "Expired"}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-zinc-600 sm:grid-cols-2">
                      <span>Purchased: {formatDate(row.purchaseDate)}</span>
                      <span>Valid until: {formatDate(row.expirationDate)}</span>
                      <span>Term: {row.months} month(s)</span>
                      <span className="capitalize">Paid with: {row.paymentMethod}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Token usage</h2>
            <p className="text-sm text-zinc-600 mb-4">
              Approximate tokens recorded per model this period. Totals:{" "}
              <strong className="text-zinc-800">{data?.usageSummary.totalTokens?.toLocaleString() ?? 0}</strong> tokens
              {typeof data?.usageSummary.totalCost === "number" && data.usageSummary.totalCost > 0 && (
                <>
                  {" "}
                  · cost tracked: {data.usageSummary.totalCost}
                </>
              )}
              .
            </p>
            {data?.usageSummary.lastReset ? (
              <p className="text-xs text-zinc-500 mb-4">Last reset / update: {formatDate(data.usageSummary.lastReset)}</p>
            ) : null}
            <ul className="space-y-4">
              {(data?.tokenUsageByModel ?? []).map((m) => {
                const pct = m.tokensPerMonth > 0 ? Math.min(100, Math.round((m.used / m.tokensPerMonth) * 100)) : 0;
                return (
                  <li key={m.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-zinc-800">{m.name}</span>
                      <span className="text-zinc-600">
                        {m.used.toLocaleString()} / {m.tokensPerMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{m.remaining.toLocaleString()} remaining this month</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
