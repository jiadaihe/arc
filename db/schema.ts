import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "@/lib/auth-schema";

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  color: text("color").notNull(),
  type: text("type", { enum: ["milestone", "challenge"] }).notNull(),
  startDate: text("start_date").notNull(),
  targetDate: text("target_date").notNull(),
  challengeFrequency: text("challenge_frequency", {
    enum: ["daily", "3x_per_week", "5x_per_week"],
  }),
  challengeDurationDays: integer("challenge_duration_days"),
  status: text("status", {
    enum: ["active", "completed", "archived"],
  })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  completed: integer("completed").notNull().default(0),
  goalId: text("goal_id").references(() => goals.id),
  createdAt: text("created_at").notNull(),
});

export const challengeCheckins = sqliteTable(
  "challenge_checkins",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id),
    date: text("date").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    goalDateIdx: uniqueIndex("checkin_goal_date_idx").on(
      table.goalId,
      table.date
    ),
  })
);
