import { NextResponse } from "next/server";
import * as checkinsRepo from "@/db/repositories/checkins";
import { newId, nowISO } from "@/lib/utils";
import { requireSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const session = await requireSession();
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const goalId = searchParams.get("goalId");

  if (!goalId) {
    return NextResponse.json(
      { error: "goalId query parameter is required" },
      { status: 400 }
    );
  }

  const checkins = checkinsRepo.getCheckinsByGoalId(goalId, userId);
  return NextResponse.json(checkins);
}

export async function POST(request: Request) {
  const session = await requireSession();
  const userId = session.user.id;
  const body = await request.json();
  const { goalId, date } = body;

  if (!goalId || !date) {
    return NextResponse.json(
      { error: "goalId and date are required" },
      { status: 400 }
    );
  }

  const existing = checkinsRepo.getCheckinByGoalAndDate(goalId, date, userId);
  if (existing) {
    return NextResponse.json(
      { error: "Already checked in for this goal on this date" },
      { status: 400 }
    );
  }

  const checkin = checkinsRepo.createCheckin({
    id: newId(),
    userId,
    goalId,
    date,
    createdAt: nowISO(),
  });
  return NextResponse.json(checkin, { status: 201 });
}
