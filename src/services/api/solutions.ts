import { request, AuthOptions, publicRequest } from './client';
import type { Solution, SolutionInput, SearchResponse } from '@/types';

export interface SolutionCreate extends SolutionInput {
  isPublic?: boolean;
}

export interface VoteResponse {
  solutionId: string;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  myVote?: number | null;
}

const normalizeSolution = (item: Solution & { is_public?: boolean; isPublic?: boolean }): Solution => ({
  ...item,
  isPublic: item.isPublic ?? item.is_public,
});

const normalizeSolutionList = (items: Solution[]): Solution[] => items.map(normalizeSolution);

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
}

export const solutionsService = {
  async list(auth: AuthOptions, options: ListOptions = {}): Promise<PaginatedResponse<Solution>> {
    const { limit = 25, offset = 0 } = options;
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const data = await request<PaginatedResponse<Solution> | Solution[]>(
      `/solutions?${params}`,
      { method: 'GET' },
      auth
    );

    // Handle both array and paginated response formats for backward compatibility
    if (Array.isArray(data)) {
      return {
        items: normalizeSolutionList(data),
        total: data.length,
        limit,
        offset,
      };
    }

    return {
      ...data,
      items: normalizeSolutionList(data.items),
    };
  },

  async get(auth: AuthOptions, id: string): Promise<Solution> {
    const data = await request<Solution>(`/solutions/${id}`, { method: 'GET' }, auth);
    return normalizeSolution(data);
  },

  async getPublic(id: string): Promise<Solution> {
    const data = await publicRequest<Solution>(`/solutions/${id}`, { method: 'GET' });
    return normalizeSolution(data);
  },

  async getEs(auth: AuthOptions, id: string): Promise<Solution> {
    const data = await request<Solution>(`/solutions/${id}/es`, { method: 'GET' }, auth);
    return normalizeSolution(data);
  },

  async getPublicEs(id: string): Promise<Solution> {
    const data = await publicRequest<Solution>(`/solutions/${id}/es`, { method: 'GET' });
    return normalizeSolution(data);
  },

  async create(auth: AuthOptions, data: SolutionCreate): Promise<Solution> {
    const tags = typeof data.tags === 'string'
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : data.tags;
    const payload = {
      ...data,
      tags,
    };
    const response = await request<Solution>(
      '/solutions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      auth
    );
    return normalizeSolution(response);
  },

  async delete(auth: AuthOptions, id: string): Promise<void> {
    return request(
      `/solutions/${id}`,
      { method: 'DELETE' },
      auth
    );
  },

  async updatePublic(auth: AuthOptions, id: string, isPublic: boolean): Promise<Solution> {
    const response = await request<Solution>(
      `/solutions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
      },
      auth
    );
    return normalizeSolution(response);
  },

  async search(query: string, auth?: AuthOptions, signal?: AbortSignal): Promise<SearchResponse> {
    const payload = {
      query,
      limit: 10,
      offset: 0,
    };
    if (auth) {
      return request<SearchResponse>(
        '/search',
        { method: 'POST', body: JSON.stringify(payload), signal },
        auth
      );
    }
    return publicRequest<SearchResponse>(
      '/search',
      { method: 'POST', body: JSON.stringify(payload), signal }
    );
  },

  async count(auth: AuthOptions): Promise<{ total: number }> {
    return request<{ total: number }>(
      '/solutions/count',
      { method: 'GET' },
      auth
    );
  },

  async vote(auth: AuthOptions, id: string, value: 1 | -1): Promise<VoteResponse> {
    return request<VoteResponse>(
      `/solutions/${id}/vote`,
      { method: 'POST', body: JSON.stringify({ value }) },
      auth
    );
  },

  async clearVote(auth: AuthOptions, id: string): Promise<VoteResponse> {
    return request<VoteResponse>(
      `/solutions/${id}/vote`,
      { method: 'DELETE' },
      auth
    );
  },
};
