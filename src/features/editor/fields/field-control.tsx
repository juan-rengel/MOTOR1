"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { BusinessInfo } from "@/domain/business";
import type { Cta } from "@/domain/cta";
import type { SiteIconId } from "@/domain/icons";
import type { ImageRef, VideoRef } from "@/domain/primitives";
import type { Section } from "@/domain/sections";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { shortId } from "@/lib/ids";
import { cn } from "@/lib/cn";
import type { FieldDef } from "../section-fields";
import { CtaField } from "./cta-field";
import { IconField } from "./icon-field";
import { ImageField, VideoField } from "./media-field";

export type FieldChange = (path: Array<string | number>, value: unknown, coalesceKey?: string) => void;

interface Ctx {
  sections: Section[];
  business: BusinessInfo;
}

/** Renderiza o controle adequado para uma definição de campo. */
export function FieldControl({ def, value, path, onChange, ctx }: { def: FieldDef; value: unknown; path: Array<string | number>; onChange: FieldChange; ctx: Ctx }) {
  const key = path.join(".");
  switch (def.kind) {
    case "text":
      return (
        <Field label={def.label} hint={def.hint}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} value={String(value ?? "")} maxLength={def.max} onChange={(e) => onChange(path, e.target.value, key)} />}
        </Field>
      );
    case "textarea":
      return (
        <Field label={def.label} hint={def.hint ?? `${String(value ?? "").length}/${def.max}`}>
          {(a) => <Textarea id={a.id} aria-describedby={a.describedBy} rows={def.rows} value={String(value ?? "")} maxLength={def.max} onChange={(e) => onChange(path, e.target.value, key)} className="min-h-0" />}
        </Field>
      );
    case "select":
      return (
        <Field label={def.label}>
          {(a) => (
            <Select id={a.id} value={String(value)} onChange={(e) => onChange(path, e.target.value)}>
              {def.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      );
    case "boolean":
      return <Toggle label={def.label} description={def.hint} checked={Boolean(value)} onChange={(v) => onChange(path, v)} />;
    case "range":
      return (
        <Field label={`${def.label}: ${Math.round(Number(value) * 100)}%`}>
          {(a) => <input id={a.id} type="range" min={def.min} max={def.max} step={def.step} value={Number(value)} onChange={(e) => onChange(path, Number(e.target.value), key)} className="w-full accent-cyan-400" />}
        </Field>
      );
    case "image":
      return <ImageField label={def.label} value={value as ImageRef} onChange={(v, sub) => onChange(path, v, sub ? `${key}.${sub}` : undefined)} />;
    case "video":
      return <VideoField label={def.label} value={value as VideoRef} onChange={(v) => onChange(path, v)} />;
    case "cta":
      return <CtaField label={def.label} value={value as Cta} sections={ctx.sections} business={ctx.business} onChange={(v, sub) => onChange(path, v, sub ? `${key}.${sub}` : undefined)} />;
    case "icon":
      return <IconField label={def.label} value={value as SiteIconId} onChange={(v) => onChange(path, v)} />;
    case "list":
      return <ListField def={def} items={(value as Array<Record<string, unknown>>) ?? []} path={path} onChange={onChange} ctx={ctx} />;
  }
}

function ListField({
  def,
  items,
  path,
  onChange,
  ctx,
}: {
  def: Extract<FieldDef, { kind: "list" }>;
  items: Array<Record<string, unknown>>;
  path: Array<string | number>;
  onChange: FieldChange;
  ctx: Ctx;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(path, next);
  }

  function add() {
    const item = { ...def.newItem(), id: shortId() };
    onChange(path, [...items, item]);
    setOpenId(item.id);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-fg-muted">
          {def.label} <span className="text-fg-subtle">({items.length}/{def.max})</span>
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => {
          const id = String(item.id);
          const open = openId === id;
          const title = String(item[def.titleKey] ?? "") || `${def.itemLabel} ${index + 1}`;
          return (
            <li key={id} className={cn("rounded-lg border bg-ink-900/60", open ? "border-line-strong" : "border-line")}>
              <div className="flex items-center gap-1 pr-1">
                <button type="button" onClick={() => setOpenId(open ? null : id)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm">
                  <ChevronRight className={cn("size-3.5 shrink-0 text-fg-subtle transition-transform", open && "rotate-90")} aria-hidden />
                  <span className="truncate">{title}</span>
                </button>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1.5 text-fg-subtle hover:bg-ink-700 hover:text-fg disabled:opacity-30" aria-label={`Mover ${title} para cima`}>
                  <ArrowUp className="size-3.5" aria-hidden />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded p-1.5 text-fg-subtle hover:bg-ink-700 hover:text-fg disabled:opacity-30" aria-label={`Mover ${title} para baixo`}>
                  <ArrowDown className="size-3.5" aria-hidden />
                </button>
                <button type="button" onClick={() => onChange(path, items.filter((_, i) => i !== index))} className="rounded p-1.5 text-fg-subtle hover:bg-danger/15 hover:text-danger" aria-label={`Remover ${title}`}>
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
              {open && (
                <div className="space-y-4 border-t border-line p-3">
                  {def.fields.map((f) => (
                    <FieldControl key={f.key} def={f} value={item[f.key]} path={[...path, index, f.key]} onChange={onChange} ctx={ctx} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Button size="sm" variant="ghost" className="mt-2" onClick={add} disabled={items.length >= def.max} icon={<Plus className="size-3.5" aria-hidden />}>
        Adicionar {def.itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
