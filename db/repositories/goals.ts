import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { goals } from "../schema";
import type { Goal, NewGoal } from "@/lib/types";

export function getAllActiveGoals(userId: string): Goal[] {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.status, "active"), eq(goals.userId, userId)))
    .all();
}

export function getGoalById(id: string, userId: string): Goal | undefined {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .get();
}

export function createGoal(goal: NewGoal): Goal {
  db.insert(goals).values(goal).run();
  return db.select().from(goals).where(eq(goals.id, goal.id)).get()!;
}

export function updateGoal(
  id: string,
  userId: string,
  data: Partial<Omit<Goal, "id" | "userId" | "createdAt">>
): Goal | undefined {
  db.update(goals)
    .set(data)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .run();
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .get();
}

export function countActiveGoals(userId: string): number {
  const result = db
    .select()
    .from(goals)
    .where(and(eq(goals.status, "active"), eq(goals.userId, userId)))
    .all();
  return result.length;
}
