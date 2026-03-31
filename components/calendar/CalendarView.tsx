"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  differenceInDays,
} from "date-fns";
import type { Item, GoalWithHealth } from "@/lib/types";
import { ASSETS, getAssetFilenameById } from "@/lib/assets";
import { matchAssetByKeyword } from "@/lib/asset-matcher";
import CalendarCell from "./CalendarCell";

interface CalendarViewProps {
  onNavigateToDay: (date: Date) => void;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const MOVING_THUMBNAIL_SIZE = 18;
const ANIMATION_SPEED = 0.6;
const TRACK_Y_SPACING = 6;

type RowSpan = { startX: number; endX: number; y: number; width: number };

function getPointAlongRowSpans(
  rowSpans: RowSpan[],
  progress: number,
  yOffset: number
) {
  if (rowSpans.length === 0) return { x: 0, y: 0 };

  const clamped = Math.max(0, Math.min(1, progress));
  const totalWidth = rowSpans.reduce((sum, span) => sum + span.width, 0);
  let remaining = clamped * totalWidth;

  for (let i = 0; i < rowSpans.length; i++) {
    const span = rowSpans[i];
    if (remaining <= span.width || i === rowSpans.length - 1) {
      const t = span.width > 0 ? Math.max(0, Math.min(1, remaining / span.width)) : 0;
      return {
        x: span.startX + (span.endX - span.startX) * t,
        y: span.y + yOffset,
      };
    }
    remaining -= span.width;
  }

  const last = rowSpans[rowSpans.length - 1];
  return { x: last.endX, y: last.y + yOffset };
}

export default function CalendarView({ onNavigateToDay }: CalendarViewProps) {
  const [month, setMonth] = useState(() => new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [goals, setGoals] = useState<GoalWithHealth[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const totalDays = differenceInDays(calendarEnd, calendarStart) + 1;
  const totalWeeks = totalDays / 7;

  const loadMonth = useCallback(async (target: Date) => {
    const ms = startOfMonth(target);
    const me = endOfMonth(target);
    const cs = startOfWeek(ms, { weekStartsOn: 1 });
    const ce = endOfWeek(me, { weekStartsOn: 1 });
    const startStr = format(cs, "yyyy-MM-dd");
    const endStr = format(ce, "yyyy-MM-dd");

    const [itemsRes, goalsRes] = await Promise.all([
      fetch(`/api/items/range?start=${startStr}&end=${endStr}`),
      fetch("/api/goals"),
    ]);
    const [itemsData, goalsData] = await Promise.all([itemsRes.json(), goalsRes.json()]);
    setMonth(target);
    setItems(itemsData);
    setGoals(goalsData);
  }, []);

  useEffect(() => {
    loadMonth(month);
  }, []);

  // Items grouped by date
  const itemsByDate: Record<string, Item[]> = {};
  for (const item of items) {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
    itemsByDate[item.date].push(item);
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
  console.log("weeks:", weeks);

  const handleNavigate = (dateStr: string) => {
    onNavigateToDay(new Date(dateStr + "T00:00:00"));
  };

  const animatedGoals = useMemo(() => {
    return goals
      .map((goal) => {
        const resolvedAssetId = goal.assetId ?? matchAssetByKeyword(goal.title, ASSETS)?.id ?? null;
        if (!resolvedAssetId) return null;
        const filename = getAssetFilenameById(resolvedAssetId);
        if (!filename) return null;

        const dateRows = days
          .map((day, dayIndex) => ({ dateStr: day.dateStr, row: Math.floor(dayIndex / 7) }))
          .filter((day) => day.dateStr >= goal.startDate && day.dateStr <= goal.targetDate);

        if (dateRows.length === 0) return null;

        return {
          id: goal.id,
          color: goal.color,
          src: `/assets/${filename}`,
          dateRows,
          durationMs: (3000 + Math.min(5000, dateRows.length * 120)) / ANIMATION_SPEED,
        };
      })
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
  }, [goals, days]);

  useEffect(() => {
    const container = gridRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || animatedGoals.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;
    let startedAtMs = 0;
    let tracks: {
      id: string;
      color: string;
      image: HTMLImageElement;
      rowSpans: RowSpan[];
      durationMs: number;
      phaseMs: number;
      yOffset: number;
    }[] = [];

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updateTrackPoints = () => {
      const containerRect = container.getBoundingClientRect();
      tracks = tracks.map((track) => {
        const goal = animatedGoals.find((g) => g.id === track.id);
        if (!goal) return { ...track, rowSpans: [] };

        const rowSpans: RowSpan[] = [];
        let currentSpan: RowSpan | null = null;
        let lastRow: number | null = null;

        for (const dateCell of goal.dateRows) {
          const el = container.querySelector<HTMLElement>(`[data-date="${dateCell.dateStr}"]`);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const point = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
          };

          if (lastRow !== null && dateCell.row !== lastRow && currentSpan) {
            rowSpans.push(currentSpan);
            currentSpan = null;
          }

          if (!currentSpan) {
            currentSpan = {
              startX: point.x,
              endX: point.x,
              y: point.y,
              width: 1,
            };
          } else {
            currentSpan.endX = point.x;
            currentSpan.width = Math.max(1, Math.abs(currentSpan.endX - currentSpan.startX));
          }

          lastRow = dateCell.row;
        }

        if (currentSpan) {
          rowSpans.push(currentSpan);
        }

        return { ...track, rowSpans };
      });
    };

    const draw = (ts: number) => {
      if (cancelled) return;
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (const track of tracks) {
        if (track.rowSpans.length === 0) continue;

        if (!startedAtMs) startedAtMs = ts;
        const elapsed = ts - startedAtMs;
        const baseProgress = ((elapsed + track.phaseMs) % track.durationMs) / track.durationMs;
        const p = getPointAlongRowSpans(
          track.rowSpans,
          baseProgress,
          track.yOffset
        );
        ctx.drawImage(
          track.image,
          p.x - MOVING_THUMBNAIL_SIZE / 2,
          p.y - MOVING_THUMBNAIL_SIZE / 2,
          MOVING_THUMBNAIL_SIZE,
          MOVING_THUMBNAIL_SIZE
        );
      }

      rafId = window.requestAnimationFrame(draw);
    };

    const setup = async () => {
      const loaded = await Promise.all(
        animatedGoals.map(
          (goal, idx) =>
            new Promise<typeof tracks[number]>((resolve) => {
              const totalGoals = animatedGoals.length;
              const yOffset = (idx - (totalGoals - 1) / 2) * TRACK_Y_SPACING;
              const image = new Image();
              image.onload = () =>
                resolve({
                  id: goal.id,
                  color: goal.color,
                  image,
                  rowSpans: [],
                  durationMs: goal.durationMs,
                  phaseMs: idx * 430,
                  yOffset,
                });
              image.onerror = () =>
                resolve({
                  id: goal.id,
                  color: goal.color,
                  image,
                  rowSpans: [],
                  durationMs: goal.durationMs,
                  phaseMs: idx * 430,
                  yOffset,
                });
              image.src = goal.src;
            })
        )
      );
      if (cancelled) return;
      tracks = loaded;
      updateCanvasSize();
      updateTrackPoints();
      rafId = window.requestAnimationFrame(draw);
    };

    setup();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
      updateTrackPoints();
    });
    resizeObserver.observe(container);
    window.addEventListener("resize", updateTrackPoints);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTrackPoints);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [animatedGoals]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => loadMonth(subMonths(month, 1))}
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
          onClick={() => loadMonth(addMonths(month, 1))}
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

      {/* Calendar grid with animated canvas overlay */}
      <div ref={gridRef} className="relative space-y-0">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-20"
          aria-hidden="true"
        />
        {weeks.map((week, wi) => (
          <div key={wi}>
            {/* Day cells for this week */}
            <div className="grid grid-cols-7 gap-px bg-[var(--border)] p-px">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  data-date={day.dateStr}
                  className="relative bg-[var(--background)]"
                >
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
