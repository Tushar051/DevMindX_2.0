// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;

// Backend URL - use environment variable in production, localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment ? '' : '');

// Socket.IO URL - same as API base URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:5000' : window.location.origin);

// Helper to construct API endpoints
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
