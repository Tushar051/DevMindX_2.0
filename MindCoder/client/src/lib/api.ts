import { apiRequest } from './queryClient';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  framework: string;
  files: { [path: string]: string };
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  content: string;
  model: string;
  timestamp: string;
}

export interface ChatResponse {
  content?: string;
  response?: string;
  message?: string;
  model: string;
  timestamp: string;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    return response.json();
  },

  signup: async (username: string, email: string, password: string): Promise<{ message: string }> => {
    const response = await apiRequest('POST', '/api/auth/signup', { username, email, password });
    return response.json();
  },

  verify: async (token: string): Promise<{ message: string }> => {
    const response = await apiRequest('GET', `/api/auth/verify?token=${token}`);
    return response.json();
  },

  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/verify-otp', { email, otp });
    return response.json();
  },

  resendOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiRequest('POST', '/api/auth/resend-otp', { email });
    return response.json();
  }
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiRequest('GET', '/api/projects');
    return response.json();
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiRequest('GET', `/api/projects/${id}`);
    return response.json();
  },

  create: async (project: { name: string; description?: string; framework: string }): Promise<Project> => {
    const response = await apiRequest('POST', '/api/projects', project);
    return response.json();
  },

  // FIXED: Use correct endpoint and default model
  generate: async (data: { name: string; framework: string; description: string; model?: string }): Promise<Project> => {
    const response = await apiRequest('POST', '/api/projects/generate', {
      ...data,
      model: data.model || 'together' // Use 'together' as default instead of 'gemini'
    });
    return response.json();
  },

  update: async (id: number, updates: Partial<Project>): Promise<Project> => {
    const response = await apiRequest('PUT', `/api/projects/${id}`, updates);
    return response.json();
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiRequest('DELETE', `/api/projects/${id}`);
    return response.json();
  }
};

// AI API
export const aiApi = {
  getModels: async (): Promise<{ id: string; name: string; description: string; available: boolean }[]> => {
    const response = await apiRequest('GET', '/api/ai/models');
    return response.json();
  },

  // FIXED: Use 'together' as default model
  generateCode: async (
    instruction: string, 
    model: string = 'together', 
    context?: string, 
    language?: string
  ): Promise<AIResponse> => {
    const response = await apiRequest('POST', '/api/ai/generate-code', { 
      instruction, 
      model, 
      context, 
      language 
    });
    const data = await response.json();
    
    // Handle different response formats
    return {
      content: data.content || data.response || data.message || 'No response generated',
      model: data.model || model,
      timestamp: data.timestamp || new Date().toISOString()
    };
  },

  // FIXED: Remove this duplicate - project generation should use projectsApi.generate
  // generateProject: async (prompt: string, model: string = 'together', framework?: string, name?: string): Promise<any> => {
  //   return projectsApi.generate({ name: name || 'Generated Project', framework: framework || 'web', description: prompt, model });
  // },

  // FIXED: Use 'together' as default and handle response properly
  chat: async (
    message: string, 
    model: string = 'together', 
    chatHistory?: any[], 
    projectContext?: any
  ): Promise<string> => {
    console.log('API: Sending chat request:', { message, model, hasHistory: !!chatHistory?.length, hasContext: !!projectContext });
    
    try {
      const response = await apiRequest('POST', '/api/ai/chat', { 
        message, 
        model, 
        chatHistory: chatHistory || [], 
        projectContext: projectContext || {
          currentFile: '',
          currentFileContent: '',
          fileTree: []
        }
      });
      
      const data = await response.json();
      console.log('API: Received chat response:', data);
      
      // Extract content from various possible response formats
      const content = data.content || data.response || data.message || data.reply;
      
      if (!content) {
        console.error('API: No content found in response:', data);
        throw new Error('No response content received from server');
      }
      
      return content;
      
    } catch (error) {
      console.error('API: Chat request failed:', error);
      throw error;
    }
  },

  // FIXED: Use 'together' as default
  analyzeCode: async (
    code: string, 
    task: string, 
    model: string = 'together'
  ): Promise<AIResponse> => {
    const response = await apiRequest('POST', '/api/ai/analyze-code', { code, task, model });
    const data = await response.json();
    
    return {
      content: data.content || data.response || data.message || 'No analysis generated',
      model: data.model || model,
      timestamp: data.timestamp || new Date().toISOString()
    };
  },

  getChatHistory: async (projectId: number): Promise<{ messages: any[] }> => {
    const response = await apiRequest('GET', `/api/chat/${projectId}`);
    return response.json();
  }
};

// IDE API (if you have IDE-specific endpoints)
export const ideApi = {
  executeCode: async (filePath: string, content: string, language: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ide/run', { filePath, content, language });
    return response.json();
  },

  runTerminalCommand: async (command: string, workingDirectory?: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ide/terminal', { command, workingDirectory });
    return response.json();
  },

  manageFiles: async (action: string, filePath: string, content?: string, newPath?: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ide/files', { action, filePath, content, newPath });
    return response.json();
  },

  getFiles: async (): Promise<any[]> => {
    const response = await apiRequest('GET', '/api/ide/files');
    return response.json();
  }
};