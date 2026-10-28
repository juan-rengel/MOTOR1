import { platformConfig } from "@/config/platform";
import { cn } from "@/lib/cn";

/** Marca da plataforma: lente/obturador estilizado em ciano. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="cws-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0b0e12" stroke="url(#cws-g)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="url(#cws-g)" strokeWidth="2" />
      <path d="M16 8 L20 16 L16 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.7" />
      <circle cx="16" cy="16" r="2.4" fill="#22d3ee" />
    </svg>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-fg">
          {platformConfig.name}
        </span>
      )}
    </span>
  );
}
