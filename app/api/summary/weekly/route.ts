import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek, format } from "date-fns";
import * as itemsRepo from "@/db/repositories/items";
import * as goalsRepo from "@/db/repositories/goals";
import * as checkinsRepo from "@/db/repositories/checkins";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const now = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(weekEnd, "yyyy-MM-dd");

  const items = itemsRepo.getItemsByDateRange(startStr, endStr);
  const activeGoals = goalsRepo.getAllActiveGoals();

  const goalActivity: Record<string, { title: string; color: string; itemCount: number; checkinCount: number }> = {};

  for (const goal of activeGoals) {
    const checkins = checkinsRepo.getCheckinsByGoalId(goal.id).filter(
      (c) => c.date >= startStr && c.date <= endStr
    );
    goalActivity[goal.id] = {
      title: goal.title,
      color: goal.color,
      itemCount: 0,
      checkinCount: checkins.length,
    };
  }

  for (const item of items) {
    if (item.goalId && goalActivity[item.goalId]) {
      goalActivity[item.goalId].itemCount++;
    }
  }

  const active = Object.values(goalActivity).filter(
    (g) => g.itemCount > 0 || g.checkinCount > 0
  );
  const neglected = Object.values(goalActivity).filter(
    (g) => g.itemCount === 0 && g.checkinCount === 0
  );

  return NextResponse.json({
    weekStart: startStr,
    weekEnd: endStr,
    goalActivity: active,
    neglectedGoals: neglected,
  });
}
