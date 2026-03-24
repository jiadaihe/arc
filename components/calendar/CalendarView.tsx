"use client";

import { useEffect, useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isToday,
  isWithinInterval,
  differenceInDays,
} from "date-fns";
import type { Item, GoalWithHealth, ChallengeCheckin } from "@/lib/types";
import { ASSETS } from "@/lib/assets";
import { matchAssetByKeyword } from "@/lib/asset-matcher";
import AssetThumbnail from "./AssetThumbnail";
import CalendarCell from "./CalendarCell";

interface CalendarViewProps {
  onNavigateToDay: (date: Date) => void;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function CalendarView({ onNavigateToDay }: CalendarViewProps) {
  const [month, setMonth] = useState(() => new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [goals, setGoals] = useState<GoalWithHealth[]>([]);
  const [checkins, setCheckins] = useState<Record<string, ChallengeCheckin[]>>({});

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const totalDays = differenceInDays(calendarEnd, calendarStart) + 1;
  const totalWeeks = totalDays / 7;

  const startStr = format(calendarStart, "yyyy-MM-dd");
  const endStr = format(calendarEnd, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    const [itemsRes, goalsRes] = await Promise.all([
      fetch(`/api/items/range?start=${startStr}&end=${endStr}`),
      fetch("/api/goals"),
    ]);
    const itemsData = await itemsRes.json();
    const goalsData = await goalsRes.json();
    setItems(itemsData);
    setGoals(goalsData);

    const habitGoals = goalsData.filter((g: GoalWithHealth) => g.habitFrequency);
    const checkinMap: Record<string, ChallengeCheckin[]> = {};
    await Promise.all(
      habitGoals.map(async (g: GoalWithHealth) => {
        const res = await fetch(`/api/checkins?goalId=${g.id}`);
        checkinMap[g.id] = await res.json();
      })
    );
    setCheckins(checkinMap);
  }, [startStr, endStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Items grouped by date
  const itemsByDate: Record<string, Item[]> = {};
  for (const item of items) {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
    itemsByDate[item.date].push(item);
  }

  // Goal color map + auto-matched asset per goal
  const goalColors: Record<string, string> = {};
  const goalAssetId: Record<string, string | null> = {};
  for (const g of goals) {
    goalColors[g.id] = g.color;
    const match = matchAssetByKeyword(g.title, ASSETS);
    goalAssetId[g.id] = match ? match.id : null;
  }

  // Pre-compute active dates per goal
  const goalActiveDates: Record<string, Set<string>> = {};
  for (const goal of goals) {
    const dates = new Set<string>();
    for (const item of items) {
      if (item.goalId === goal.id) dates.add(item.date);
    }
    for (const checkin of (checkins[goal.id] || [])) {
      dates.add(checkin.date);
    }
    goalActiveDates[goal.id] = dates;
  }

  // Build calendar days
  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(calendarStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      dateStr,
      isToday: isToday(date),
      isCurrentMonth: isSameMonth(date, month),
    };
  });

  // Split days into weeks
  const weeks: typeof days[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const handleNavigate = (dateStr: string) => {
    onNavigateToDay(new Date(dateStr + "T00:00:00"));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="p-2 rounded-lg hover:bg-black/[.04] text-[var(--muted)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5L7 10L12 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold tracking-tight">
          {format(month, "MMMM yyyy")}
        </h1>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-2 rounded-lg hover:bg-black/[.04] text-[var(--muted)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 5L13 10L8 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center text-[11px] font-medium text-[var(--muted)] py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar: week rows with integrated swim lanes */}
      <div className="space-y-0">
        {weeks.map((week, wi) => (
          <div key={wi}>
            {/* Swim lane rows for this week */}
            {goals.map((goal) => {
              const goalStart = new Date(goal.startDate + "T00:00:00");
              const goalEnd = new Date(goal.targetDate + "T00:00:00");
              const activeDates = goalActiveDates[goal.id] || new Set();

              const weekStart = week[0].date;
              const weekEnd = week[6].date;
              const overlaps = goalStart <= weekEnd && goalEnd >= weekStart;
              if (!overlaps) return null;

              // Find first and last in-range column indices (0-6)
              let firstCol = -1;
              let lastCol = -1;
              for (let c = 0; c < 7; c++) {
                const inRange = isWithinInterval(week[c].date, { start: goalStart, end: goalEnd });
                if (inRange) {
                  if (firstCol === -1) firstCol = c;
                  lastCol = c;
                }
              }
              if (firstCol === -1) return null;

              // Track spans full width: each col is 1/7 = ~14.28%
              const leftPct = (firstCol / 7) * 100;
              const widthPct = ((lastCol - firstCol + 1) / 7) * 100;

              // Find the latest activity day in this week for asset placement
              let latestActivityCol = -1;
              for (let c = lastCol; c >= firstCol; c--) {
                if (activeDates.has(week[c].dateStr)) {
                  latestActivityCol = c;
                  break;
                }
              }

              const assetId = goalAssetId[goal.id];

              return (
                <div key={goal.id} className="relative h-4">
                  {assetId ? (
                    // Repeat thumbnail across every in-range day
                    <>
                      {week.map((day, c) => {
                        const inRange = c >= firstCol && c <= lastCol;
                        if (!inRange) return null;
                        const hasActivity = activeDates.has(day.dateStr);
                        return (
                          <div
                            key={day.dateStr}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                            style={{
                              left: `${((c + 0.5) / 7) * 100}%`,
                              opacity: hasActivity ? 1 : 0.15,
                            }}
                          >
                            <AssetThumbnail assetId={assetId} size={14} />
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    // No asset match — show faded color dots
                    <>
                      {week.map((day, c) => {
                        const inRange = c >= firstCol && c <= lastCol;
                        if (!inRange) return null;
                        const hasActivity = activeDates.has(day.dateStr);
                        return (
                          <div
                            key={day.dateStr}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                            style={{
                              left: `${((c + 0.5) / 7) * 100}%`,
                              backgroundColor: goal.color,
                              opacity: hasActivity ? 0.8 : 0.15,
                            }}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}

            {/* Day cells for this week */}
            <div className="grid grid-cols-7 gap-px">
              {week.map((day) => (
                <div key={day.dateStr} className="relative">
                  <span
                    className={`absolute top-0.5 right-1 text-[10px] tabular-nums z-10 ${
                      day.isCurrentMonth
                        ? "text-[var(--muted)]"
                        : "text-[var(--border)]"
                    } ${day.isToday ? "font-bold text-[var(--foreground)]" : ""}`}
                  >
                    {format(day.date, "d")}
                  </span>
                  <CalendarCell
                    date={day.dateStr}
                    items={itemsByDate[day.dateStr] || []}
                    isToday={day.isToday}
                    isCurrentMonth={day.isCurrentMonth}
                    goalColors={goalColors}
                    onNavigate={handleNavigate}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
