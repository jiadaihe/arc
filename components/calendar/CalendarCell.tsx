"use client";

import type { Item } from "@/lib/types";
import AssetThumbnail from "./AssetThumbnail";

interface CalendarCellProps {
  date: string;
  items: Item[];
  isToday: boolean;
  isCurrentMonth: boolean;
  goalColors: Record<string, string>;
  onNavigate: (date: string) => void;
}

const MAX_THUMBNAILS = 5;

export default function CalendarCell({
  date,
  items,
  isToday,
  isCurrentMonth,
  goalColors,
  onNavigate,
}: CalendarCellProps) {
  const itemsWithAsset = items.filter((i) => i.assetId);
  const shown = itemsWithAsset.slice(0, MAX_THUMBNAILS);
  const overflow = itemsWithAsset.length - MAX_THUMBNAILS;

  return (
    <button
      onClick={() => onNavigate(date)}
      className={`min-h-[60px] p-1 rounded-lg text-left transition-colors hover:bg-black/[.04] ${
        isToday ? "ring-1 ring-[var(--foreground)] ring-inset" : ""
      } ${isCurrentMonth ? "" : "opacity-30"}`}
    >
      <div className="flex flex-wrap gap-0.5 items-start justify-start">
        {shown.map((item) => (
          <AssetThumbnail
            key={item.id}
            assetId={item.assetId!}
            size={18}
            muted={!item.goalId}
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
