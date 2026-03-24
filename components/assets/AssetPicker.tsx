"use client";

import { ASSETS } from "@/lib/assets";

interface AssetPickerProps {
  selectedAssetId: string | null;
  onSelect: (assetId: string | null) => void;
  onClose: () => void;
}

export default function AssetPicker({
  selectedAssetId,
  onSelect,
  onClose,
}: AssetPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Pick a thumbnail</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/[.05] text-[var(--muted)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => {
                onSelect(asset.id === selectedAssetId ? null : asset.id);
                onClose();
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                asset.id === selectedAssetId
                  ? "ring-2 ring-[var(--foreground)] bg-black/[.06]"
                  : "hover:bg-black/[.04]"
              }`}
              title={asset.id}
            >
              <img
                src={`/assets/${asset.filename}`}
                alt={asset.id}
                width={28}
                height={28}
                draggable={false}
              />
            </button>
          ))}
        </div>
        {selectedAssetId && (
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="mt-3 w-full text-xs text-[var(--muted)] py-1.5 rounded-lg hover:bg-black/[.04] transition-colors"
          >
            Remove thumbnail
          </button>
        )}
      </div>
    </div>
  );
}
