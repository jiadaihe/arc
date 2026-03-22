"use client";

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import type { GoalWithHealth, ChallengeCheckin } from "@/lib/types";
import GoalCard from "./GoalCard";

interface GoalListProps {
  onGoalChange?: () => void;
}

export interface GoalListHandle {
  refresh: () => void;
}

const GoalList = forwardRef<GoalListHandle, GoalListProps>(function GoalList({ onGoalChange }, ref) {
  const [goals, setGoals] = useState<GoalWithHealth[]>([]);
  const [checkins, setCheckins] = useState<Record<string, ChallengeCheckin[]>>({});

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);

    const challengeGoals = data.filter((g: GoalWithHealth) => g.type === "challenge");
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

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
        Goals
      </h2>
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          checkins={checkins[goal.id] || []}
          onCheckIn={
            goal.type === "challenge" ? () => handleCheckIn(goal.id) : undefined
          }
        />
      ))}
    </div>
  );
});

export default GoalList;
