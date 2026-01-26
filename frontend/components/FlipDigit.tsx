import React, { useEffect, useState } from 'react';

interface FlipDigitProps {
  digit: string;
  isDark: boolean;
}

export const FlipDigit: React.FC<FlipDigitProps> = ({ digit, isDark }) => {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== displayDigit) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayDigit(digit);
        setIsFlipping(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [digit, displayDigit]);

  return (
    <div className="relative w-8 h-12 mx-0.5">
      {/* Card container */}
      <div
        className={`
          absolute inset-0 rounded-md overflow-hidden
          ${isDark
            ? 'bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700'
            : 'bg-gradient-to-b from-emerald-50 to-emerald-100 border border-emerald-200'
          }
          shadow-lg
        `}
        style={{ perspective: '200px' }}
      >
        {/* Top half */}
        <div
          className={`
            absolute inset-x-0 top-0 h-1/2 overflow-hidden
            flex items-end justify-center
            ${isDark ? 'bg-slate-800' : 'bg-emerald-50'}
          `}
        >
          <span
            className={`
              text-2xl font-bold transform translate-y-1/2
              ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
            `}
          >
            {displayDigit}
          </span>
        </div>

        {/* Bottom half */}
        <div
          className={`
            absolute inset-x-0 bottom-0 h-1/2 overflow-hidden
            flex items-start justify-center
            ${isDark ? 'bg-slate-900' : 'bg-emerald-100'}
          `}
        >
          <span
            className={`
              text-2xl font-bold transform -translate-y-1/2
              ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
            `}
          >
            {displayDigit}
          </span>
        </div>

        {/* Center divider */}
        <div
          className={`
            absolute inset-x-0 top-1/2 h-px transform -translate-y-1/2
            ${isDark ? 'bg-slate-600' : 'bg-emerald-300/50'}
          `}
        />

        {/* Flip animation overlay */}
        {isFlipping && (
          <div
            className={`
              absolute inset-x-0 top-0 h-1/2 origin-bottom
              flex items-end justify-center overflow-hidden rounded-t-md
              ${isDark ? 'bg-slate-800' : 'bg-emerald-50'}
              animate-flip-down
            `}
            style={{
              animation: 'flipDown 150ms ease-in forwards',
            }}
          >
            <span
              className={`
                text-2xl font-bold transform translate-y-1/2
                ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
              `}
            >
              {digit}
            </span>
          </div>
        )}
      </div>

      {/* Inline keyframes for flip animation */}
      <style>{`
        @keyframes flipDown {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-90deg);
          }
        }
      `}</style>
    </div>
  );
};
