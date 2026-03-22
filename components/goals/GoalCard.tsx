"use client";

import { differenceInDays } from "date-fns";
import type { GoalWithHealth, ChallengeCheckin } from "@/lib/types";
import ChallengeGrid from "./ChallengeGrid";

interface GoalCardProps {
  goal: GoalWithHealth;
  checkins: ChallengeCheckin[];
  onCheckIn?: () => void;
}

export default function GoalCard({ goal, checkins, onCheckIn }: GoalCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(goal.startDate);
  const end = new Date(goal.targetDate);
  const totalDays = Math.max(differenceInDays(end, start), 1);
  const elapsed = Math.max(differenceInDays(today, start), 0);
  const remaining = Math.max(differenceInDays(end, today), 0);
  const progress = Math.min(elapsed / totalDays, 1);

  const healthClass =
    goal.healthState === "thriving" ? "health-thriving" :
    goal.healthState === "fading" ? "health-fading" :
    goal.healthState === "blinking" ? "health-blinking" : "";

  const todayStr = today.toISOString().slice(0, 10);
  const checkedInToday = checkins.some((c) => c.date === todayStr);

  return (
    <div
      className={`rounded-xl p-4 bg-[var(--surface)] border border-[var(--border)] ${healthClass}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: goal.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-tight truncate">{goal.title}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {remaining} days remaining
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: goal.color,
          }}
        />
      </div>

      {/* Challenge-specific: grid + check-in button */}
      {goal.type === "challenge" && (
        <div className="space-y-3">
          <ChallengeGrid
            startDate={goal.startDate}
            targetDate={goal.targetDate}
            checkins={checkins}
            color={goal.color}
          />
          {!checkedInToday && onCheckIn && (
            <button
              onClick={onCheckIn}
              className="w-full text-xs font-medium py-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: goal.color + "18",
                color: goal.color,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goal.color + "30")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goal.color + "18")}
            >
              Check in today
            </button>
          )}
          {checkedInToday && (
            <p className="text-xs text-center text-[var(--muted)]">
              Checked in today
            </p>
          )}
        </div>
      )}
    </div>
  );
}
