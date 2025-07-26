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

  generate: async (data: { name: string; framework: string; description: string }): Promise<Project> => {
    const response = await apiRequest('POST', '/api/projects/generate', data);
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
  getModels: async (): Promise<{ models: string[] }> => {
    const response = await apiRequest('GET', '/api/ai/models');
    return response.json();
  },

  generateCode: async (instruction: string, model: string = 'gemini', context?: string, language?: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ai/generate-code', { instruction, model, context, language });
    return response.json();
  },

  generateProject: async (prompt: string, model: string = 'gemini', framework?: string, name?: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ai/generate-code', { instruction: prompt, model, context: framework, language: name });
    return response.json();
  },

  chat: async (message: string, model: string = 'gemini', chatHistory?: any[], projectContext?: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/ai/chat', { message, model, chatHistory, projectContext });
    return response.json();
  },

  analyzeCode: async (code: string, task: string, model: string = 'gemini'): Promise<any> => {
    const response = await apiRequest('POST', '/api/ai/analyze-code', { code, task, model });
    return response.json();
  },

  getChatHistory: async (projectId: number): Promise<{ messages: any[] }> => {
    const response = await apiRequest('GET', `/api/chat/${projectId}`);
    return response.json();
  }
};
