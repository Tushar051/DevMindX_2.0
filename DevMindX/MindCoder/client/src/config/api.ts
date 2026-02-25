// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;

// Backend URL configuration
// In production: Use the Render backend URL
// In development: Use local server
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:5000' : 'https://devmindx.onrender.com');

// Socket.IO URL - same as API base URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

// Helper to construct API endpoints
export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
