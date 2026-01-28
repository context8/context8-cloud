import { request } from './client';
import { ApiKey } from '../../types';
import { ApiKeyStats } from '../../components/Dashboard/ApiKeyCard';

const normalizeApiKey = (item: ApiKey & { is_public?: boolean; isPublic?: boolean }): ApiKey => ({
  ...item,
  isPublic: item.isPublic ?? item.is_public,
});

export interface ApiKeyStatsResponse {
  [keyId: string]: {
    publicCount: number;
    privateCount: number;
  };
}

export const apiKeysService = {
  async list(token: string): Promise<ApiKey[]> {
    const data = await request<ApiKey[]>('/apikeys', { method: 'GET' }, { token });
    return data.map(normalizeApiKey);
  },

  async create(token: string, name: string, isPublic: boolean = false): Promise<{ id: string; apiKey: string; isPublic: boolean }> {
    return request(
      `/apikeys?name=${encodeURIComponent(name)}&is_public=${isPublic}`,
      { method: 'POST' },
      { token }
    );
  },

  async delete(token: string, keyId: string): Promise<void> {
    return request(
      `/apikeys/${keyId}`,
      { method: 'DELETE' },
      { token }
    );
  },

  async updatePublic(token: string, keyId: string, isPublic: boolean): Promise<ApiKey> {
    const data = await request<ApiKey>(
      `/apikeys/${keyId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
      },
      { token }
    );
    return normalizeApiKey(data);
  },

  async getStats(token: string): Promise<Record<string, ApiKeyStats>> {
    const data = await request<ApiKeyStatsResponse>(
      '/apikeys/stats',
      { method: 'GET' },
      { token }
    );
    return data;
  },
};
