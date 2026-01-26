import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FlipDigit } from './FlipDigit';
import { fetchSolutionStats } from '../services/api/stats';
import { Activity, Users } from 'lucide-react';

interface FlipCounterProps {
  isDark: boolean;
}

export const FlipCounter: React.FC<FlipCounterProps> = ({ isDark }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const catchUpRef = useRef<NodeJS.Timeout | null>(null);
  const liveUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch stats from API
  const loadStats = useCallback(async () => {
    try {
      const stats = await fetchSolutionStats();
      setTargetValue(stats.totalSolutions);
      setVelocity(stats.growthRate);
      setIsLoading(false);
    } catch (error) {
      console.error('[FlipCounter] Failed to fetch stats:', error);
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Catch-up animation: fast start, slow down as approaching target
  useEffect(() => {
    if (displayValue >= targetValue) {
      if (catchUpRef.current) {
        clearTimeout(catchUpRef.current);
        catchUpRef.current = null;
      }
      return;
    }

    const diff = targetValue - displayValue;
    // Start fast, slow down exponentially
    const step = Math.max(1, Math.floor(diff / 10));
    const delay = diff > 100 ? 30 : diff > 50 ? 50 : diff > 10 ? 80 : 120;

    catchUpRef.current = setTimeout(() => {
      setDisplayValue(prev => Math.min(prev + step, targetValue));
    }, delay);

    return () => {
      if (catchUpRef.current) {
        clearTimeout(catchUpRef.current);
      }
    };
  }, [displayValue, targetValue]);

  // Live updates every 2 seconds
  useEffect(() => {
    if (isLoading) return;

    liveUpdateRef.current = setInterval(() => {
      loadStats();
    }, 2000);

    return () => {
      if (liveUpdateRef.current) {
        clearInterval(liveUpdateRef.current);
      }
    };
  }, [isLoading, loadStats]);

  // Format number with commas and pad to 9 digits
  const formatNumber = (num: number): string[] => {
    const padded = num.toString().padStart(9, '0');
    const parts: string[] = [];
    for (let i = 0; i < padded.length; i++) {
      parts.push(padded[i]);
      // Add comma positions (after 3rd and 6th digits from right)
      if ((padded.length - i - 1) % 3 === 0 && i < padded.length - 1) {
        parts.push(',');
      }
    }
    return parts;
  };

  const digits = formatNumber(displayValue);

  return (
    <div
      className={`
        w-full rounded-2xl p-6
        ${isDark
          ? 'bg-slate-900/60 border border-slate-800'
          : 'bg-emerald-50/60 border border-emerald-100'
        }
      `}
    >
      {/* Counter display */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center">
          {digits.map((char, idx) => (
            char === ',' ? (
              <span
                key={`sep-${idx}`}
                className={`
                  text-2xl font-bold mx-1
                  ${isDark ? 'text-slate-600' : 'text-emerald-300'}
                `}
              >
                ,
              </span>
            ) : (
              <FlipDigit
                key={`digit-${idx}`}
                digit={char}
                isDark={isDark}
              />
            )
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="text-center mb-4">
        <span
          className={`
            text-sm font-medium tracking-wider uppercase
            ${isDark ? 'text-slate-400' : 'text-emerald-700'}
          `}
        >
          Public Solutions Shared
        </span>
      </div>

      {/* Stats row */}
      <div
        className={`
          flex justify-center items-center gap-8 pt-4 border-t
          ${isDark ? 'border-slate-800' : 'border-emerald-200/50'}
        `}
      >
        {/* Daily Growth */}
        <div className="flex items-center gap-2">
          <Activity
            size={16}
            className={isDark ? 'text-emerald-400' : 'text-emerald-600'}
          />
          <div className="flex flex-col">
            <span
              className={`
                text-xs uppercase tracking-wide
                ${isDark ? 'text-slate-500' : 'text-emerald-600/70'}
              `}
            >
              Daily Growth
            </span>
            <span
              className={`
                text-sm font-semibold
                ${isDark ? 'text-emerald-300' : 'text-emerald-700'}
              `}
            >
              +{velocity}%
            </span>
          </div>
        </div>

        {/* Community status */}
        <div className="flex items-center gap-2">
          <Users
            size={16}
            className={isDark ? 'text-emerald-400' : 'text-emerald-600'}
          />
          <div className="flex flex-col">
            <span
              className={`
                text-xs uppercase tracking-wide
                ${isDark ? 'text-slate-500' : 'text-emerald-600/70'}
              `}
            >
              Community Growth
            </span>
            <span
              className={`
                text-sm font-semibold
                ${isDark ? 'text-emerald-300' : 'text-emerald-700'}
              `}
            >
              {isLoading ? 'Loading...' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
