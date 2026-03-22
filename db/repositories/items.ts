import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "../index";
import { items } from "../schema";
import type { Item, NewItem } from "@/lib/types";

export function getItemsByDate(date: string): Item[] {
  return db.select().from(items).where(eq(items.date, date)).all();
}

export function getItemById(id: string): Item | undefined {
  return db.select().from(items).where(eq(items.id, id)).get();
}

export function getItemsByGoalId(goalId: string): Item[] {
  return db.select().from(items).where(eq(items.goalId, goalId)).all();
}

export function getItemsByDateRange(
  startDate: string,
  endDate: string
): Item[] {
  return db
    .select()
    .from(items)
    .where(and(gte(items.date, startDate), lte(items.date, endDate)))
    .all();
}

export function createItem(item: NewItem): Item {
  db.insert(items).values(item).run();
  return db.select().from(items).where(eq(items.id, item.id)).get()!;
}

export function updateItem(
  id: string,
  data: Partial<Omit<Item, "id" | "createdAt">>
): Item | undefined {
  db.update(items).set(data).where(eq(items.id, id)).run();
  return db.select().from(items).where(eq(items.id, id)).get();
}

export function deleteItem(id: string): void {
  db.delete(items).where(eq(items.id, id)).run();
}
