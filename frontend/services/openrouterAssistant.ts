import { API_BASE } from '../constants';
import { SearchResult } from '../types';

type Auth = {
  token?: string | null;
  apiKey?: string | null;
};

type AssistantResult = {
  reply: string;
  hits: SearchResult[];
  toolTrace: string[];
};

const authHeaders = (auth: Auth) => {
  if (auth.apiKey) return { 'X-API-Key': auth.apiKey };
  if (auth.token) return { Authorization: `Bearer ${auth.token}` };
  return {};
};

export const runOpenRouterAssistant = async ({
  prompt,
  auth,
  signal,
}: {
  prompt: string;
  auth: Auth;
  signal?: AbortSignal;
}): Promise<AssistantResult> => {
  const res = await fetch(`${API_BASE}/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(auth) },
    body: JSON.stringify({ prompt, limit: 5 }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Chat failed ${res.status}`);
  }

  const data = await res.json();
  return {
    reply: data.reply || 'I could not generate a response.',
    hits: (data.hits || []) as SearchResult[],
    toolTrace: data.toolTrace || [],
  };
};
