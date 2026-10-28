import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "warn" | "ok" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "border-line-strong text-fg-muted bg-ink-800",
    cyan: "border-cyan-glow/40 text-cyan-soft bg-cyan-glow/10",
    warn: "border-warn/40 text-warn bg-warn/10",
    ok: "border-ok/40 text-ok bg-ok/10",
    danger: "border-danger/40 text-danger bg-danger/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-line bg-ink-900/80 backdrop-blur", className)}>{children}</div>;
}

export function Spinner({ className, label = "Carregando" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <span className="size-4 animate-spin rounded-full border-2 border-cyan-glow/30 border-t-cyan-glow" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      {icon && <div className="mb-4 text-cyan-glow">{icon}</div>}
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = "neutral",
  title,
  children,
  className,
}: {
  tone?: "neutral" | "warn" | "danger" | "cyan" | "ok";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "border-line bg-ink-850 text-fg-muted",
    cyan: "border-cyan-glow/30 bg-cyan-glow/5 text-fg-muted",
    warn: "border-warn/30 bg-warn/5 text-fg-muted",
    danger: "border-danger/30 bg-danger/5 text-fg-muted",
    ok: "border-ok/30 bg-ok/5 text-fg-muted",
  };
  const titleTones = { neutral: "text-fg", cyan: "text-cyan-soft", warn: "text-warn", danger: "text-danger", ok: "text-ok" };
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}>
      {title && <p className={cn("mb-1 font-medium", titleTones[tone])}>{title}</p>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-800", className)} aria-hidden />;
}
