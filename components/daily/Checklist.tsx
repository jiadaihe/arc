"use client";

import type { Item, GoalWithHealth } from "@/lib/types";
import ItemRow from "./ItemRow";

interface ChecklistProps {
  items: Item[];
  goals: GoalWithHealth[];
  goalColors: Record<string, string>;
  onUpdate: (id: string, data: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export default function Checklist({ items, goals, goalColors, onUpdate, onDelete }: ChecklistProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
        Tasks
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)] py-2 px-2">No tasks yet.</p>
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => (
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
      )}
    </div>
  );
}
