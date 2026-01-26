import React, { useEffect, useState, useRef, useCallback } from 'react';
import SlotCounter from 'react-slot-counter';
import { fetchSolutionStats } from '../services/api/stats';
import { Activity, Users } from 'lucide-react';

interface FlipCounterProps {
  isDark: boolean;
}

export const FlipCounter: React.FC<FlipCounterProps> = ({ isDark }) => {
  const [targetValue, setTargetValue] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const liveUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef<any>(null);

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

  // Trigger dramatic animation on first load
  useEffect(() => {
    if (!isLoading && targetValue > 0 && !hasAnimated) {
      setHasAnimated(true);
      // Small delay to ensure component is mounted
      setTimeout(() => {
        counterRef.current?.startAnimation({
          duration: 2.5,
          dummyCharacterCount: 25,
        });
      }, 100);
    }
  }, [isLoading, targetValue, hasAnimated]);

  // Live updates every 5 seconds (less frequent to avoid animation interruption)
  useEffect(() => {
    if (isLoading) return;

    liveUpdateRef.current = setInterval(() => {
      loadStats();
    }, 5000);

    return () => {
      if (liveUpdateRef.current) {
        clearInterval(liveUpdateRef.current);
      }
    };
  }, [isLoading, loadStats]);

  // Format number with commas
  const formattedValue = targetValue.toLocaleString('en-US');

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
        <SlotCounter
          ref={counterRef}
          value={formattedValue}
          startValue="000,000,000"
          startValueOnce
          duration={2}
          dummyCharacterCount={20}
          speed={1.8}
          animateUnchanged
          charClassName={`
            text-3xl md:text-4xl font-bold
            ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
          `}
          separatorClassName={`
            text-3xl md:text-4xl font-bold mx-0.5
            ${isDark ? 'text-slate-600' : 'text-emerald-300'}
          `}
          containerClassName="flex items-center"
          sequentialAnimationMode={false}
          useMonospaceWidth
        />
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
