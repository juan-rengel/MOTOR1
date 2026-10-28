"use client";

import type { MotionLevel } from "@/domain/motion";
import type { Project } from "@/domain/project";
import { Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { updateMotion, type EditorAction } from "../editor-state";

const LEVELS: Array<{ id: MotionLevel; label: string; description: string }> = [
  { id: "none", label: "Sem animação", description: "Conteúdo estático." },
  { id: "subtle", label: "Sutil", description: "Entradas curtas e discretas." },
  { id: "balanced", label: "Equilibrado", description: "Revelações e parallax moderados." },
  { id: "cinematic", label: "Cinematográfico", description: "Movimentos amplos e sequências marcantes." },
];

export function MotionPanel({ project, dispatch }: { project: Project; dispatch: (a: EditorAction) => void }) {
  const m = project.motion;
  const set = (patch: Partial<typeof m>) => dispatch({ type: "edit", key: null, apply: updateMotion(patch) });
  const off = m.level === "none";
  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="Intensidade do movimento" className="grid gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={m.level === l.id}
            onClick={() => set({ level: l.id })}
            className={cn("rounded-lg border px-3 py-2.5 text-left transition-colors", m.level === l.id ? "border-cyan-glow bg-cyan-glow/10" : "border-line hover:border-line-strong")}
          >
            <span className="block text-sm text-fg">{l.label}</span>
            <span className="block text-xs text-fg-subtle">{l.description}</span>
          </button>
        ))}
      </div>
      <div className={cn("space-y-4", off && "pointer-events-none opacity-40")} aria-disabled={off}>
        <Toggle label="Transições entre seções" description="Elementos entram suavemente ao rolar." checked={m.sectionTransitions} onChange={(v) => set({ sectionTransitions: v })} disabled={off} />
        <Toggle label="Animação de títulos" description="Palavras sobem de dentro de uma máscara." checked={m.textReveal} onChange={(v) => set({ textReveal: v })} disabled={off} />
        <Toggle label="Revelação de imagens" description="Máscara que abre e leve zoom de entrada." checked={m.imageReveal} onChange={(v) => set({ imageReveal: v })} disabled={off} />
        <Toggle label="Parallax" description="Profundidade: fundos se movem mais devagar que o conteúdo." checked={m.parallax} onChange={(v) => set({ parallax: v })} disabled={off} />
      </div>
      <Notice tone="cyan" title="Acessibilidade e desempenho">
        Visitantes que ativaram “reduzir movimento” no sistema veem o site sem animações, e aparelhos com pouca capacidade
        recebem efeitos reduzidos automaticamente. Use o botão “Movimento” na barra da pré-visualização para conferir o
        site estático.
      </Notice>
    </div>
  );
}
