import { useState, useCallback, useEffect } from 'react';
import { solutionsService, SolutionCreate } from '../services/api/solutions';
import { Solution } from '../types';
import { AuthOptions } from '../services/api/client';

export function useSolutions(auth: AuthOptions) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await solutionsService.delete(auth, id);
      await fetchSolutions();
    } catch (err) {
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

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  return {
    solutions,
    isLoading,
    error,
    createSolution,
    deleteSolution,
    togglePublic,
    getSolution,
    refetch: fetchSolutions,
  };
}
