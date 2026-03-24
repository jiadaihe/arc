"use client";

import { getAssetFilenameById } from "@/lib/assets";

interface AssetThumbnailProps {
  assetId: string;
  size?: number;
  muted?: boolean;
  className?: string;
}

export default function AssetThumbnail({
  assetId,
  size = 24,
  muted = false,
  className = "",
}: AssetThumbnailProps) {
  const filename = getAssetFilenameById(assetId);
  if (!filename) return null;

  return (
    <img
      src={`/assets/${filename}`}
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
      style={{
        filter: muted ? "grayscale(100%) opacity(0.5)" : undefined,
        width: size,
        height: size,
      }}
    />
  );
}
