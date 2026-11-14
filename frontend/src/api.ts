const TOKEN_KEY = 'assettrack_token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function apiBase(): string {
  const configured = import.meta.env.VITE_API_BASE;
  return typeof configured === 'string' ? configured.replace(/\/$/, '') : '';
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBase()}${path}`;
}

async function readError(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              const msg = (item as { msg: unknown }).msg;
              return typeof msg === 'string' ? msg : '';
            }
            return '';
          })
          .filter(Boolean);
        if (messages.length) return messages.join('; ');
      }
    }
  } catch {
    /* non-JSON error body */
  }
  return response.statusText || `Request failed (${response.status})`;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !(init.body instanceof URLSearchParams) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the AssetTrack API. Start the backend on port 8000.');
  }

  if (response.status === 401) {
    clearToken();
    onUnauthorized?.();
    throw new ApiError(401, await readError(response));
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  return response;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await request(path, init);
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(response.status, 'The API returned a non-JSON response.');
    }
  }
  return (await response.json()) as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await request(path);
  return response.blob();
}

export function withQuery(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
