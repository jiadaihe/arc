"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
import GoalList from "@/components/goals/GoalList";
import DailyView from "@/components/daily/DailyView";
import CalendarView from "@/components/calendar/CalendarView";
import WeeklySummaryBanner from "@/components/summary/WeeklySummaryBanner";

type ViewTab = "today" | "month";

export default function Home() {
  const [date, setDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("today");

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

  const handleCalendarNavigate = useCallback((navDate: Date) => {
    setDate(navDate);
    setActiveTab("today");
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
        <main className="flex-1 overflow-y-auto">
          {/* Tab navigation */}
          <div className="flex items-center justify-center gap-1 pt-6 pb-2">
            <button
              onClick={() => setActiveTab("today")}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "today"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-black/[.04]"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("month")}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "month"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-black/[.04]"
              }`}
            >
              Month
            </button>
          </div>

          {/* View content */}
          <div className="p-8 pt-4">
            {activeTab === "today" ? (
              <DailyView date={date} onDateChange={setDate} onItemChange={onItemChange} />
            ) : (
              <CalendarView onNavigateToDay={handleCalendarNavigate} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
