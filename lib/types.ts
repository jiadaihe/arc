import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { goals, items, challengeCheckins } from "@/db/schema";

export interface Asset {
  id: string;
  filename: string;
  tags: string;
}

export type Goal = InferSelectModel<typeof goals>;
export type NewGoal = InferInsertModel<typeof goals>;

export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;

export type ChallengeCheckin = InferSelectModel<typeof challengeCheckins>;
export type NewChallengeCheckin = InferInsertModel<typeof challengeCheckins>;

export type GoalHealthState = "thriving" | "neutral" | "fading" | "blinking";

export type GoalWithHealth = Goal & {
  healthState: GoalHealthState;
};
