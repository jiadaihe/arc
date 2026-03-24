"use client";

import { differenceInDays, addDays, format, isSameDay } from "date-fns";
import type { ChallengeCheckin } from "@/lib/types";

interface HabitGridProps {
  startDate: string;
  targetDate: string;
  checkins: ChallengeCheckin[];
  color: string;
}

export default function HabitGrid({ startDate, targetDate, checkins, color }: HabitGridProps) {
  const start = new Date(startDate);
  const end = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = differenceInDays(end, start) + 1;

  const checkinDates = new Set(checkins.map((c) => c.date));

  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(start, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isCheckedIn = checkinDates.has(dateStr);
    const isToday = isSameDay(date, today);
    const isPast = date < today;
    return { date, dateStr, isCheckedIn, isToday, isPast };
  });

  return (
    <div className="flex flex-wrap gap-[3px]">
      {days.map((day) => (
        <div
          key={day.dateStr}
          className="w-3 h-3 rounded-sm"
          title={`${day.dateStr}${day.isCheckedIn ? " — checked in" : ""}`}
          style={{
            backgroundColor: day.isCheckedIn ? color : "var(--border)",
            opacity: day.isCheckedIn ? 1 : day.isPast ? 0.4 : 0.2,
            outline: day.isToday ? `2px solid ${color}` : undefined,
            outlineOffset: day.isToday ? "1px" : undefined,
          }}
        />
      ))}
    </div>
  );
}
