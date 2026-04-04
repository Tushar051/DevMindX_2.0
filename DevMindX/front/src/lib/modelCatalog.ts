/** Paid LLM ids — must match server `IDE_CHAT_MODELS` / `/api/ide/models/purchase`. */
export type PaidLlmModelId = "gemini" | "deepseek" | "claude" | "chatgpt";

export type CheckoutModelInfo = {
  id: PaidLlmModelId;
  label: string;
  priceInr: number;
};

export const PAID_CHECKOUT_MODELS: CheckoutModelInfo[] = [
  { id: "gemini", label: "Google Gemini", priceInr: 749 },
  { id: "deepseek", label: "DeepSeek", priceInr: 1125 },
  { id: "claude", label: "Claude", priceInr: 1299 },
  { id: "chatgpt", label: "ChatGPT", priceInr: 1499 },
];

export function getPaidModel(modelId: string): CheckoutModelInfo | undefined {
  return PAID_CHECKOUT_MODELS.find((m) => m.id === modelId);
}

export function isPaidLlmModelId(id: string): id is PaidLlmModelId {
  return PAID_CHECKOUT_MODELS.some((m) => m.id === id);
}
