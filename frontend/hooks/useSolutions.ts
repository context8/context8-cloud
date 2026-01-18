import { useState, useCallback, useEffect, useRef } from 'react';
import { solutionsService, SolutionCreate } from '../services/api/solutions';
import { Solution, SearchResult } from '../types';
import { AuthOptions } from '../services/api/client';

export function useSolutions(auth: AuthOptions) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const solutionsRef = useRef<Solution[]>([]);
  const searchResultsRef = useRef<SearchResult[] | null>(null);

  const fetchSolutions = useCallback(async () => {
    if (!auth.token && !auth.apiKey && (!auth.apiKeys || auth.apiKeys.length === 0)) {
      setSolutions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await solutionsService.list(auth);
      setSolutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch solutions');
      setSolutions([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.token, auth.apiKey, auth.apiKeys?.join(',')]);

  const createSolution = useCallback(async (data: SolutionCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await solutionsService.create(auth, data);
      await fetchSolutions();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create solution';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [auth, fetchSolutions]);

  const deleteSolution = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const previousSolutions = solutionsRef.current;
    const previousSearchResults = searchResultsRef.current;
    setSolutions((prev) => prev.filter((item) => item.id !== id));
    setSearchResults((prev) => (prev ? prev.filter((item) => item.id !== id) : prev));
    try {
      await solutionsService.delete(auth, id);
      fetchSolutions();
    } catch (err) {
      setSolutions(previousSolutions);
      setSearchResults(previousSearchResults);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete solution';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [auth, fetchSolutions]);

  const togglePublic = useCallback(async (id: string, isPublic: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await solutionsService.updatePublic(auth, id, isPublic);
      await fetchSolutions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update solution';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [auth, fetchSolutions]);

  const getSolution = useCallback(async (id: string) => {
    return solutionsService.get(auth, id);
  }, [auth]);

  const searchSolutions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearching(true);
    setError(null);
    try {
      const response = await solutionsService.search(query, auth, controller.signal);
      setSearchResults(response.results || []);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [auth]);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  useEffect(() => {
    solutionsRef.current = solutions;
  }, [solutions]);

  useEffect(() => {
    searchResultsRef.current = searchResults;
  }, [searchResults]);

  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  return {
    solutions,
    searchResults,
    isLoading,
    isSearching,
    error,
    createSolution,
    deleteSolution,
    togglePublic,
    getSolution,
    searchSolutions,
    clearSearch,
    refetch: fetchSolutions,
  };
}
