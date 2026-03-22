"use client";

import type { GoalWithHealth } from "@/lib/types";

interface GoalLinkSelectorProps {
  goals: GoalWithHealth[];
  selectedGoalId: string | null;
  onSelect: (goalId: string | null) => void;
}

export default function GoalLinkSelector({ goals, selectedGoalId, onSelect }: GoalLinkSelectorProps) {
  return (
    <div className="flex gap-1.5 items-center">
      {goals.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(selectedGoalId === g.id ? null : g.id)}
          className="w-5 h-5 rounded-full transition-transform hover:scale-125"
          title={g.title}
          style={{
            backgroundColor: g.color,
            opacity: selectedGoalId === g.id ? 1 : 0.35,
            outline: selectedGoalId === g.id ? `2px solid ${g.color}` : undefined,
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  );
}
