"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, X } from "lucide-react";
import type { AssetKind, AssetRecord } from "@/domain/assets";
import { isSafeMediaSrc } from "@/domain/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, Notice, Spinner } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { assetsApi } from "./api";
import { UploadForm } from "./upload-form";

type PickerKind = "image" | "video" | "model";

const KIND_FILTER: Record<PickerKind, AssetKind[]> = {
  image: ["image", "logo", "texture"],
  video: ["video"],
  model: ["model"],
};

/** Escolha de mídia: biblioteca (demonstrativos + enviados), envio novo ou URL https. */
export function AssetPickerDialog({
  open,
  kind,
  onClose,
  onPick,
}: {
  open: boolean;
  kind: PickerKind;
  onClose: () => void;
  onPick: (asset: { src: string; alt: string }) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"library" | "upload" | "url">("library");
  const [assets, setAssets] = useState<AssetRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    assetsApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setAssets(list);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const visible = (assets ?? []).filter((a) => KIND_FILTER[kind].includes(a.kind));
  const urlValid = url.trim() !== "" && isSafeMediaSrc(url.trim());

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="picker-title"
      className="m-auto max-h-[86vh] w-[min(94vw,880px)] overflow-hidden rounded-xl border border-line-strong bg-ink-850 p-0 text-fg shadow-2xl backdrop:bg-black/70"
    >
      {open && (
        <div className="flex max-h-[86vh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="picker-title" className="font-display font-semibold">
              {kind === "image" ? "Escolher imagem" : kind === "video" ? "Escolher vídeo" : "Escolher modelo 3D"}
            </h2>
            <button type="button" onClick={onClose} className="rounded p-1 text-fg-muted hover:bg-ink-700 hover:text-fg" aria-label="Fechar">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="flex gap-1 border-b border-line px-5 pt-3" role="tablist">
            {(["library", "upload", "url"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("rounded-t-md px-3 py-2 text-sm", tab === t ? "bg-ink-700 text-fg" : "text-fg-muted hover:text-fg")}
              >
                {t === "library" ? "Biblioteca" : t === "upload" ? "Enviar arquivo" : "Endereço (URL)"}
              </button>
            ))}
          </div>
          <div className="scrollbar-thin overflow-y-auto p-5">
            {tab === "library" &&
              (error ? (
                <Notice tone="danger">{error}</Notice>
              ) : assets === null ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : visible.length === 0 ? (
                <EmptyState title="Nada aqui ainda" description="Envie um arquivo na aba “Enviar arquivo”." />
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {visible.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => onPick({ src: a.src, alt: a.alt })}
                        className="group block w-full overflow-hidden rounded-lg border border-line text-left transition-colors hover:border-cyan-glow"
                      >
                        <div className="aspect-[4/3] bg-ink-800">
                          {a.kind === "video" ? (
                            <video src={a.src} muted className="size-full object-cover" preload="metadata" />
                          ) : a.kind === "model" ? (
                            <div className="flex size-full items-center justify-center text-xs text-fg-subtle">GLB</div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- miniatura de recurso local
                            <img src={a.src} alt="" className="size-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <p className="truncate px-2 py-1.5 text-xs text-fg-muted group-hover:text-fg">{a.name}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            {tab === "upload" && (
              <UploadForm
                defaultKind={kind}
                onUploaded={(asset) => {
                  setAssets((list) => [asset, ...(list ?? [])]);
                  onPick({ src: asset.src, alt: asset.alt });
                }}
              />
            )}
            {tab === "url" && (
              <div className="space-y-3">
                <Notice>
                  Use apenas endereços <strong>https</strong> de arquivos que você tem direito de usar. Arquivos externos podem
                  sair do ar — prefira enviar à biblioteca.
                </Notice>
                <div className="flex gap-2">
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." aria-label="Endereço do arquivo" />
                  <Button variant="primary" disabled={!urlValid} onClick={() => onPick({ src: url.trim(), alt: "" })} icon={<Link2 className="size-4" aria-hidden />}>
                    Usar
                  </Button>
                </div>
                {url.trim() !== "" && !urlValid && <p className="text-xs text-danger">Endereço não permitido. Use https://</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
