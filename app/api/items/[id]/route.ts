import { NextResponse } from "next/server";
import * as itemsRepo from "@/db/repositories/items";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const item = itemsRepo.updateItem(id, body);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  itemsRepo.deleteItem(id);
  return NextResponse.json({ success: true });
}
