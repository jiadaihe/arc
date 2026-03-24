"use client";

import { useState } from "react";
import { GOAL_COLORS } from "@/lib/constants";

interface GoalFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function GoalForm({ onClose, onCreated }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>(GOAL_COLORS[0]);
  const [targetDate, setTargetDate] = useState("");
  const [hasHabit, setHasHabit] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "3x_per_week" | "5x_per_week">("daily");
  const [habitDurationDays, setHabitDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim() || !targetDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        color,
        startDate: new Date().toISOString().slice(0, 10),
        targetDate,
        habitFrequency: hasHabit ? habitFrequency : null,
        habitDurationDays: hasHabit ? habitDurationDays : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create goal");
      setSubmitting(false);
      return;
    }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Goal</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/[.05] text-[var(--muted)]">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-1">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Run a half marathon"
            className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-2">Color</label>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : undefined,
                  outlineOffset: "3px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Target date */}
        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-1">Target date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>

        {/* Recurring practice toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={hasHabit}
              onClick={() => setHasHabit(!hasHabit)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                hasHabit ? "" : "bg-[var(--border)]"
              }`}
              style={hasHabit ? { backgroundColor: color } : undefined}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  hasHabit ? "translate-x-4" : ""
                }`}
              />
            </button>
            <span className="text-sm">Set a recurring practice?</span>
          </label>
        </div>

        {/* Habit fields */}
        {hasHabit && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">Frequency</label>
              <select
                value={habitFrequency}
                onChange={(e) => setHabitFrequency(e.target.value as typeof habitFrequency)}
                className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="3x_per_week">3x per week</option>
                <option value="5x_per_week">5x per week</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">Duration (days)</label>
              <input
                type="number"
                min={1}
                value={habitDurationDays}
                onChange={(e) => setHabitDurationDays(Number(e.target.value))}
                className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: color, color: "white" }}
        >
          {submitting ? "Creating..." : "Create Goal"}
        </button>
      </div>
    </div>
  );
}
