"use client";

import { useEffect, useState } from "react";

interface SpendingHeaderProps {
  weeklyTotal: number;
  limit: number;
  isLimitReached: boolean;
}

export function SpendingHeader({ weeklyTotal, limit, isLimitReached }: SpendingHeaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const percentage = Math.min((weeklyTotal / limit) * 100, 100);
  const remaining = Math.max(0, limit - weeklyTotal);

  let barColor = "bg-accent";
  let barGlow = "shadow-[0_0_12px_rgba(34,197,94,0.5)]";
  if (percentage >= 80 && percentage < 100) {
    barColor = "bg-yellow-400";
    barGlow = "shadow-[0_0_12px_rgba(250,204,21,0.5)]";
  }
  if (isLimitReached) {
    barColor = "bg-danger";
    barGlow = "shadow-[0_0_12px_rgba(239,68,68,0.6)]";
  }

  return (
    <div
      className={`relative rounded-xl border p-5 mb-6 overflow-hidden ${
        isLimitReached
          ? "border-danger/40 bg-danger/5"
          : "border-border bg-surface"
      }`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 scanlines" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block" />
            <span className="font-mono-custom text-xs text-muted uppercase tracking-widest">
              Weekly Budget
            </span>
          </div>
          <p className="font-mono-custom text-2xl font-semibold text-text">
            <span className={isLimitReached ? "text-danger" : "text-text"}>
              ${weeklyTotal.toFixed(2)}
            </span>
            <span className="text-muted font-normal"> / ${limit.toFixed(0)}</span>
          </p>
        </div>

        <div className="text-right">
          {isLimitReached ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-danger/10 border border-danger/30">
              <svg className="w-4 h-4 text-danger" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-mono-custom text-xs text-danger font-medium">LIMIT REACHED</span>
            </div>
          ) : (
            <div>
              <p className="font-mono-custom text-xs text-muted mb-0.5">remaining</p>
              <p className="font-mono-custom text-lg font-medium text-accent">
                ${remaining.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} ${
            mounted ? barGlow : ""
          }`}
          style={{ width: mounted ? `${percentage}%` : "0%" }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1.5">
        {[0, 25, 50, 75, 100].map((tick) => (
          <span
            key={tick}
            className={`font-mono-custom text-[10px] ${
              percentage >= tick ? "text-muted" : "text-border"
            }`}
          >
            {tick === 0 ? "$0" : tick === 100 ? `$${limit}` : `$${(limit * tick) / 100}`}
          </span>
        ))}
      </div>

      {isLimitReached && (
        <div className="mt-3 p-3 rounded-lg bg-danger/10 border border-danger/20 animate-fade-up">
          <p className="font-mono-custom text-xs text-danger/80 leading-relaxed">
            ⚡ Weekly limit of ${limit} has been reached. All payments are blocked until{" "}
            <span className="text-danger font-medium">next Monday</span>. The limit will reset
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
