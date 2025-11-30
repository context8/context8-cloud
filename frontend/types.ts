import React from 'react';

export interface Library {
  name: string;
  source: string;
  tokens: string;
  snippets: string;
  update: string;
  status: 'active' | 'inactive';
  icon?: React.ReactNode;
}

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
  title: string;
  errorType: string;
  tags: string[];
  createdAt: string;
  errorMessage: string;
  context: string;
  rootCause: string;
  solution: string;
  projectPath?: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  errorType: string;
  tags: string[];
  createdAt: string;
  preview: string;
}
