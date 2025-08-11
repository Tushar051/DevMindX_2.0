// Shared type definitions for the DevMindX application

// AI Model types
export type AIModelId = 'together' | 'gemini' | 'chatgpt' | 'claude' | 'deepseek';

export interface AIModel {
  id: AIModelId;
  name: string;
  description: string;
  available: boolean; // Whether the model is available based on API key presence
  complexity: 'Basic' | 'Medium' | 'Complex';
  tokensPerMonth: number;
  pricePerToken: number;
  price: number; // Monthly price for subscription
  features: string[];
  purchased?: boolean; // Whether the user has purchased this model
  // Add expirationDate for client-side display
  expirationDate?: string; // ISO string of expiration date
}

export interface PaymentDetails {
  cardLast4?: string;
  cardExpiry?: string;
  cardholderName?: string;
  upiId?: string;
}

export interface PurchasedModel {
  id: AIModelId;
  purchaseDate: string; // ISO string of purchase date
  paymentMethod: 'credit' | 'debit' | 'upi';
  paymentDetails: PaymentDetails;
  months: number;
}

export interface AIResponse {
  content: string;
  model: AIModelId;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  language?: string;
}

export interface ProjectGenerationRequest {
  prompt: string;
  model: AIModelId;
  framework?: string;
  name?: string;
}

export interface CodeGenerationRequest {
  instruction: string;
  model: AIModelId;
  context?: string;
  language?: string;
}

export interface ChatRequest {
  message: string;
  model: AIModelId;
  chatHistory?: ChatMessage[];
  projectContext?: any;
}

