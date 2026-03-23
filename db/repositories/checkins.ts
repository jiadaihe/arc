import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { challengeCheckins } from "../schema";
import type { ChallengeCheckin, NewChallengeCheckin } from "@/lib/types";

export function getCheckinsByGoalId(
  goalId: string,
  userId: string
): ChallengeCheckin[] {
  return db
    .select()
    .from(challengeCheckins)
    .where(
      and(
        eq(challengeCheckins.goalId, goalId),
        eq(challengeCheckins.userId, userId)
      )
    )
    .all();
}

export function getCheckinByGoalAndDate(
  goalId: string,
  date: string,
  userId: string
): ChallengeCheckin | undefined {
  return db
    .select()
    .from(challengeCheckins)
    .where(
      and(
        eq(challengeCheckins.goalId, goalId),
        eq(challengeCheckins.date, date),
        eq(challengeCheckins.userId, userId)
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
