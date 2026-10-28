"use client";

import { SITE_ICON_IDS, type SiteIconId } from "@/domain/icons";
import { SiteIcon } from "@/features/site-renderer/site-icon";
import { cn } from "@/lib/cn";

export function IconField({ label, value, onChange }: { label: string; value: SiteIconId; onChange: (v: SiteIconId) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-fg-muted">{label}</p>
      <div className="grid grid-cols-9 gap-1" role="radiogroup" aria-label={label}>
        {SITE_ICON_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            aria-label={id}
            title={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border transition-colors",
              value === id ? "border-cyan-glow bg-cyan-glow/15 text-cyan-soft" : "border-transparent text-fg-subtle hover:bg-ink-700 hover:text-fg",
            )}
          >
            <SiteIcon id={id} className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
