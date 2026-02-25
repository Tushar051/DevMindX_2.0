// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;

// Backend URL - use environment variable in production, localhost in development
// In production on Vercel, API is served from the same domain via /api routes
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment ? '' : '');

// Socket.IO URL - same as API base URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:5000' : window.location.origin);

// Helper to construct API endpoints
export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
