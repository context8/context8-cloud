export interface ApiKey {
  id: string;
  name: string;
  createdAt?: string;
}

export type View = 'home' | 'dashboard';

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
  id: string;                  // 唯一必需字段
  title?: string;              // 可选，缺失时显示 "Untitled"
  errorType?: string;          // 可选，缺失时显示 "Unknown"
  tags?: string[];             // 可选，缺失时显示 "No tags"
  createdAt?: string;          // 可选，解析失败时显示 "Unknown date"
  preview?: string;            // 可选，缺失时显示 "No description"
}
