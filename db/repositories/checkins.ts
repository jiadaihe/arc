import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { challengeCheckins } from "../schema";
import type { ChallengeCheckin, NewChallengeCheckin } from "@/lib/types";

export function getCheckinsByGoalId(goalId: string): ChallengeCheckin[] {
  return db
    .select()
    .from(challengeCheckins)
    .where(eq(challengeCheckins.goalId, goalId))
    .all();
}

export function getCheckinByGoalAndDate(
  goalId: string,
  date: string
): ChallengeCheckin | undefined {
  return db
    .select()
    .from(challengeCheckins)
    .where(
      and(
        eq(challengeCheckins.goalId, goalId),
        eq(challengeCheckins.date, date)
      )
    )
    .get();
}

export function createCheckin(
  checkin: NewChallengeCheckin
): ChallengeCheckin {
  db.insert(challengeCheckins).values(checkin).run();
  return db
    .select()
    .from(challengeCheckins)
    .where(eq(challengeCheckins.id, checkin.id))
    .get()!;
}
