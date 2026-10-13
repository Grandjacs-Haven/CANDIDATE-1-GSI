import axios from 'axios';
import { APP_HEADER_KEY } from 'config';
import { getCurrentAppHeaderValue } from 'utils/appIdentity';

const AUTH_STORAGE_KEY = 'shan-alert-auth-session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((requestConfig) => {
  const nextConfig = { ...requestConfig, headers: { ...(requestConfig.headers || {}) } };

  if (typeof window !== 'undefined') {
    try {
      const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const session = storedSession ? JSON.parse(storedSession) : null;

      if (session?.token) {
        nextConfig.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      // Ignore corrupted auth session and continue without the bearer token.
    }
  }

  nextConfig.headers[APP_HEADER_KEY] = nextConfig.headers[APP_HEADER_KEY] || getCurrentAppHeaderValue();

  return nextConfig;
});

export default api;
