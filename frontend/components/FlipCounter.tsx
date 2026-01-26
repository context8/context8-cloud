import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchSolutionStats } from '../services/api/stats';
import { Activity, Users } from 'lucide-react';

interface FlipCounterProps {
  isDark: boolean;
}

interface RollingDigitProps {
  digit: number;
  isDark: boolean;
}

// Height of each digit cell in pixels
const DIGIT_HEIGHT = 48;

// Single rolling digit - shows vertical scroll through 0-9
const RollingDigit: React.FC<RollingDigitProps> = ({ digit, isDark }) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className={`
        relative overflow-hidden
        ${isDark ? 'bg-slate-800/40' : 'bg-emerald-100/40'}
        rounded-md
      `}
      style={{
        height: `${DIGIT_HEIGHT}px`,
        width: '28px',
      }}
    >
      <div
        className="flex flex-col transition-transform duration-75 ease-out"
        style={{
          transform: `translateY(-${digit * DIGIT_HEIGHT}px)`,
        }}
      >
        {digits.map((d) => (
          <div
            key={d}
            className={`
              flex items-center justify-center
              font-semibold tabular-nums
              ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
            `}
            style={{
              height: `${DIGIT_HEIGHT}px`,
              fontSize: '32px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// Separator (comma) - smaller and more subtle
const Separator: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <span
    className={`
      font-medium
      ${isDark ? 'text-slate-600' : 'text-emerald-300/70'}
    `}
    style={{
      fontSize: '20px',
      lineHeight: `${DIGIT_HEIGHT}px`,
      margin: '0 2px',
    }}
  >
    ,
  </span>
);

export const FlipCounter: React.FC<FlipCounterProps> = ({ isDark }) => {
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const liveUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Target duration: 7-10 seconds for the entire animation
  const TARGET_DURATION_MS = 8000;

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

  // Animate counting with time-based deceleration
  useEffect(() => {
    if (targetValue === null) return;
    if (displayValue >= targetValue) {
      startTimeRef.current = null;
      return;
    }

    // Initialize start time on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = targetValue - displayValue;

    // Calculate time-based progress (0 to 1)
    const timeProgress = Math.min(elapsed / TARGET_DURATION_MS, 1);

    // Quadratic ease-out: fast start, slow end
    const targetProgress = 1 - Math.pow(1 - timeProgress, 2);
    const targetDisplayValue = Math.floor(targetValue * targetProgress);

    // Calculate step to reach target display value
    let step = targetDisplayValue - displayValue;

    if (step < 1 && displayValue < targetValue) {
      step = 1;
    }

    // Calculate interval based on time progress
    let interval: number;
    if (timeProgress < 0.7) {
      interval = 1 + timeProgress * 5;
    } else if (timeProgress < 0.9) {
      interval = 5 + (timeProgress - 0.7) * 125;
    } else {
      interval = 30 + (timeProgress - 0.9) * 700;
    }

    // Dramatic slowdown for final counts
    if (remaining <= 10) {
      interval = Math.max(interval, 80);
      step = 1;
    } else if (remaining <= 50) {
      interval = Math.max(interval, 40);
      step = Math.min(step, 3);
    } else if (remaining <= 200) {
      interval = Math.max(interval, 20);
      step = Math.min(step, 10);
    }

    const timer = setTimeout(() => {
      setDisplayValue(prev => Math.min(prev + Math.max(1, step), targetValue));
    }, interval);

    return () => clearTimeout(timer);
  }, [displayValue, targetValue]);

  // Live updates every 15 seconds
  useEffect(() => {
    if (isLoading) return;

    liveUpdateRef.current = setInterval(() => {
      loadStats();
    }, 15000);

    return () => {
      if (liveUpdateRef.current) {
        clearInterval(liveUpdateRef.current);
      }
    };
  }, [isLoading, loadStats]);

  // Convert number to array of 9 digits
  const getDigits = (num: number): number[] => {
    const padded = num.toString().padStart(9, '0');
    return padded.split('').map(d => parseInt(d, 10));
  };

  const digits = getDigits(displayValue);

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
        <div className="flex items-center gap-1">
          {/* First group: XXX */}
          <RollingDigit digit={digits[0]} isDark={isDark} />
          <RollingDigit digit={digits[1]} isDark={isDark} />
          <RollingDigit digit={digits[2]} isDark={isDark} />

          <Separator isDark={isDark} />

          {/* Second group: XXX */}
          <RollingDigit digit={digits[3]} isDark={isDark} />
          <RollingDigit digit={digits[4]} isDark={isDark} />
          <RollingDigit digit={digits[5]} isDark={isDark} />

          <Separator isDark={isDark} />

          {/* Third group: XXX */}
          <RollingDigit digit={digits[6]} isDark={isDark} />
          <RollingDigit digit={digits[7]} isDark={isDark} />
          <RollingDigit digit={digits[8]} isDark={isDark} />
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
