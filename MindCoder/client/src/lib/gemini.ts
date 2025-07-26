/**
 * Gemini API service for interacting with Google's Gemini AI models
 * This service provides a client-side wrapper for the Gemini API
 */

interface GeminiResponse {
  text: string;
  status: 'success' | 'error';
  error?: string;
}

interface GeminiChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface CodeGenerationOptions {
  language?: string;
  framework?: string;
  context?: string;
}

interface ProjectGenerationOptions {
  name: string;
  description: string;
  framework?: string;
  features?: string[];
}

interface FileStructure {
  path: string;
  content: string;
}

interface ProjectStructure {
  name: string;
  description: string;
  framework: string;
  files: FileStructure[];
}

interface CodeAnalysisOptions {
  type: 'explain' | 'optimize' | 'debug' | 'refactor';
  code: string;
  language?: string;
}

export class GeminiService {
  private apiKey: string | null = null;
  private apiEndpoint = '/api/ai/gemini';
  private chatHistory: GeminiChatMessage[] = [];
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  /**
   * Set the API key for Gemini
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if the API key is set
   */
  hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Clear chat history
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      return {
        text: data.text,
        status: 'success'
      };
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      return {
        text: '',
        status: 'error',
        error: error.message || 'Failed to generate content with Gemini'
      };
    }
  }

  /**
   * Generate code using Gemini API
   */
  async generateCode(instruction: string, options?: CodeGenerationOptions): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify({
          instruction,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const data = await response.json();
      return {
        text: data.code || data.text,
        status: 'success'
      };
    } catch (error: any) {
      console.error('Error generating code with Gemini:', error);
      return {
        text: '',
        status: 'error',
        error: error.message || 'Failed to generate code with Gemini'
      };
    }
  }

  /**
   * Generate a complete project structure
   */
  async generateProject(options: ProjectGenerationOptions): Promise<ProjectStructure | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate project');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error generating project with Gemini:', error);
      return null;
    }
  }

  /**
   * Chat with Gemini AI
   */
  async chat(message: string, includeHistory: boolean = true): Promise<GeminiResponse> {
    try {
      // Add user message to history
      this.chatHistory.push({ role: 'user', content: message });
      
      const history = includeHistory ? this.chatHistory : [{ role: 'user', content: message }];
      
      const response = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify({ messages: history })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to chat with AI');
      }

      const data = await response.json();
      
      // Add AI response to history
      this.chatHistory.push({ role: 'model', content: data.text });
      
      return {
        text: data.text,
        status: 'success'
      };
    } catch (error: any) {
      console.error('Error chatting with Gemini:', error);
      return {
        text: '',
        status: 'error',
        error: error.message || 'Failed to chat with Gemini'
      };
    }
  }

  /**
   * Analyze code (explain, optimize, debug, refactor)
   */
  async analyzeCode(options: CodeAnalysisOptions): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze code');
      }

      const data = await response.json();
      return {
        text: data.analysis || data.text,
        status: 'success'
      };
    } catch (error: any) {
      console.error('Error analyzing code with Gemini:', error);
      return {
        text: '',
        status: 'error',
        error: error.message || 'Failed to analyze code with Gemini'
      };
    }
  }

  /**
   * Get code completion suggestions
   */
  async getCodeCompletions(code: string, language: string, cursorPosition: number): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
        },
        body: JSON.stringify({
          code,
          language,
          cursorPosition
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get code completions');
      }

      const data = await response.json();
      return data.completions || [];
    } catch (error: any) {
      console.error('Error getting code completions:', error);
      return [];
    }
  }
}

// Create a singleton instance for use throughout the application
export const geminiService = new GeminiService();