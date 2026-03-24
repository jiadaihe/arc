import { NextResponse } from "next/server";
import { ASSETS } from "@/lib/assets";

export async function GET() {
  return NextResponse.json(ASSETS);
}
