import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { apiUrl, authHeaders } from "@/lib/api";
import { buildDummyPaymentDetails, validateDummyPaymentFields } from "@/lib/dummyPaymentValidation";
import { getPaidModel } from "@/lib/modelCatalog";

export function ModelCheckoutPage() {
  const { modelId = "" } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const model = getPaidModel(modelId);

  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "upi">("credit");
  const [cardLast4, setCardLast4] = useState("4242");
  const [upiId, setUpiId] = useState("user@upi");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!model) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">Unknown plan</h1>
        <p className="mt-2 text-sm text-zinc-600">This model is not available for checkout.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to home
        </Link>
      </div>
    );
  }

  const submit = async () => {
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
          modelId: model.id,
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
      navigate("/app/ide", { replace: true, state: { unlockedModel: model.id } });
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unlock model</p>
            <h1 className="text-xl font-semibold text-zinc-900">{model.label}</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Demo payment — no real charge. After confirming, this model unlocks in the IDE and AI chat.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total due</p>
          <p className="text-2xl font-bold text-zinc-900">₹{model.priceInr}</p>
          <p className="text-xs text-zinc-500 mt-1">1 month access (demo)</p>
        </div>

        <p className="text-xs font-medium text-zinc-700 mb-2">Payment method</p>
        <div className="flex flex-wrap gap-2 mb-4">
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
              className={`rounded-lg border px-3 py-2 text-sm ${
                paymentMethod === id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {lab}
            </button>
          ))}
        </div>

        {paymentMethod === "upi" ? (
          <label className="block mb-4">
            <span className="text-xs text-zinc-600 mb-1 block">UPI ID (demo)</span>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        ) : (
          <label className="block mb-4">
            <span className="text-xs text-zinc-600 mb-1 block">Card last 4 digits (demo)</span>
            <input
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value)}
              maxLength={4}
              inputMode="numeric"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        )}

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Pay ₹{model.priceInr} & unlock
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Already unlocked?{" "}
        <Link to="/app/ide" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Open IDE
        </Link>
      </p>
    </div>
  );
}
