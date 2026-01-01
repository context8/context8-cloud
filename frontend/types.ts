export interface ApiKey {
  id: string;
  name: string;
  createdAt?: string;
}

export type View = 'home' | 'dashboard' | 'demo';
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
  context?: string;
  rootCause?: string;
  solution?: string;
  projectPath?: string | null;
  isPublic?: boolean;
  author?: string;
  views?: number;
  upvotes?: number;
}

export interface SearchResult {
  id: string;                  // Required
  title?: string;              // Optional; fallback to "Untitled"
  errorType?: string;          // Optional; fallback to "Unknown"
  tags?: string[];             // Optional; fallback to "No tags"
  createdAt?: string;          // Optional; fallback to "Unknown date"
  preview?: string;            // Optional; fallback to "No description"
}
