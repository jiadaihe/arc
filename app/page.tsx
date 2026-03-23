"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
import GoalList from "@/components/goals/GoalList";
import DailyView from "@/components/daily/DailyView";
import WeeklySummaryBanner from "@/components/summary/WeeklySummaryBanner";

export default function Home() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => { setDate(new Date()); }, []);

  const goalListRef = useRef<{ refresh: () => void }>(null);
  const summaryRef = useRef<{ refresh: () => void }>(null);

  const onGoalChange = useCallback(() => {
    summaryRef.current?.refresh();
  }, []);

  const onItemChange = useCallback(() => {
    goalListRef.current?.refresh();
    summaryRef.current?.refresh();
  }, []);

  if (!date) return null;

  const dateStr = format(date, "yyyy-MM-dd");

  return (
    <div className="flex flex-col h-screen">
      <WeeklySummaryBanner ref={summaryRef} date={dateStr} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-[var(--border)] overflow-y-auto shrink-0">
          <GoalList ref={goalListRef} onGoalChange={onGoalChange} />
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
          <DailyView date={date} onDateChange={setDate} onItemChange={onItemChange} />
        </main>
      </div>
    </div>
  );
}
