"use client";

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import type { GoalWithHealth, ChallengeCheckin } from "@/lib/types";
import { MAX_ACTIVE_GOALS } from "@/lib/constants";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";

interface GoalListProps {
  onGoalChange?: () => void;
}

export interface GoalListHandle {
  refresh: () => void;
}

const GoalList = forwardRef<GoalListHandle, GoalListProps>(function GoalList({ onGoalChange }, ref) {
  const [goals, setGoals] = useState<GoalWithHealth[]>([]);
  const [checkins, setCheckins] = useState<Record<string, ChallengeCheckin[]>>({});
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);

    const challengeGoals = data.filter((g: GoalWithHealth) => g.habitFrequency);
    const checkinMap: Record<string, ChallengeCheckin[]> = {};
    await Promise.all(
      challengeGoals.map(async (g: GoalWithHealth) => {
        const res = await fetch(`/api/checkins?goalId=${g.id}`);
        checkinMap[g.id] = await res.json();
      })
    );
    setCheckins(checkinMap);
  }, []);

  useImperativeHandle(ref, () => ({ refresh: fetchGoals }), [fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCheckIn = async (goalId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, date: today }),
    });
    fetchGoals();
    onGoalChange?.();
  };

  const handleDelete = async (goalId: string) => {
    await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
    fetchGoals();
    onGoalChange?.();
  };

  const handleCreated = () => {
    fetchGoals();
    onGoalChange?.();
  };

  const atLimit = goals.length >= MAX_ACTIVE_GOALS;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Goals
        </h2>
        <button
          onClick={() => setShowForm(true)}
          disabled={atLimit}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-black/[.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={atLimit ? "Maximum 6 active goals" : "New goal"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 1v12M1 7h12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          checkins={checkins[goal.id] || []}
          onCheckIn={
            goal.habitFrequency ? () => handleCheckIn(goal.id) : undefined
          }
          onDelete={() => handleDelete(goal.id)}
        />
      ))}

      {showForm && (
        <GoalForm onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  );
});

export default GoalList;
