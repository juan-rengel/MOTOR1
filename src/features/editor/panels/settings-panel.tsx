"use client";

import type { Project } from "@/domain/project";
import { SLUG_PATTERN } from "@/domain/primitives";
import { Field, Input, Textarea, Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/misc";
import { formatDateTime } from "@/config/labels";
import type { EditorAction } from "../editor-state";
import { ContentAssistant } from "../content-assistant";

export function SettingsPanel({ project, dispatch }: { project: Project; dispatch: (a: EditorAction) => void }) {
  const edit = (key: string | null, apply: (p: Project) => Project) => dispatch({ type: "edit", key, apply });
  const slugInvalid = !SLUG_PATTERN.test(project.publishing.slug);
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold tracking-wider text-fg-subtle uppercase">Buscadores e compartilhamento</h3>
      <Field label="Título da página" hint={`${project.seo.title.length}/70`}>
        {(a) => <Input id={a.id} aria-describedby={a.describedBy} value={project.seo.title} maxLength={70} onChange={(e) => edit("seo.title", (p) => ({ ...p, seo: { ...p.seo, title: e.target.value } }))} />}
      </Field>
      <Field label="Descrição" hint={`${project.seo.description.length}/170`}>
        {(a) => <Textarea id={a.id} aria-describedby={a.describedBy} value={project.seo.description} maxLength={170} onChange={(e) => edit("seo.desc", (p) => ({ ...p, seo: { ...p.seo, description: e.target.value } }))} />}
      </Field>
      <ContentAssistant project={project} task="seo" label="Sugerir título e descrição" onApply={(v) => edit(null, (p) => ({ ...p, seo: { title: (v.title ?? "").slice(0, 70), description: (v.description ?? "").slice(0, 170) } }))} />
      <Field label="Identificador (slug)" error={slugInvalid ? "Use letras minúsculas, números e hífens." : undefined} hint="Usado no endereço quando a publicação existir.">
        {(a) => (
          <Input
            id={a.id}
            aria-invalid={a.invalid}
            aria-describedby={a.describedBy}
            defaultValue={project.publishing.slug}
            maxLength={48}
            onChange={(e) => {
              const v = e.target.value.toLowerCase();
              if (SLUG_PATTERN.test(v)) edit("slug", (p) => ({ ...p, publishing: { ...p.publishing, slug: v } }));
            }}
          />
        )}
      </Field>
      <h3 className="pt-2 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Conteúdo</h3>
      <Toggle
        label="Contém conteúdo demonstrativo"
        description="Desmarque depois de substituir textos e imagens de exemplo pelos reais do negócio."
        checked={project.flags.demoContent}
        onChange={(v) => edit(null, (p) => ({ ...p, flags: { ...p.flags, demoContent: v } }))}
      />
      <Notice>
        Criado em {formatDateTime(project.createdAt)} · atualizado em {formatDateTime(project.updatedAt)} · revisão {project.revision} · modelo{" "}
        <code className="text-fg">{project.templateId}</code>
      </Notice>
    </div>
  );
}
