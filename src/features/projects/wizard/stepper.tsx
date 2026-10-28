import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { WIZARD_STEPS, type WizardStepId } from "./use-wizard-state";

export function Stepper({ current }: { current: WizardStepId }) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Etapas">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-4" aria-current={active ? "step" : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border font-mono text-xs transition-colors",
                  active && "border-cyan-glow bg-cyan-glow/15 text-cyan-soft",
                  done && "border-cyan-glow/50 bg-cyan-glow/80 text-ink-950",
                  !active && !done && "border-line-strong text-fg-subtle",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-sm", active ? "text-fg" : "text-fg-subtle", "hidden sm:inline")}>{s.label}</span>
            </span>
            {i < WIZARD_STEPS.length - 1 && <span className="h-px w-6 bg-line-strong sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
