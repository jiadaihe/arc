import { eq } from "drizzle-orm";
import { db } from "../index";
import { goals } from "../schema";
import type { Goal, NewGoal } from "@/lib/types";

export function getAllActiveGoals(): Goal[] {
  return db.select().from(goals).where(eq(goals.status, "active")).all();
}

export function getGoalById(id: string): Goal | undefined {
  return db.select().from(goals).where(eq(goals.id, id)).get();
}

export function createGoal(goal: NewGoal): Goal {
  db.insert(goals).values(goal).run();
  return db.select().from(goals).where(eq(goals.id, goal.id)).get()!;
}

export function updateGoal(
  id: string,
  data: Partial<Omit<Goal, "id" | "createdAt">>
): Goal | undefined {
  db.update(goals).set(data).where(eq(goals.id, id)).run();
  return db.select().from(goals).where(eq(goals.id, id)).get();
}

export function countActiveGoals(): number {
  const result = db
    .select()
    .from(goals)
    .where(eq(goals.status, "active"))
    .all();
  return result.length;
}
