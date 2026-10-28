import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[var(--ease-cinematic)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-glow text-ink-950 hover:bg-cyan-soft shadow-[0_0_0_1px_rgba(34,211,238,0.4),0_8px_24px_-8px_rgba(34,211,238,0.55)]",
  secondary: "bg-ink-800 text-fg border border-line-strong hover:border-cyan-glow/60 hover:bg-ink-700",
  ghost: "text-fg-muted hover:text-fg hover:bg-ink-800",
  danger: "bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "secondary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
