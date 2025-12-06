/**
 * Token limits configuration for free tier Gemini API
 * These limits help prevent exceeding free tier quotas
 */

// Character to token ratio (approximate: 1 token ≈ 4 characters)
const CHARS_PER_TOKEN = 4;

// Token limits for different operations
export const TOKEN_LIMITS = {
  // Project Generation Limits
  PROJECT_GENERATION: {
    MAX_INPUT_CHARS: 2000,      // ~500 tokens input
    MAX_OUTPUT_TOKENS: 4000,     // ~4000 tokens output
    MAX_PROMPT_CHARS: 2000,      // Max prompt length
  },
  
  // Chat Limits
  CHAT: {
    MAX_INPUT_CHARS: 1000,       // ~250 tokens input per message
    MAX_OUTPUT_TOKENS: 2000,     // ~2000 tokens output
    MAX_MESSAGE_CHARS: 1000,     // Max message length
    MAX_HISTORY_MESSAGES: 5,     // Limit chat history to reduce tokens
  },
  
  // Code Generation Limits
  CODE_GENERATION: {
    MAX_INPUT_CHARS: 1500,       // ~375 tokens input
    MAX_OUTPUT_TOKENS: 3000,     // ~3000 tokens output
  },
  
  // Code Analysis Limits
  CODE_ANALYSIS: {
    MAX_INPUT_CHARS: 2000,       // ~500 tokens input
    MAX_OUTPUT_TOKENS: 2000,     // ~2000 tokens output
  },
} as const;

/**
 * Estimate token count from character count
 */
export function estimateTokens(chars: number): number {
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

/**
 * Validate input length against token limits
 */
export function validateInputLength(
  input: string,
  maxChars: number,
  operation: 'project' | 'chat' | 'code' | 'analysis'
): { valid: boolean; error?: string; estimatedTokens?: number } {
  const chars = input.length;
  const estimatedTokens = estimateTokens(chars);
  
  if (chars > maxChars) {
    const maxTokens = estimateTokens(maxChars);
    return {
      valid: false,
      error: `${operation === 'project' ? 'Project description' : operation === 'chat' ? 'Message' : 'Input'} is too long. Maximum ${maxChars} characters (approximately ${maxTokens} tokens). Current: ${chars} characters (approximately ${estimatedTokens} tokens).`,
      estimatedTokens
    };
  }
  
  return { valid: true, estimatedTokens };
}

/**
 * Get token limits for a specific operation
 */
export function getTokenLimits(operation: 'project' | 'chat' | 'code' | 'analysis') {
  switch (operation) {
    case 'project':
      return TOKEN_LIMITS.PROJECT_GENERATION;
    case 'chat':
      return TOKEN_LIMITS.CHAT;
    case 'code':
      return TOKEN_LIMITS.CODE_GENERATION;
    case 'analysis':
      return TOKEN_LIMITS.CODE_ANALYSIS;
    default:
      return TOKEN_LIMITS.CHAT;
  }
}

