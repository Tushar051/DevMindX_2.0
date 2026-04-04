import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { buildDummyPaymentDetails, validateDummyPaymentFields } from "@/lib/dummyPaymentValidation";

const chrome = {
  sidebar: "#252526",
  border: "#3c3c3c",
};

export type IdePurchaseTarget = {
  id: string;
  label: string;
  priceInr: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  target: IdePurchaseTarget | null;
  isAuthenticated: boolean;
  onPurchased: (modelId: string) => void | Promise<void>;
};

export function IdeModelPurchaseModal({
  open,
  onClose,
  target,
  isAuthenticated,
  onPurchased,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "upi">("credit");
  const [cardLast4, setCardLast4] = useState("4242");
  const [upiId, setUpiId] = useState("user@upi");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open || !target) return null;

  const resetAndClose = () => {
    setErr(null);
    setBusy(false);
    onClose();
  };

  const submit = async () => {
    if (!isAuthenticated) return;
    setErr(null);
    const fieldErr = validateDummyPaymentFields(paymentMethod, upiId, cardLast4);
    if (fieldErr) {
      setErr(fieldErr);
      return;
    }
    setBusy(true);
    try {
      const paymentDetails = buildDummyPaymentDetails(paymentMethod, upiId, cardLast4);

      const res = await fetch(apiUrl("/api/ide/models/purchase"), {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: target.id,
          months: 1,
          paymentMethod,
          paymentDetails,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Payment failed");
        return;
      }
      onPurchased(target.id);
      resetAndClose();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4" role="dialog">
      <div
        className="w-full max-w-md rounded-xl border p-4 shadow-2xl"
        style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#e0e0e0]">Unlock {target.label}</h3>
            <p className="mt-1 text-[11px] text-[#888]">
              Dummy checkout — no real charge. One month access (demo).
            </p>
          </div>
          <button type="button" onClick={resetAndClose} className="rounded p-1 hover:bg-white/10" aria-label="Close">
            <X className="h-4 w-4 text-[#aaa]" />
          </button>
        </div>

        <div
          className="mb-4 rounded-lg border px-3 py-2.5"
          style={{ borderColor: chrome.border, backgroundColor: "#1e1e1e" }}
        >
          <p className="text-[10px] uppercase tracking-wide text-[#666]">Due today</p>
          <p className="text-lg font-semibold text-violet-300">₹{target.priceInr}</p>
        </div>

        {!isAuthenticated ? (
          <p className="mb-4 text-[12px] text-[#aaa]">
            Sign in to unlock this model.{" "}
            <Link to="/login" className="text-violet-400 underline hover:text-violet-300" onClick={resetAndClose}>
              Go to login
            </Link>
          </p>
        ) : (
          <>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[#666]">Payment method</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {(
                [
                  ["credit", "Credit card"],
                  ["debit", "Debit card"],
                  ["upi", "UPI"],
                ] as const
              ).map(([id, lab]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
                    paymentMethod === id
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                      : "border-[#474747] text-[#bbb] hover:bg-white/5"
                  }`}
                >
                  {lab}
                </button>
              ))}
            </div>

            {paymentMethod === "upi" ? (
              <label className="mb-3 block text-[11px]">
                <span className="mb-1 block text-[#888]">UPI ID (demo)</span>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded border bg-[#1e1e1e] px-2 py-1.5 text-[12px] text-[#e0e0e0] outline-none focus:border-violet-500/50"
                  style={{ borderColor: chrome.border }}
                />
              </label>
            ) : (
              <label className="mb-3 block text-[11px]">
                <span className="mb-1 block text-[#888]">Card last 4 digits (demo)</span>
                <input
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full rounded border bg-[#1e1e1e] px-2 py-1.5 text-[12px] text-[#e0e0e0] outline-none focus:border-violet-500/50"
                  style={{ borderColor: chrome.border }}
                />
              </label>
            )}

            {err && <p className="mb-2 text-[11px] text-red-400">{err}</p>}
          </>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg border px-3 py-2 text-[12px] text-[#ccc] hover:bg-white/5"
            style={{ borderColor: chrome.border }}
          >
            Cancel
          </button>
          {isAuthenticated && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Pay ₹{target.priceInr}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
