"use client";

import { useEffect, useState } from "react";
import { Box, Film, Trash2 } from "lucide-react";
import { ASSET_KIND_LABELS, type AssetKind, type AssetRecord } from "@/domain/assets";
import { Badge, EmptyState, Notice, Panel, Skeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { assetsApi } from "./api";
import { UploadForm } from "./upload-form";

function formatSize(bytes: number) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function AssetLibrary() {
  const toast = useToast();
  const [assets, setAssets] = useState<AssetRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AssetKind | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<AssetRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    assetsApi
      .list()
      .then((list) => !cancelled && setAssets(list))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const kinds = Array.from(new Set((assets ?? []).map((a) => a.kind)));
  const visible = (assets ?? []).filter((a) => filter === "all" || a.kind === filter);

  async function remove() {
    if (!pendingDelete) return;
    try {
      await assetsApi.remove(pendingDelete.id);
      setAssets((list) => (list ?? []).filter((a) => a.id !== pendingDelete.id));
      toast("Recurso excluído.", "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Falha ao excluir.", "danger");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {(["all", ...kinds] as Array<AssetKind | "all">).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={cn("rounded-md border px-3 py-1.5 text-xs", filter === k ? "border-cyan-glow bg-cyan-glow/10 text-cyan-soft" : "border-line text-fg-muted hover:text-fg")}
            >
              {k === "all" ? "Todos" : ASSET_KIND_LABELS[k]}
            </button>
          ))}
        </div>
        {error && <Notice tone="danger">{error}</Notice>}
        {assets === null && !error && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Carregando recursos">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-[4/3]" />
            ))}
          </div>
        )}
        {assets !== null && visible.length === 0 && <EmptyState title="Nenhum recurso nesta categoria" description="Envie um arquivo pelo formulário ao lado." />}
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {visible.map((a) => (
            <li key={a.id} className="overflow-hidden rounded-xl border border-line bg-ink-900">
              <div className="flex aspect-[4/3] items-center justify-center bg-ink-800 text-fg-subtle">
                {a.kind === "video" ? (
                  <Film className="size-6" aria-hidden />
                ) : a.kind === "model" ? (
                  <Box className="size-6" aria-hidden />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura de recurso local
                  <img src={a.src} alt={a.alt} className="size-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <p className="truncate text-sm font-medium" title={a.name}>
                  {a.name}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={a.source === "demo" ? "neutral" : "cyan"}>{a.source === "demo" ? "Demonstrativo" : "Enviado"}</Badge>
                  <Badge>{ASSET_KIND_LABELS[a.kind]}</Badge>
                  {a.size > 0 && <Badge>{formatSize(a.size)}</Badge>}
                </div>
                {a.license && (
                  <p className="line-clamp-2 text-[11px] text-fg-subtle" title={a.license}>
                    Licença: {a.license}
                  </p>
                )}
                {a.source === "upload" && (
                  <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => setPendingDelete(a)} icon={<Trash2 className="size-3.5" aria-hidden />}>
                    Excluir
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Panel className="h-fit p-5">
        <h2 className="mb-4 font-display font-semibold">Enviar arquivo</h2>
        <UploadForm
          onUploaded={(asset) => {
            setAssets((list) => [asset, ...(list ?? [])]);
            toast(`“${asset.name}” enviado.`, "ok");
          }}
        />
        <Notice className="mt-5 text-xs" title="Segurança">
          Aceitamos apenas PNG, JPG, WEBP, AVIF, MP4, WEBM e GLB, conferidos pelo conteúdo do arquivo. SVG e outros formatos
          executáveis são recusados. Os arquivos ficam em <code>.data/uploads</code> nesta máquina.
        </Notice>
      </Panel>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir recurso?"
        description="Sites que usam este arquivo passarão a mostrar o substituto de imagem indisponível."
        confirmLabel="Excluir"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
