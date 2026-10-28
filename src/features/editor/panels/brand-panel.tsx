"use client";

import "@fontsource-variable/playfair-display";
import "@fontsource-variable/oswald";
import "@fontsource-variable/manrope";
import { useState } from "react";
import { FONT_OPTIONS } from "@/config/fonts";
import { VISUAL_STYLE_LIST, VISUAL_STYLES } from "@/config/styles";
import type { Project } from "@/domain/project";
import { HEX_COLOR_PATTERN } from "@/domain/primitives";
import type { FontId, SiteTheme, ThemeColorKey, VisualStyleId } from "@/domain/theme";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Select, Toggle } from "@/components/ui/field";
import { contrastRatio } from "@/lib/color";
import { ImageField } from "../fields/media-field";
import { updateTheme, type EditorAction } from "../editor-state";

const COLOR_LABELS: Record<ThemeColorKey, string> = {
  background: "Fundo",
  surface: "Superfície (cartões)",
  text: "Texto",
  muted: "Texto secundário",
  primary: "Cor principal",
  onPrimary: "Texto sobre a principal",
  accent: "Destaque",
  border: "Bordas",
};

function ColorField({ label, value, onChange, contrastWith }: { label: string; value: string; onChange: (v: string) => void; contrastWith?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value;
  const ratio = contrastWith ? contrastRatio(value, contrastWith) : null;
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} (seletor)`} className="h-9 w-11 shrink-0 cursor-pointer rounded border border-line bg-transparent p-0.5" />
      <div className="min-w-0 flex-1">
        <label className="block text-xs text-fg-muted">
          {label}
          <input
            value={shown}
            maxLength={7}
            onChange={(e) => {
              const v = e.target.value.trim();
              setDraft(v);
              if (HEX_COLOR_PATTERN.test(v)) onChange(v.toLowerCase());
            }}
            onBlur={() => setDraft(null)}
            aria-invalid={!HEX_COLOR_PATTERN.test(shown)}
            className="mt-1 block h-8 w-full rounded border border-line bg-ink-900 px-2 font-mono text-xs text-fg focus:border-cyan-glow focus:outline-none aria-[invalid=true]:border-danger"
          />
        </label>
      </div>
      {ratio !== null && (
        <span className={`shrink-0 font-mono text-[10px] ${ratio >= 4.5 ? "text-ok" : "text-warn"}`} title="Contraste (mínimo recomendado 4.5:1)">
          {ratio.toFixed(1)}:1
        </span>
      )}
    </div>
  );
}

export function BrandPanel({ project, dispatch }: { project: Project; dispatch: (a: EditorAction) => void }) {
  const theme = project.theme;
  const [pendingStyle, setPendingStyle] = useState<VisualStyleId | null>(null);
  const setTheme = (patch: Partial<SiteTheme>, key: string) => dispatch({ type: "edit", key, apply: updateTheme(patch) });
  const setColor = (k: ThemeColorKey, v: string) => setTheme({ colors: { ...theme.colors, [k]: v } }, `color.${k}`);

  return (
    <div className="space-y-6">
      <ImageField
        label="Logotipo"
        value={project.brand.logo}
        onChange={(logo, sub) => dispatch({ type: "edit", key: sub ? `logo.${sub}` : null, apply: (p) => ({ ...p, brand: { ...p.brand, logo } }) })}
      />
      <Toggle
        label="Mostrar o nome junto ao logotipo"
        checked={project.brand.showNameWithLogo}
        onChange={(v) => dispatch({ type: "edit", key: "logo-name", apply: (p) => ({ ...p, brand: { ...p.brand, showNameWithLogo: v } }) })}
      />

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Estilo visual</h3>
        <div className="grid grid-cols-2 gap-2">
          {VISUAL_STYLE_LIST.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id !== project.style && setPendingStyle(s.id)}
              aria-pressed={s.id === project.style}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${s.id === project.style ? "border-cyan-glow bg-cyan-glow/10 text-fg" : "border-line text-fg-muted hover:border-line-strong"}`}
            >
              <span className="flex shrink-0 -space-x-1" aria-hidden>
                {[s.theme.colors.background, s.theme.colors.primary, s.theme.colors.accent].map((c, i) => (
                  <span key={i} className="size-3.5 rounded-full border border-black/20" style={{ background: c }} />
                ))}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider text-fg-subtle uppercase">Cores</h3>
        {(Object.keys(COLOR_LABELS) as ThemeColorKey[]).map((k) => (
          <ColorField
            key={k}
            label={COLOR_LABELS[k]}
            value={theme.colors[k]}
            onChange={(v) => setColor(k, v)}
            contrastWith={k === "text" || k === "muted" ? theme.colors.background : k === "onPrimary" ? theme.colors.primary : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fonte dos títulos">
          {(a) => (
            <Select id={a.id} value={theme.fonts.heading} onChange={(e) => setTheme({ fonts: { ...theme.fonts, heading: e.target.value as FontId } }, "font.h")}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Fonte do texto">
          {(a) => (
            <Select id={a.id} value={theme.fonts.body} onChange={(e) => setTheme({ fonts: { ...theme.fonts, body: e.target.value as FontId } }, "font.b")}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Cantos">
          {(a) => (
            <Select id={a.id} value={theme.radius} onChange={(e) => setTheme({ radius: e.target.value as SiteTheme["radius"] }, "radius")}>
              <option value="sharp">Retos</option>
              <option value="soft">Suaves</option>
              <option value="round">Arredondados</option>
            </Select>
          )}
        </Field>
        <Field label="Títulos">
          {(a) => (
            <Select id={a.id} value={theme.headingCase} onChange={(e) => setTheme({ headingCase: e.target.value as SiteTheme["headingCase"] }, "case")}>
              <option value="normal">Normal</option>
              <option value="uppercase">MAIÚSCULAS</option>
            </Select>
          )}
        </Field>
      </div>
      <p className="rounded-lg border border-line bg-ink-900 p-3 text-sm" style={{ fontFamily: FONT_OPTIONS.find((f) => f.id === theme.fonts.heading)?.family }}>
        Prévia do título — {FONT_OPTIONS.find((f) => f.id === theme.fonts.heading)?.character}
      </p>
      <Toggle label="Granulação de filme" description="Textura sutil sobre a página (efeito cinematográfico)." checked={theme.grain} onChange={(v) => setTheme({ grain: v }, "grain")} />
      <Toggle label="Tema escuro" description="Informa ao navegador o esquema de cores (barras de rolagem, campos)." checked={theme.mode === "dark"} onChange={(v) => setTheme({ mode: v ? "dark" : "light" }, "mode")} />

      <ConfirmDialog
        open={pendingStyle !== null}
        tone="primary"
        title={`Aplicar o estilo “${pendingStyle ? VISUAL_STYLES[pendingStyle].label : ""}”?`}
        description="Cores, fontes, cantos e granulação serão substituídos pelos do estilo (conteúdo e seções não mudam). Dá para desfazer com Ctrl+Z."
        confirmLabel="Aplicar estilo"
        onCancel={() => setPendingStyle(null)}
        onConfirm={() => {
          if (pendingStyle) {
            const preset = VISUAL_STYLES[pendingStyle];
            dispatch({ type: "edit", key: null, apply: (p) => ({ ...p, style: pendingStyle, theme: structuredClone(preset.theme), motion: { ...p.motion, level: preset.motionLevel } }) });
          }
          setPendingStyle(null);
        }}
      />
    </div>
  );
}
