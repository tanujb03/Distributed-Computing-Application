const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
let demoControlToken = '';

export function setDemoControlToken(token: string): void {
  demoControlToken = token.trim();
}

export async function fetchApi(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && demoControlToken) {
    headers.set('X-Demo-Control-Token', demoControlToken);
  }
  return fetch(`${apiBase}${path}`, { ...init, headers });
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetchApi(path, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const data = body as { message?: string; error?: string };
    throw new Error(data.message || data.error || `${response.status} ${response.statusText}`);
  }
  return body as T;
}
