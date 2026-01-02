import { API_BASE } from '../../constants';

export interface AuthOptions {
  token?: string;
  apiKey?: string;
  apiKeys?: string[];
}

function buildHeaders(auth?: AuthOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth?.apiKeys && auth.apiKeys.length > 0) {
    headers['X-API-Keys'] = auth.apiKeys.join(',');
  } else if (auth?.apiKey) {
    headers['X-API-Key'] = auth.apiKey;
  }

  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  return headers;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  auth?: AuthOptions
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...buildHeaders(auth),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function publicRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json();
}
