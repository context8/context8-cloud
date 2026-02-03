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
  const headers: Record<string, string> = {};
  if (auth.apiKey) {
    headers['X-API-Key'] = auth.apiKey;
  } else if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  return headers;
};

export const runOpenRouterAssistant = async ({
  prompt,
  auth,
  limit,
  signal,
}: {
  prompt: string;
  auth: Auth;
  limit?: number;
  signal?: AbortSignal;
}): Promise<AssistantResult> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(auth),
  };
  const res = await fetch(`${API_BASE}/llm/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, limit: limit ?? 5 }),
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

export const generateFollowUpSuggestions = async ({
  userQuestion,
  aiResponse,
  auth,
}: {
  userQuestion: string;
  aiResponse: string;
  auth: Auth;
}): Promise<string[]> => {
  try {
    const prompt = `Based on this conversation:
User: ${userQuestion}
Assistant: ${aiResponse}

Generate exactly 2 short follow-up questions (max 4 words each) that the user might ask next. Return only the questions, one per line, no numbering or explanation.`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders(auth),
    };
    const res = await fetch(`${API_BASE}/llm/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, limit: 0 }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate suggestions');
    }

    const data = await res.json();
    const suggestions = data.reply
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.length < 50)
      .slice(0, 2);

    return suggestions.length === 2 ? suggestions : [];
  } catch (error) {
    console.error('Failed to generate follow-up suggestions:', error);
    return [];
  }
};
