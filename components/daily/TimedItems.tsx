"use client";

import type { Item, GoalWithHealth } from "@/lib/types";
import ItemRow from "./ItemRow";

interface TimedItemsProps {
  items: Item[];
  goals: GoalWithHealth[];
  goalColors: Record<string, string>;
  onUpdate: (id: string, data: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export default function TimedItems({ items, goals, goalColors, onUpdate, onDelete }: TimedItemsProps) {
  const sorted = [...items].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  if (sorted.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
        Timeline
      </h3>
      <div className="space-y-0.5">
        {sorted.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            goals={goals}
            goalColor={item.goalId ? goalColors[item.goalId] || null : null}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
