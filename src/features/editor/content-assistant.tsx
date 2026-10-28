"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import type { Project } from "@/domain/project";
import type { ContentSuggestion, ContentTask } from "@/features/content/types";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/misc";
import { apiFetch } from "@/lib/api-client";

/**
 * Assistente de conteúdo. Usa o provedor configurado no servidor; hoje é o
 * gerador de regras locais (sem IA) e a interface deixa isso explícito.
 */
export function ContentAssistant({
  project,
  task,
  label,
  onApply,
}: {
  project: Project;
  task: ContentTask;
  label: string;
  onApply: (variant: Record<string, string>) => void;
}) {
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ suggestion: ContentSuggestion }>("/api/content/generate", {
        method: "POST",
        json: { task, business: project.business, style: project.style },
      });
      setSuggestion(result.suggestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar sugestões.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-line-strong p-3">
      <Button size="sm" variant="ghost" onClick={generate} disabled={busy} icon={<Wand2 className="size-3.5" aria-hidden />}>
        {busy ? "Gerando…" : label}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {suggestion && (
        <div className="mt-3 space-y-2">
          <Notice className="text-xs">
            <strong className="text-fg">{suggestion.provider.label}.</strong> {suggestion.notice}
          </Notice>
          {suggestion.variants.length === 0 && <p className="text-xs text-fg-subtle">Sem sugestões para os dados atuais.</p>}
          <ul className="space-y-2">
            {suggestion.variants.map((v, i) => (
              <li key={i} className="rounded-md border border-line bg-ink-900 p-2.5 text-xs">
                {Object.entries(v).map(([k, value]) => (
                  <p key={k} className="text-fg-muted">
                    <span className="text-fg-subtle">{k}:</span> {value}
                  </p>
                ))}
                <Button size="sm" className="mt-2" onClick={() => onApply(v)}>
                  Aplicar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
