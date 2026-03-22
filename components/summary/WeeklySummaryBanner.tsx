"use client";

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";

interface GoalActivity {
  title: string;
  color: string;
  itemCount: number;
  checkinCount: number;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  goalActivity: GoalActivity[];
  neglectedGoals: GoalActivity[];
}

interface WeeklySummaryBannerProps {
  date: string;
}

export interface WeeklySummaryHandle {
  refresh: () => void;
}

const WeeklySummaryBanner = forwardRef<WeeklySummaryHandle, WeeklySummaryBannerProps>(function WeeklySummaryBanner({ date }, ref) {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSummary = useCallback(async () => {
    const res = await fetch(`/api/summary/weekly?date=${date}`);
    setSummary(await res.json());
  }, [date]);

  useImperativeHandle(ref, () => ({ refresh: fetchSummary }), [fetchSummary]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (!summary) return null;

  const totalActivity = summary.goalActivity.reduce((s, g) => s + g.itemCount + g.checkinCount, 0);
  const hasActivity = totalActivity > 0;

  return (
    <div className="border-b border-[var(--border)]">
      {/* Collapsed: stacked color bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/[.02] transition-colors"
      >
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--border)] flex">
          {hasActivity && summary.goalActivity.map((g) => {
            const weight = (g.itemCount + g.checkinCount) / totalActivity;
            return (
              <div
                key={g.title}
                style={{ width: `${weight * 100}%`, backgroundColor: g.color }}
                className="h-full"
                title={g.title}
              />
            );
          })}
        </div>

        <span className="text-[11px] text-[var(--muted)] shrink-0">
          This week
        </span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          {summary.goalActivity.length > 0 && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1.5">This week you spent time on:</p>
              <div className="flex flex-wrap gap-2">
                {summary.goalActivity.map((g) => {
                  const label = g.itemCount && g.checkinCount
                    ? `${g.itemCount} tasks, ${g.checkinCount} check-ins`
                    : g.checkinCount
                    ? `${g.checkinCount} check-in${g.checkinCount > 1 ? "s" : ""}`
                    : `${g.itemCount} task${g.itemCount > 1 ? "s" : ""}`;
                  return (
                    <span
                      key={g.title}
                      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: g.color + "18", color: g.color }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: g.color }}
                      />
                      {g.title} ({label})
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {summary.neglectedGoals.length > 0 && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1.5">
                Didn&apos;t get to:
              </p>
              <div className="flex flex-wrap gap-2">
                {summary.neglectedGoals.map((g) => (
                  <span
                    key={g.title}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] px-2 py-1 rounded-full bg-black/[.03]"
                  >
                    <span
                      className="w-2 h-2 rounded-full opacity-40"
                      style={{ backgroundColor: g.color }}
                    />
                    {g.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default WeeklySummaryBanner;
