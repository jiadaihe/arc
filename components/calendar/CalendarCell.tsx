"use client";

import type { Item } from "@/lib/types";
import { ASSETS } from "@/lib/assets";
import { matchAssetByKeyword } from "@/lib/asset-matcher";
import AssetThumbnail from "./AssetThumbnail";

interface CalendarCellProps {
  date: string;
  items: Item[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onNavigate: (date: string) => void;
}

const MAX_THUMBNAILS = 5;

export default function CalendarCell({
  date,
  items,
  isToday,
  isCurrentMonth,
  onNavigate,
}: CalendarCellProps) {
  const unlinkedItems = items.filter((item) => !item.goalId);

  const itemsWithResolvedAsset = unlinkedItems
    .map((item) => ({
      item,
      assetId: item.assetId ?? matchAssetByKeyword(item.title, ASSETS)?.id ?? null,
    }))
    .filter((entry): entry is { item: Item; assetId: string } => Boolean(entry.assetId));
  const thumbnails = itemsWithResolvedAsset.map(({ item, assetId }) => ({ key: `item-${item.id}`, assetId }));
  const shown = thumbnails.slice(0, MAX_THUMBNAILS);
  const overflow = thumbnails.length - MAX_THUMBNAILS;

  return (
    <button
      onClick={() => onNavigate(date)}
      className={`block w-full h-full min-h-[72px] px-1 pb-1 pt-5 rounded-none text-left transition-colors hover:bg-black/[.04] ${
        isToday ? "ring-1 ring-[var(--foreground)] ring-inset" : ""
      } ${isCurrentMonth ? "" : "opacity-30"}`}
    >
      <div className="flex flex-wrap gap-0.5 items-start justify-start">
        {shown.map(({ key, assetId }) => (
          <AssetThumbnail
            key={key}
            assetId={assetId}
            size={18}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[9px] text-[var(--muted)] leading-[18px]">
            +{overflow}
          </span>
        )}
      </div>
    </button>
  );
}
