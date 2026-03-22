"use client";

import { useState } from "react";
import type { GoalWithHealth } from "@/lib/types";
import GoalLinkSelector from "./GoalLinkSelector";

interface QuickAddItemProps {
  date: string;
  goals: GoalWithHealth[];
  onAdd: (data: { title: string; date: string; startTime?: string; endTime?: string; goalId?: string | null }) => void;
}

export default function QuickAddItem({ date, goals, onAdd }: QuickAddItemProps) {
  const [title, setTitle] = useState("");
  const [showTime, setShowTime] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      date,
      startTime: showTime && startTime ? startTime : undefined,
      endTime: showTime && endTime ? endTime : undefined,
      goalId,
    });
    setTitle("");
    setStartTime("");
    setEndTime("");
    setGoalId(null);
    setShowTime(false);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[var(--muted)] text-sm">+</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Add an item…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--muted)]"
        />
      </div>

      {/* Bottom bar: time toggle + goal selector */}
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTime(!showTime)}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
              showTime
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {showTime ? "timed" : "add time"}
          </button>

          {showTime && (
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-[11px] bg-transparent text-[var(--foreground)] outline-none"
              />
              <span className="text-[11px] text-[var(--muted)]">–</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-[11px] bg-transparent text-[var(--foreground)] outline-none"
              />
            </div>
          )}
        </div>

        <GoalLinkSelector goals={goals} selectedGoalId={goalId} onSelect={setGoalId} />
      </div>
    </div>
  );
}
