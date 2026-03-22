"use client";

import { useState, useRef, useEffect } from "react";
import type { Item, GoalWithHealth } from "@/lib/types";
import GoalLinkSelector from "./GoalLinkSelector";

interface ItemRowProps {
  item: Item;
  goals: GoalWithHealth[];
  goalColor: string | null;
  onUpdate: (id: string, data: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export default function ItemRow({ item, goals, goalColor, onUpdate, onDelete }: ItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [showGoalLink, setShowGoalLink] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync title when item changes externally
  useEffect(() => { setTitle(item.title); }, [item.title]);

  // Click outside to close popover
  useEffect(() => {
    if (!showGoalLink) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowGoalLink(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showGoalLink]);

  const commitEdit = () => {
    setEditing(false);
    if (title.trim() && title !== item.title) {
      onUpdate(item.id, { title: title.trim() });
    } else {
      setTitle(item.title);
    }
  };

  return (
    <div className="group relative flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-black/[.03] transition-colors">
      {/* Checkbox */}
      <button
        onClick={() => onUpdate(item.id, { completed: item.completed ? 0 : 1 })}
        className="w-[18px] h-[18px] rounded border-2 shrink-0 flex items-center justify-center transition-colors"
        style={{
          borderColor: goalColor || "var(--border)",
          backgroundColor: item.completed ? (goalColor || "var(--muted)") : "transparent",
        }}
      >
        {item.completed ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </button>

      {/* Goal color dot */}
      {goalColor && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: goalColor }}
        />
      )}

      {/* Title */}
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") { setTitle(item.title); setEditing(false); }
          }}
          className="flex-1 text-sm bg-transparent outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={`flex-1 text-sm cursor-text ${item.completed ? "line-through text-[var(--muted)]" : ""}`}
        >
          {item.title}
        </span>
      )}

      {/* Time badge */}
      {item.startTime && (
        <span className="text-[11px] text-[var(--muted)] tabular-nums shrink-0">
          {item.startTime}{item.endTime ? `–${item.endTime}` : ""}
        </span>
      )}

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowGoalLink(!showGoalLink)}
          className="p-1 rounded hover:bg-black/[.06] text-[var(--muted)]"
          title="Link to goal"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" strokeLinecap="round" />
            <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 rounded hover:bg-black/[.06] text-[var(--muted)]"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Goal link popover */}
      {showGoalLink && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 shadow-md z-20"
        >
          <GoalLinkSelector
            goals={goals}
            selectedGoalId={item.goalId}
            onSelect={(goalId) => {
              onUpdate(item.id, { goalId });
              setShowGoalLink(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
