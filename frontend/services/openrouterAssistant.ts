import { API_BASE, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL, OPENROUTER_REFERRER } from '../constants';
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

type OpenRouterToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: OpenRouterToolCall[];
};

const SYSTEM_PROMPT = `You are the Context8 Demo assistant.\n\nBehavior:\n- When a user reports a bug, error, crash, or exception, you MUST use the searchSolutions tool before answering.\n- Use the tool results to ground your response. If no results, say so and ask a targeted follow-up.\n- Keep answers concise, actionable, and in a checklist format when possible.\n- Never fabricate solutions that are not in the tool results.\n`;

const TOOL_DEF = {
  type: 'function',
  function: {
    name: 'searchSolutions',
    description: 'Search Context8 solutions database for relevant bug fixes.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'User bug description or error message.' },
        limit: { type: 'integer', description: 'Max number of results', default: 5 },
      },
      required: ['query'],
    },
  },
} as const;

const authHeaders = (auth: Auth) => {
  if (auth.apiKey) return { 'X-API-Key': auth.apiKey };
  if (auth.token) return { Authorization: `Bearer ${auth.token}` };
  return {};
};

const needsSearch = (prompt: string) =>
  /\b(error|bug|crash|exception|traceback|stack trace|failed|failure|issue)\b/i.test(prompt);

const safeJsonParse = <T,>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getReferrer = () => {
  if (OPENROUTER_REFERRER) return OPENROUTER_REFERRER;
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'https://context8.local';
};

const callOpenRouter = async (
  messages: OpenRouterMessage[],
  toolChoice: 'auto' | 'none' | { type: 'function'; function: { name: string } },
  signal?: AbortSignal
) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing VITE_OPENROUTER_API_KEY');
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': getReferrer(),
      'X-Title': 'Context8 Demo',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      tools: [TOOL_DEF],
      tool_choice: toolChoice,
      temperature: 0.2,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `OpenRouter error ${res.status}`);
  }

  const data = await res.json();
  const message = data?.choices?.[0]?.message || {};
  return {
    content: message.content as string | undefined,
    toolCalls: (message.tool_calls || []) as OpenRouterToolCall[],
  };
};

const searchSolutions = async (query: string, auth: Auth, limit = 5) => {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(auth) },
    body: JSON.stringify({ query, limit, offset: 0 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Search failed ${res.status}`);
  }

  const data = await res.json();
  return {
    total: data.total || 0,
    results: (data.results || []) as SearchResult[],
  };
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
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  const toolTrace: string[] = [];
  const toolChoice = needsSearch(prompt)
    ? ({ type: 'function', function: { name: 'searchSolutions' } } as const)
    : 'auto';

  const firstPass = await callOpenRouter(messages, toolChoice, signal);

  let hits: SearchResult[] = [];
  if (firstPass.toolCalls.length > 0) {
    const toolMessages: OpenRouterMessage[] = [];

    for (const call of firstPass.toolCalls) {
      if (call.function.name !== 'searchSolutions') continue;
      const args = safeJsonParse<{ query?: string; limit?: number }>(call.function.arguments, {});
      const query = args.query || prompt;
      const limit = typeof args.limit === 'number' ? args.limit : 5;

      try {
        const result = await searchSolutions(query, auth, limit);
        hits = result.results;
        toolTrace.push(`searchSolutions("${query}") => ${result.total} results`);
        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      } catch (error: any) {
        toolTrace.push(`searchSolutions("${query}") => error`);
        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ error: error?.message || 'search failed' }),
        });
      }
    }

    messages.push({ role: 'assistant', content: firstPass.content || '', tool_calls: firstPass.toolCalls });
    messages.push(...toolMessages);

    const secondPass = await callOpenRouter(messages, 'none', signal);
    return {
      reply: secondPass.content || 'I could not generate a response.',
      hits,
      toolTrace,
    };
  }

  if (needsSearch(prompt)) {
    try {
      const result = await searchSolutions(prompt, auth, 5);
      hits = result.results;
      toolTrace.push(`searchSolutions("${prompt}") => ${result.total} results`);
    } catch (error: any) {
      toolTrace.push(`searchSolutions("${prompt}") => error`);
    }
  }

  return {
    reply: firstPass.content || 'I could not generate a response.',
    hits,
    toolTrace,
  };
};
