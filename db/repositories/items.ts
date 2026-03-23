import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "../index";
import { items } from "../schema";
import type { Item, NewItem } from "@/lib/types";

export function getItemsByDate(date: string, userId: string): Item[] {
  return db
    .select()
    .from(items)
    .where(and(eq(items.date, date), eq(items.userId, userId)))
    .all();
}

export function getItemById(id: string, userId: string): Item | undefined {
  return db
    .select()
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .get();
}

export function getItemsByGoalId(goalId: string, userId: string): Item[] {
  return db
    .select()
    .from(items)
    .where(and(eq(items.goalId, goalId), eq(items.userId, userId)))
    .all();
}

export function getItemsByDateRange(
  startDate: string,
  endDate: string,
  userId: string
): Item[] {
  return db
    .select()
    .from(items)
    .where(
      and(
        gte(items.date, startDate),
        lte(items.date, endDate),
        eq(items.userId, userId)
      )
    )
    .all();
}

export function createItem(item: NewItem): Item {
  db.insert(items).values(item).run();
  return db.select().from(items).where(eq(items.id, item.id)).get()!;
}

export function updateItem(
  id: string,
  userId: string,
  data: Partial<Omit<Item, "id" | "userId" | "createdAt">>
): Item | undefined {
  db.update(items)
    .set(data)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .run();
  return db
    .select()
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .get();
}

export function deleteItem(id: string, userId: string): void {
  db.delete(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .run();
}
