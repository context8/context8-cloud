import { API_BASE } from '../../constants';

export interface SolutionStats {
  totalSolutions: number;
  growthRate: number;
}

export async function fetchSolutionStats(): Promise<SolutionStats> {
  try {
    const res = await fetch(`${API_BASE}/stats/solutions`);
    if (!res.ok) {
      return { totalSolutions: 0, growthRate: 1 };
    }
    return res.json();
  } catch (error) {
    console.error('[fetchSolutionStats] Error:', error);
    return { totalSolutions: 0, growthRate: 1 };
  }
}
