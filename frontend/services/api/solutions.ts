import { request, AuthOptions, publicRequest } from './client';
import { Solution, SolutionInput, SearchResult, SearchResponse } from '../../types';

export interface SolutionCreate extends SolutionInput {
  isPublic?: boolean;
}

const normalizeSolution = (item: Solution & { is_public?: boolean; isPublic?: boolean }): Solution => ({
  ...item,
  isPublic: item.isPublic ?? item.is_public,
});

const normalizeSolutionList = (items: Solution[]): Solution[] => items.map(normalizeSolution);

export const solutionsService = {
  async list(auth: AuthOptions): Promise<Solution[]> {
    const data = await request<Solution[]>('/solutions', { method: 'GET' }, auth);
    return normalizeSolutionList(data);
  },

  async get(auth: AuthOptions, id: string): Promise<Solution> {
    const data = await request<Solution>(`/solutions/${id}`, { method: 'GET' }, auth);
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
    const response = await request(
      `/solutions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
      },
      auth
    );
    return normalizeSolution(response);
  },

  async search(query: string, auth?: AuthOptions): Promise<SearchResponse> {
    const payload = {
      query,
      limit: 10,
      offset: 0,
    };
    if (auth) {
      return request<SearchResponse>(
        '/search',
        { method: 'POST', body: JSON.stringify(payload) },
        auth
      );
    }
    return publicRequest<SearchResponse>(
      '/search',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  },

  async count(auth: AuthOptions): Promise<{ total: number }> {
    return request<{ total: number }>(
      '/solutions/count',
      { method: 'GET' },
      auth
    );
  },
};
