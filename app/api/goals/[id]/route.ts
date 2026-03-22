import { NextResponse } from "next/server";
import * as goalsRepo from "@/db/repositories/goals";
import { nowISO } from "@/lib/utils";
import { computeHealthState } from "@/app/api/goals/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const goal = goalsRepo.updateGoal(id, { ...body, updatedAt: nowISO() });
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }
  return NextResponse.json({ ...goal, healthState: computeHealthState(goal) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goal = goalsRepo.updateGoal(id, { status: "archived", updatedAt: nowISO() });
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }
  return NextResponse.json({ ...goal, healthState: computeHealthState(goal) });
}
