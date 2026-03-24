import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ASSETS } from "@/lib/assets";
import { matchAssetByKeyword } from "@/lib/asset-matcher";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json(
      { error: "title query parameter is required" },
      { status: 400 }
    );
  }

  // Try keyword matching first
  const keywordMatch = matchAssetByKeyword(title, ASSETS);
  if (keywordMatch) {
    return NextResponse.json({ assetId: keywordMatch.id });
  }

  // Fall back to Claude API
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ assetId: null });
  }

  try {
    const assetList = ASSETS.map((a) => `${a.id}: ${a.tags}`).join("\n");

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: `Pick the single best matching asset ID for the task "${title}". Assets:\n${assetList}\n\nRespond with ONLY the asset ID, nothing else. If nothing fits, respond with "none".`,
    });

    const matched = text.trim();
    if (matched === "none") {
      return NextResponse.json({ assetId: null });
    }

    const valid = ASSETS.find((a) => a.id === matched);
    return NextResponse.json({ assetId: valid ? valid.id : null });
  } catch {
    return NextResponse.json({ assetId: null });
  }
}
