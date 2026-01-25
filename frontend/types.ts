export interface ApiKey {
  id: string;
  name: string;
  createdAt?: string;
  isPublic?: boolean;
}

export type View = 'home' | 'dashboard' | 'demo' | 'login';
export type ThemeMode = 'light' | 'dark';

export interface SolutionInput {
  title: string;
  errorMessage: string;
  errorType: string;
  context: string;
  rootCause: string;
  solution: string;
  tags: string;
}

export interface Solution {
  id: string;
  title?: string;
  errorType?: string;
  tags?: string[];
  createdAt?: string;
  errorMessage?: string;
  preview?: string;
  context?: string;
  rootCause?: string;
  solution?: string;
  projectPath?: string | null;
  isPublic?: boolean;
  apiKeyId?: string;
  apiKeyName?: string;
  author?: string;
  views?: number;
  upvotes?: number;
  downvotes?: number;
  voteScore?: number;
  myVote?: number | null;
}

export interface SearchResponse {
  total: number;
  results: SearchResult[];
}

export interface SearchResult {
  id: string;
  title?: string;
  errorType?: string;
  tags?: string[];
  createdAt?: string;
  preview?: string;
  errorMessage?: string;
  solution?: string;
  isPublic?: boolean;
  apiKeyId?: string;
  upvotes?: number;
  downvotes?: number;
  voteScore?: number;
}
