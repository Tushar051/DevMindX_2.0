/** Mirrors server checks for demo checkout (see MindCoder server/routes/ide.ts). */

export function validateDummyPaymentFields(
  paymentMethod: "credit" | "debit" | "upi",
  rawUpiId: string,
  rawCardLast4: string,
): string | null {
  if (paymentMethod === "upi") {
    const upiId = rawUpiId.trim();
    if (!/^[^\s@]+@[^\s@]+$/.test(upiId) || upiId.length < 5) {
      return "UPI must look like name@bank (no spaces), at least 5 characters.";
    }
    return null;
  }
  const last4 = rawCardLast4.replace(/\D/g, "");
  if (last4.length !== 4) {
    return "Card: enter exactly 4 digits (last four on the card), e.g. 4242.";
  }
  return null;
}

export function buildDummyPaymentDetails(
  paymentMethod: "credit" | "debit" | "upi",
  rawUpiId: string,
  rawCardLast4: string,
): { upiId: string } | { cardLast4: string; cardholderName: string } {
  if (paymentMethod === "upi") {
    return { upiId: rawUpiId.trim() };
  }
  const last4 = rawCardLast4.replace(/\D/g, "").slice(-4);
  return { cardLast4: last4, cardholderName: "Demo User" };
}
