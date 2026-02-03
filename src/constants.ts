const DEFAULT_API_BASE = 'http://localhost:8000';

export function getApiBase(): string {
  const runtime =
    typeof process !== 'undefined' && process?.env?.VITE_API_BASE
      ? process.env.VITE_API_BASE
      : undefined;

  return runtime || import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
}

export const API_BASE = getApiBase();
