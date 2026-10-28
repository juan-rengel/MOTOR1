"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, PencilRuler, Sparkles, Trash2 } from "lucide-react";
import type { ProjectSummary } from "@/domain/project";
import { formatDateTime, segmentLabel, styleLabel } from "@/config/labels";
import { Badge, EmptyState, Notice } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { projectsApi } from "./api";

export function ProjectGrid({ projects, storageScope }: { projects: ProjectSummary[]; storageScope: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<ProjectSummary | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await projectsApi.remove(pendingDelete.id);
      toast(`Projeto "${pendingDelete.name}" excluído.`, "ok");
      setPendingDelete(null);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Falha ao excluir.", "danger");
    } finally {
      setBusy(false);
    }
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="size-8" aria-hidden />}
        title="Nenhum projeto ainda"
        description="Crie seu primeiro site: informe os dados do negócio, escolha o estilo e um modelo cinematográfico."
        action={
          <ButtonLink href="/studio/new" variant="primary">
            Criar novo site
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Projetos">
        {projects.map((p) => (
          <li
            key={p.id}
            className="group relative overflow-hidden rounded-xl border border-line bg-ink-900 transition-colors duration-200 hover:border-cyan-glow/40"
          >
            <div
              className="relative h-28 overflow-hidden"
              style={{ background: `radial-gradient(120% 140% at 15% 0%, ${p.primaryColor}55, ${p.backgroundColor} 60%)` }}
              aria-hidden
            >
              <div className="absolute inset-x-5 bottom-4 flex items-end justify-between">
                <span className="font-display text-xl font-semibold text-white/90 drop-shadow">{p.name}</span>
                <span className="size-6 rounded-full border border-white/20" style={{ background: p.primaryColor }} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5">
                <Badge>{segmentLabel(p.segment)}</Badge>
                <Badge>{styleLabel(p.style)}</Badge>
                <Badge tone={p.status === "published" ? "ok" : "warn"}>
                  {p.status === "published" ? "Publicado" : "Rascunho local"}
                </Badge>
              </div>
              <h2 className="mt-3 font-display text-base font-semibold text-fg">
                <Link href={`/studio/projects/${p.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                  {p.name}
                </Link>
              </h2>
              <p className="mt-1 text-xs text-fg-subtle">Atualizado em {formatDateTime(p.updatedAt)}</p>
              <div className="relative z-10 mt-4 flex gap-2">
                <ButtonLink href={`/studio/projects/${p.id}`} size="sm" variant="secondary" icon={<PencilRuler className="size-3.5" aria-hidden />}>
                  Editar
                </ButtonLink>
                <ButtonLink href={`/preview/${p.id}`} size="sm" variant="ghost" target="_blank" icon={<Eye className="size-3.5" aria-hidden />}>
                  Visualizar
                </ButtonLink>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto hover:text-danger"
                  aria-label={`Excluir ${p.name}`}
                  onClick={() => setPendingDelete(p)}
                  icon={<Trash2 className="size-3.5" aria-hidden />}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Notice className="mt-8" title="Onde os projetos ficam salvos">
        {storageScope}
      </Notice>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir projeto?"
        description={
          <>
            O projeto <strong className="text-fg">{pendingDelete?.name}</strong> será removido desta instalação. Esta ação não
            pode ser desfeita.
          </>
        }
        confirmLabel="Excluir projeto"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
