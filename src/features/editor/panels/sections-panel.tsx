"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { Project } from "@/domain/project";
import { SLUG_PATTERN } from "@/domain/primitives";
import type { Section, SectionType } from "@/domain/sections";
import { SECTION_BLUEPRINTS } from "@/features/sections/create-section";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { EditorAction } from "../editor-state";
import { setSectionValue, updateSectionMeta } from "../editor-state";
import { FieldControl } from "../fields/field-control";
import { SECTION_FIELDS } from "../section-fields";
import { ContentAssistant } from "../content-assistant";

export const sectionLabel = (s: Section) => s.navLabel || SECTION_BLUEPRINTS[s.type].label;

const ADDABLE: SectionType[] = ["hero", "sceneStory", "services", "catalog", "gallery", "editorial", "about", "steps", "marquee", "cta", "faq", "contact"];

export function SectionsPanel({
  project,
  selectedId,
  dispatch,
  onSelect,
}: {
  project: Project;
  selectedId: string | null;
  dispatch: (a: EditorAction) => void;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Section | null>(null);
  const selected = project.sections.find((s) => s.id === selectedId) ?? null;
  const [anchorDraft, setAnchorDraft] = useState<{ id: string; value: string } | null>(null);
  const anchorValue = anchorDraft && anchorDraft.id === selected?.id ? anchorDraft.value : (selected?.anchor ?? "");
  const anchorTaken = selected ? project.sections.some((s) => s.id !== selected.id && s.anchor === anchorValue) : false;
  const anchorError = !SLUG_PATTERN.test(anchorValue) ? "Use letras minúsculas, números e hífens." : anchorTaken ? "Já usada por outra seção." : undefined;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wider text-fg-subtle uppercase">Estrutura da página</h3>
          <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)} aria-expanded={adding} icon={<Plus className="size-3.5" aria-hidden />}>
            Adicionar seção
          </Button>
        </div>
        {adding && (
          <ul className="mb-3 grid gap-1.5 rounded-lg border border-cyan-glow/30 bg-cyan-glow/5 p-2" aria-label="Tipos de seção">
            {ADDABLE.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "addSection", sectionType: type, afterId: selectedId });
                    setAdding(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-ink-700"
                >
                  <span className="block text-sm text-fg">{SECTION_BLUEPRINTS[type].label}</span>
                  <span className="block text-xs text-fg-subtle">{SECTION_BLUEPRINTS[type].description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <ol className="space-y-1" aria-label="Seções">
          {project.sections.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg border pr-1 transition-colors",
                s.id === selectedId ? "border-cyan-glow/60 bg-cyan-glow/10" : "border-transparent hover:bg-ink-800",
              )}
            >
              <button type="button" onClick={() => onSelect(s.id)} aria-current={s.id === selectedId ? "true" : undefined} className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left">
                <span className="font-mono text-[10px] text-fg-subtle" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("truncate text-sm", s.hidden ? "text-fg-subtle line-through" : "text-fg")}>{sectionLabel(s)}</span>
              </button>
              <span className="flex opacity-60 group-hover:opacity-100 group-focus-within:opacity-100">
                <IconButton label={`Mover ${sectionLabel(s)} para cima`} disabled={i === 0} onClick={() => dispatch({ type: "moveSection", sectionId: s.id, delta: -1 })}>
                  <ArrowUp className="size-3.5" />
                </IconButton>
                <IconButton label={`Mover ${sectionLabel(s)} para baixo`} disabled={i === project.sections.length - 1} onClick={() => dispatch({ type: "moveSection", sectionId: s.id, delta: 1 })}>
                  <ArrowDown className="size-3.5" />
                </IconButton>
                <IconButton label={s.hidden ? `Mostrar ${sectionLabel(s)}` : `Ocultar ${sectionLabel(s)}`} onClick={() => dispatch({ type: "edit", key: `hide-${s.id}`, apply: updateSectionMeta(s.id, { hidden: !s.hidden }) })}>
                  {s.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </IconButton>
                <IconButton label={`Duplicar ${sectionLabel(s)}`} onClick={() => dispatch({ type: "duplicateSection", sectionId: s.id })}>
                  <Copy className="size-3.5" />
                </IconButton>
                <IconButton label={`Remover ${sectionLabel(s)}`} danger onClick={() => setPendingRemoval(s)}>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {selected && (
        <div className="border-t border-line pt-5" key={selected.id}>
          <h3 className="mb-1 font-display text-base font-semibold">{SECTION_BLUEPRINTS[selected.type].label}</h3>
          <p className="mb-4 text-xs text-fg-subtle">{SECTION_BLUEPRINTS[selected.type].description}</p>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <Field label="Nome no menu" hint="Vazio = fora do menu">
              {(a) => (
                <Input id={a.id} aria-describedby={a.describedBy} value={selected.navLabel} maxLength={30} onChange={(e) => dispatch({ type: "edit", key: `nav-${selected.id}`, apply: updateSectionMeta(selected.id, { navLabel: e.target.value }) })} />
              )}
            </Field>
            <Field label="Âncora (#)" error={anchorError}>
              {(a) => (
                <Input
                  id={a.id}
                  aria-describedby={a.describedBy}
                  aria-invalid={a.invalid}
                  value={anchorValue}
                  maxLength={48}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setAnchorDraft({ id: selected.id, value });
                    const valid = SLUG_PATTERN.test(value) && !project.sections.some((s) => s.id !== selected.id && s.anchor === value);
                    if (valid) dispatch({ type: "edit", key: `anchor-${selected.id}`, apply: updateSectionMeta(selected.id, { anchor: value }) });
                  }}
                />
              )}
            </Field>
          </div>
          {(selected.type === "hero" || selected.type === "sceneStory") && (
            <div className="mb-5">
              <ContentAssistant
                project={project}
                task="hero"
                label="Sugerir título e subtítulo"
                onApply={(v) =>
                  dispatch({
                    type: "edit",
                    key: null,
                    apply: (p) => setSectionValue(selected.id, ["subtitle"], v.subtitle ?? "")(setSectionValue(selected.id, ["title"], v.title ?? "")(p)),
                  })
                }
              />
            </div>
          )}
          {selected.type === "about" && (
            <div className="mb-5">
              <ContentAssistant project={project} task="about" label="Sugerir texto de apresentação" onApply={(v) => dispatch({ type: "edit", key: null, apply: setSectionValue(selected.id, ["text"], v.text ?? "") })} />
            </div>
          )}
          <div className="space-y-5">
            {SECTION_FIELDS[selected.type].map((def) => (
              <FieldControl
                key={def.key}
                def={def}
                value={(selected.props as Record<string, unknown>)[def.key]}
                path={[def.key]}
                ctx={{ sections: project.sections, business: project.business }}
                onChange={(path, value, coalesce) =>
                  dispatch({ type: "edit", key: coalesce ? `${selected.id}:${coalesce}` : null, apply: setSectionValue(selected.id, path, value) })
                }
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Remover seção?"
        description={
          <>
            A seção <strong className="text-fg">{pendingRemoval ? sectionLabel(pendingRemoval) : ""}</strong> e todo o seu conteúdo serão
            removidos. Você pode desfazer com Ctrl+Z antes de sair do editor.
          </>
        }
        confirmLabel="Remover seção"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (pendingRemoval) dispatch({ type: "removeSection", sectionId: pendingRemoval.id });
          setPendingRemoval(null);
        }}
      />
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("rounded p-1.5 text-fg-subtle transition-colors disabled:opacity-30", danger ? "hover:bg-danger/15 hover:text-danger" : "hover:bg-ink-700 hover:text-fg")}
    >
      {children}
    </button>
  );
}
