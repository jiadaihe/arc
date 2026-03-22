import { NextResponse } from "next/server";
import * as itemsRepo from "@/db/repositories/items";
import { newId, nowISO } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date query parameter is required" }, { status: 400 });
  }

  const items = itemsRepo.getItemsByDate(date);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, date } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const item = itemsRepo.createItem({
    id: newId(),
    title,
    date,
    startTime: body.startTime ?? null,
    endTime: body.endTime ?? null,
    goalId: body.goalId ?? null,
    completed: 0,
    createdAt: nowISO(),
  });
  return NextResponse.json(item, { status: 201 });
}
