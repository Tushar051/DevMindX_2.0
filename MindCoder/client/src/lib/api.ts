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
  generateCode: async (prompt: string, context?: string): Promise<{ code: string }> => {
    const response = await apiRequest('POST', '/api/ai/generate-code', { prompt, context });
    return response.json();
  },

  chat: async (message: string, projectId?: number, conversationHistory?: any[]): Promise<{ response: string }> => {
    const response = await apiRequest('POST', '/api/ai/chat', { message, projectId, conversationHistory });
    return response.json();
  },

  getChatHistory: async (projectId: number): Promise<{ messages: any[] }> => {
    const response = await apiRequest('GET', `/api/chat/${projectId}`);
    return response.json();
  }
};
