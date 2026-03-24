import { NextResponse } from "next/server";
import * as itemsRepo from "@/db/repositories/items";
import { requireSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const session = await requireSession();
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query parameters are required" },
      { status: 400 }
    );
  }

  const items = itemsRepo.getItemsByDateRange(start, end, userId);
  return NextResponse.json(items);
}
