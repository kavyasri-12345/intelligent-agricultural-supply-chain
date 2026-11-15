/**
 * Centralized API Configuration & Client
 * Intelligent Spoilage-Aware Coordination and Optimization of Perishable Agricultural Supply Chains
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Node.js Express Application Backend (Render / Production)
 * - NEXT_PUBLIC_AI_API_URL: Python FastAPI AI & Optimization Backend (Render / Production)
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Resolves the Node.js Express Backend Base URL.
 * In production: Requires NEXT_PUBLIC_API_URL. Never silently falls back to localhost.
 * In development: Falls back to http://localhost:5000 if variable is unset.
 */
export function getBackendBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (isProduction) {
    if (!envUrl || envUrl.trim() === '') {
      const errorMsg = 
        "[AgriOptima Production Error]: Missing required environment variable 'NEXT_PUBLIC_API_URL'. " +
        "Please configure NEXT_PUBLIC_API_URL in your Vercel Project Settings to point to your deployed Express backend.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Development fallback
  const devUrl = envUrl?.trim() || 'http://localhost:5000';
  return devUrl.replace(/\/+$/, '');
}

/**
 * Resolves the Python FastAPI AI & Optimization Service Base URL.
 * In production: Requires NEXT_PUBLIC_AI_API_URL. Never silently falls back to localhost.
 * In development: Falls back to http://localhost:8000 if variable is unset.
 */
export function getAiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_AI_URL;

  if (isProduction) {
    if (!envUrl || envUrl.trim() === '') {
      const errorMsg = 
        "[AgriOptima Production Error]: Missing required environment variable 'NEXT_PUBLIC_AI_API_URL'. " +
        "Please configure NEXT_PUBLIC_AI_API_URL in your Vercel Project Settings to point to your deployed FastAPI backend.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Development fallback
  const devUrl = envUrl?.trim() || 'http://localhost:8000';
  return devUrl.replace(/\/+$/, '');
}

/**
 * Builds a normalized, fully qualified URL for the Node.js Express Backend.
 * Ensures no duplicate '/api/v1' or accidental double slashes.
 */
export function getBackendUrl(endpoint: string): string {
  const base = getBackendBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If the base URL already ends with '/api/v1'
  if (base.endsWith('/api/v1')) {
    if (cleanEndpoint.startsWith('/api/v1/')) {
      const stripped = cleanEndpoint.replace(/^\/api\/v1/, '');
      return `${base}${stripped}`;
    }
    return `${base}${cleanEndpoint}`;
  }

  // If base URL does NOT end with /api/v1, ensure the endpoint contains /api/v1
  if (cleanEndpoint.startsWith('/api/v1')) {
    return `${base}${cleanEndpoint}`;
  }

  return `${base}/api/v1${cleanEndpoint}`;
}

/**
 * Builds a normalized, fully qualified URL for the Python FastAPI AI Service.
 */
export function getAiUrl(endpoint: string): string {
  const base = getAiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api/v1')) {
    if (cleanEndpoint.startsWith('/api/v1/')) {
      const stripped = cleanEndpoint.replace(/^\/api\/v1/, '');
      return `${base}${stripped}`;
    }
    return `${base}${cleanEndpoint}`;
  }

  if (cleanEndpoint.startsWith('/api/v1')) {
    return `${base}${cleanEndpoint}`;
  }

  return `${base}/api/v1${cleanEndpoint}`;
}

/**
 * Centralized fetch helper for Node.js Express backend.
 * Automatically injects JWT Bearer token from localStorage and sets JSON headers.
 */
export async function fetchFromBackend<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getBackendUrl(endpoint);
  const token = typeof window !== 'undefined' ? localStorage.getItem('agri_jwt_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || errBody.message || `HTTP error ${res.status} from ${url}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`Backend API call failed: [${options.method || 'GET'}] ${url}:`, err.message);
    throw err;
  }
}

/**
 * Centralized fetch helper for Python FastAPI AI Service.
 */
export async function fetchFromAiService<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getAiUrl(endpoint);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || errBody.error || `AI Service HTTP error ${res.status} from ${url}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`AI Service API call failed: [${options.method || 'GET'}] ${url}:`, err.message);
    throw err;
  }
}

const api = {
  getBackendBaseUrl,
  getAiBaseUrl,
  getBackendUrl,
  getAiUrl,
  fetchFromBackend,
  fetchFromAiService,
};

export default api;
