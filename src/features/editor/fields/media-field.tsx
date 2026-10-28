"use client";

import { useState } from "react";
import { ImagePlus, Trash2, Film } from "lucide-react";
import type { ImageRef, VideoRef } from "@/domain/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { AssetPickerDialog } from "@/features/assets/asset-picker-dialog";

export function ImageField({ label, value, onChange }: { label: string; value: ImageRef; onChange: (next: ImageRef, key?: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-ink-800 text-fg-subtle transition-colors hover:border-cyan-glow"
          aria-label={value.src ? `Trocar ${label.toLowerCase()}` : `Escolher ${label.toLowerCase()}`}
        >
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura no editor
            <img src={value.src} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" aria-hidden />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value.alt}
            maxLength={240}
            onChange={(e) => onChange({ ...value, alt: e.target.value }, "alt")}
            placeholder="Texto alternativo (descrição da imagem)"
            aria-label={`${label}: texto alternativo`}
            className="h-9 text-xs"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)}>
              {value.src ? "Trocar" : "Escolher"}
            </Button>
            {value.src && (
              <Button size="sm" variant="ghost" onClick={() => onChange({ src: "", alt: "" })} icon={<Trash2 className="size-3.5" aria-hidden />}>
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>
      <AssetPickerDialog
        open={open}
        kind="image"
        onClose={() => setOpen(false)}
        onPick={(asset) => {
          onChange({ src: asset.src, alt: asset.alt || value.alt });
          setOpen(false);
        }}
      />
    </div>
  );
}

export function VideoField({ label, value, onChange }: { label: string; value: VideoRef; onChange: (next: VideoRef) => void }) {
  const [picker, setPicker] = useState<null | "video" | "poster">(null);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setPicker("video")} icon={<Film className="size-3.5" aria-hidden />}>
          {value.src ? "Trocar vídeo" : "Escolher vídeo"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setPicker("poster")}>
          {value.poster ? "Trocar imagem de capa" : "Imagem de capa"}
        </Button>
        {value.src && (
          <Button size="sm" variant="ghost" onClick={() => onChange({ src: "", poster: "" })}>
            Remover
          </Button>
        )}
      </div>
      {value.src && <p className="truncate font-mono text-[11px] text-fg-subtle">{value.src}</p>}
      <p className="text-[11px] text-fg-subtle">O vídeo toca sem som, em loop, e pausa para quem prefere menos movimento.</p>
      <AssetPickerDialog
        open={picker !== null}
        kind={picker === "poster" ? "image" : "video"}
        onClose={() => setPicker(null)}
        onPick={(asset) => {
          onChange(picker === "poster" ? { ...value, poster: asset.src } : { ...value, src: asset.src });
          setPicker(null);
        }}
      />
    </div>
  );
}
