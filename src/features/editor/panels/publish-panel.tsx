"use client";

import { Download, ExternalLink, Globe, Rocket } from "lucide-react";
import type { Project } from "@/domain/project";
import { Field, Input } from "@/components/ui/field";
import { Badge, Notice } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import type { ProjectIssue } from "../project-checks";
import type { EditorAction } from "../editor-state";

/**
 * Publicação: etapa independente. Nesta fase NÃO existe hospedagem real —
 * o painel mostra o que já é possível (prévia local, exportação, checklist)
 * e registra o domínio desejado sem afirmar que ele está conectado.
 */
export function PublishPanel({ project, issues, dispatch, dirty }: { project: Project; issues: ProjectIssue[]; dispatch: (a: EditorAction) => void; dirty: boolean }) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const domain = project.publishing.customDomain;
  const domainValid = domain === "" || /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,63}$/.test(domain);

  function exportJson() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.publishing.slug}.cws.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">Status</span>
        <Badge tone="warn">Rascunho local — não publicado</Badge>
      </div>
      <Notice tone="cyan" title="Pré-visualização local">
        Funciona apenas neste computador, enquanto o servidor local estiver rodando.
        <a href={`/preview/${project.id}`} target="_blank" rel="noreferrer" className={buttonClasses("secondary", "sm", "mt-3")}>
          <ExternalLink className="size-3.5" aria-hidden /> Abrir pré-visualização
        </a>
        {dirty && <p className="mt-2 text-xs text-warn">Há alterações não salvas — salve para vê-las na pré-visualização.</p>}
      </Notice>

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Checklist</h3>
        {issues.length === 0 ? (
          <p className="text-sm text-ok">Nenhum problema encontrado.</p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {[...errors, ...warnings].map((i) => (
              <li key={i.id} className={i.level === "error" ? "text-danger" : "text-warn"}>
                • {i.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Field label="Domínio desejado" optional error={domainValid ? undefined : "Domínio inválido. Ex.: minhaoficina.com.br"} hint="Apenas registrado no projeto. A conexão de domínios ainda não foi implementada.">
        {(a) => (
          <Input
            id={a.id}
            aria-invalid={a.invalid}
            aria-describedby={a.describedBy}
            value={domain}
            maxLength={253}
            placeholder="minhaempresa.com.br"
            onChange={(e) => dispatch({ type: "edit", key: "domain", apply: (p) => ({ ...p, publishing: { ...p.publishing, customDomain: e.target.value.trim().toLowerCase() } }) })}
          />
        )}
      </Field>

      <div className="space-y-2">
        <button type="button" onClick={exportJson} className={buttonClasses("secondary", "md", "w-full")}>
          <Download className="size-4" aria-hidden /> Exportar projeto (JSON)
        </button>
        <button type="button" disabled className={buttonClasses("primary", "md", "w-full")} aria-describedby="publish-note">
          <Rocket className="size-4" aria-hidden /> Publicar na internet
        </button>
        <p id="publish-note" className="flex gap-2 text-xs text-fg-subtle">
          <Globe className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Publicação real, hospedagem e domínio personalizado dependem de decisões de infraestrutura (FASE 10). Nada é enviado à
          internet a partir desta tela.
        </p>
      </div>
    </div>
  );
}
