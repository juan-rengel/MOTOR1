"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { ImageReveal } from "@/features/animations/image-reveal";
import { SectionHeading } from "../primitives/heading";
import { SiteImage } from "../primitives/site-image";

type GalleryItem = SectionOf<"gallery">["props"]["images"][number];

/** Visualizador ampliado acessível (diálogo nativo, setas do teclado, Esc). */
function Lightbox({ items, index, onClose, onIndex }: { items: GalleryItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const item = index !== null ? items[index] : undefined;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal?.();
    if (index === null && dialog.open) dialog.close?.();
  }, [index]);

  const step = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  return (
    <dialog
      ref={ref}
      aria-label="Imagem ampliada"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
    >
      {item && (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 md:p-10" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <figure className="relative flex max-h-[80dvh] w-full max-w-6xl flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem definida pelo usuário */}
            <img src={item.image.src} alt={item.image.alt} className="max-h-[75dvh] w-auto max-w-full rounded object-contain" />
            {item.caption && <figcaption className="mt-4 text-center text-sm text-white/80">{item.caption}</figcaption>}
          </figure>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => step(-1)} className="flex size-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10" aria-label="Imagem anterior">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <span className="min-w-16 text-center font-mono text-xs text-white/70">
              {(index ?? 0) + 1} / {items.length}
            </span>
            <button type="button" onClick={() => step(1)} className="flex size-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10" aria-label="Próxima imagem">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
          <button type="button" onClick={onClose} autoFocus className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10" aria-label="Fechar">
            <X className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </dialog>
  );
}

const MOSAIC_SPANS = ["md:col-span-4 md:row-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3"];

export function GallerySection({ section }: { section: SectionOf<"gallery"> }) {
  const p = section.props;
  const [open, setOpen] = useState<number | null>(null);
  const images = p.images.filter((i) => i.image.src);

  return (
    <section className="site-section">
      <div className="site-container">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        {images.length === 0 ? (
          <p className="rounded-[var(--site-radius-lg)] border border-dashed border-site-border p-10 text-center text-sm text-site-muted">
            Nenhuma imagem na galeria.
          </p>
        ) : (
          <ul
            className={cn(
              p.layout === "grid" && "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
              p.layout === "mosaic" && "grid auto-rows-[220px] gap-4 sm:grid-cols-2 md:auto-rows-[240px] md:grid-cols-6",
              p.layout === "strip" && "scrollbar-thin -mx-[clamp(1.25rem,4vw,2.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,2.5rem)] pb-4",
            )}
          >
            {images.map((item, i) => (
              <li
                key={item.id}
                className={cn(
                  p.layout === "mosaic" && (MOSAIC_SPANS[i % MOSAIC_SPANS.length] ?? ""),
                  p.layout === "strip" && "w-[78vw] shrink-0 snap-start sm:w-[420px]",
                  p.layout === "grid" && "aspect-[4/3]",
                  p.layout === "strip" && "aspect-[4/5]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block size-full overflow-hidden rounded-[var(--site-radius-lg)] text-left"
                  aria-label={`Ampliar imagem: ${item.image.alt || item.caption || `imagem ${i + 1}`}`}
                >
                  <ImageReveal className="size-full" direction={i % 2 ? "left" : "up"}>
                    <SiteImage image={item.image} className="size-full" imgClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
                  </ImageReveal>
                  {item.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12 text-sm font-medium text-white">
                      {item.caption}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Lightbox items={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
