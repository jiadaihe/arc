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
  const [type, setType] = useState<"milestone" | "challenge">("milestone");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState("");
  const [challengeFrequency, setChallengeFrequency] = useState<"daily" | "3x_per_week" | "5x_per_week">("daily");
  const [challengeDurationDays, setChallengeDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim() || !startDate || !targetDate) {
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
        type,
        startDate,
        targetDate,
        challengeFrequency: type === "challenge" ? challengeFrequency : null,
        challengeDurationDays: type === "challenge" ? challengeDurationDays : null,
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

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-2">Type</label>
          <div className="flex gap-2">
            {(["milestone", "challenge"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 text-sm py-2 rounded-lg border transition-colors capitalize ${
                  type === t
                    ? "border-[var(--foreground)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--muted)] block mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--muted)] block mb-1">Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--foreground)] transition-colors"
            />
          </div>
        </div>

        {/* Challenge-specific fields */}
        {type === "challenge" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">Frequency</label>
              <select
                value={challengeFrequency}
                onChange={(e) => setChallengeFrequency(e.target.value as typeof challengeFrequency)}
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
                value={challengeDurationDays}
                onChange={(e) => setChallengeDurationDays(Number(e.target.value))}
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
          {submitting ? "Creating…" : "Create Goal"}
        </button>
      </div>
    </div>
  );
}
