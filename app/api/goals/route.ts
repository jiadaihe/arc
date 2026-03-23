import { NextResponse } from "next/server";
import { differenceInDays } from "date-fns";
import * as goalsRepo from "@/db/repositories/goals";
import * as itemsRepo from "@/db/repositories/items";
import * as checkinsRepo from "@/db/repositories/checkins";
import { MAX_ACTIVE_GOALS } from "@/lib/constants";
import { newId, nowISO } from "@/lib/utils";
import { requireSession } from "@/lib/auth-session";
import type { Goal, GoalHealthState, GoalWithHealth } from "@/lib/types";

export function computeHealthState(
  goal: Goal,
  userId: string
): GoalHealthState {
  const now = new Date();
  const items = itemsRepo.getItemsByGoalId(goal.id, userId);
  const checkins = checkinsRepo.getCheckinsByGoalId(goal.id, userId);

  let latestActivity: Date | null = null;

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (!latestActivity || d > latestActivity) latestActivity = d;
  }
  for (const checkin of checkins) {
    const d = new Date(checkin.date);
    if (!latestActivity || d > latestActivity) latestActivity = d;
  }

  if (!latestActivity) return "blinking";

  const daysSince = differenceInDays(now, latestActivity);
  if (daysSince <= 3) return "thriving";
  if (daysSince <= 5) return "neutral";
  if (daysSince <= 7) return "fading";
  return "blinking";
}

function withHealth(goal: Goal, userId: string): GoalWithHealth {
  return { ...goal, healthState: computeHealthState(goal, userId) };
}

export async function GET() {
  const session = await requireSession();
  const userId = session.user.id;
  const goals = goalsRepo.getAllActiveGoals(userId);
  return NextResponse.json(goals.map((g) => withHealth(g, userId)));
}

export async function POST(request: Request) {
  const session = await requireSession();
  const userId = session.user.id;
  const body = await request.json();
  const {
    title,
    color,
    type,
    startDate,
    targetDate,
    challengeFrequency,
    challengeDurationDays,
  } = body;

  if (!title || !color || !type || !startDate || !targetDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const count = goalsRepo.countActiveGoals(userId);
  if (count >= MAX_ACTIVE_GOALS) {
    return NextResponse.json(
      { error: `Cannot have more than ${MAX_ACTIVE_GOALS} active goals` },
      { status: 400 }
    );
  }

  const now = nowISO();
  const goal = goalsRepo.createGoal({
    id: newId(),
    userId,
    title,
    color,
    type,
    startDate,
    targetDate,
    challengeFrequency: challengeFrequency ?? null,
    challengeDurationDays: challengeDurationDays ?? null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(withHealth(goal, userId), { status: 201 });
}
