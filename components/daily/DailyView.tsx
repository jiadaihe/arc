"use client";

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import type { Item, GoalWithHealth } from "@/lib/types";
import TimedItems from "./TimedItems";
import Checklist from "./Checklist";
import QuickAddItem from "./QuickAddItem";

interface DailyViewProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onItemChange?: () => void;
}

export interface DailyViewHandle {
  refresh: () => void;
}

const DailyView = forwardRef<DailyViewHandle, DailyViewProps>(function DailyView({ date, onDateChange, onItemChange }, ref) {
  const [items, setItems] = useState<Item[]>([]);
  const [goals, setGoals] = useState<GoalWithHealth[]>([]);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/items?date=${dateStr}`);
    setItems(await res.json());
  }, [dateStr]);

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    setGoals(await res.json());
  }, []);

  const refresh = useCallback(() => {
    fetchItems();
    fetchGoals();
  }, [fetchItems, fetchGoals]);

  useImperativeHandle(ref, () => ({ refresh }), [refresh]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const goalColors: Record<string, string> = {};
  for (const g of goals) goalColors[g.id] = g.color;

  const timedItems = items.filter((i) => i.startTime);
  const checklistItems = items.filter((i) => !i.startTime);

  const handleAdd = async (data: { title: string; date: string; startTime?: string; endTime?: string; goalId?: string | null; assetId?: string | null }) => {
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchItems();
    onItemChange?.();
  };

  const handleUpdate = async (id: string, data: Partial<Item>) => {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchItems();
    onItemChange?.();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    fetchItems();
    onItemChange?.();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Date header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onDateChange(subDays(date, 1))}
          className="p-2 rounded-lg hover:bg-black/[.04] text-[var(--muted)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5L7 10L12 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {format(date, "EEEE")}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {format(date, "MMMM d, yyyy")}
            {isToday(date) && (
              <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 bg-[var(--foreground)] text-[var(--background)] rounded-full">
                Today
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => onDateChange(addDays(date, 1))}
          className="p-2 rounded-lg hover:bg-black/[.04] text-[var(--muted)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 5L13 10L8 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Quick add */}
      <div className="mb-6">
        <QuickAddItem date={dateStr} goals={goals} onAdd={handleAdd} />
      </div>

      {/* Content */}
      <div className="space-y-6">
        <TimedItems
          items={timedItems}
          goals={goals}
          goalColors={goalColors}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        <Checklist
          items={checklistItems}
          goals={goals}
          goalColors={goalColors}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
});

export default DailyView;
