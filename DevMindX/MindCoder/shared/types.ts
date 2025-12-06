// Shared type definitions for the DevMindX application

// AI Model types
export type AIModelId = 'together' | 'gemini' | 'chatgpt' | 'claude' | 'deepseek';

export interface Diagnostic {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

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
  fileChanges?: FileChange[]; // New field for AI-driven code modifications
}

export interface FileChange {
  filePath: string;
  newContent?: string; // Content for 'create' or 'update'
  action: 'create' | 'update' | 'delete';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  language?: string;
  fileChanges?: FileChange[]; // Add fileChanges to ChatMessage as well
  image?: string; // Base64 encoded image data for image uploads
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
  image?: string; // Base64 encoded image data
}

// Live Collaboration Types
export interface CollaborationSession {
  id: string;
  projectId: string;
  hostUserId: string;
  hostUsername: string;
  sessionName: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  maxParticipants: number;
  participants: CollaborationParticipant[];
  settings: CollaborationSettings;
}

export interface CollaborationParticipant {
  userId: string;
  username: string;
  email: string;
  joinedAt: Date;
  isOnline: boolean;
  lastActivity: Date;
  currentFile?: string;
  cursorPosition?: CursorPosition;
  color: string; // Unique color for each participant
}

export interface CollaborationSettings {
  allowFileEditing: boolean;
  allowChat: boolean;
  allowUserKick: boolean;
  requireApproval: boolean;
  autoSave: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
  filePath: string;
}

export interface CollaborationMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'file-change' | 'user-join' | 'user-leave';
}

export interface FileChange {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  filePath: string;
  changeType: 'create' | 'modify' | 'delete' | 'rename';
  timestamp: Date;
  description: string;
}

export interface CollaborationInvite {
  id: string;
  sessionId: string;
  inviteCode: string;
  hostUserId: string;
  hostUsername: string;
  projectName: string;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
}

// Real-time Events
export interface CollaborationEvent {
  type: 'user-joined' | 'user-left' | 'file-changed' | 'cursor-moved' | 'chat-message' | 'session-ended';
  data: any;
  timestamp: Date;
}

