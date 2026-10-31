"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { ImageRef } from "@/domain/primitives";
import { cn } from "@/lib/cn";

/**
 * Só as imagens de demonstração passam pelo otimizador do Next (tamanhos e WebP sob
 * medida). Uploads e URLs externas continuam servidos como estão — ver `images` em
 * next.config.ts (uploads serão reavaliados na Fase 9).
 */
const OPTIMIZED_PREFIX = "/assets/demo/";

/** Ignora query string e hash, que o otimizador recusa (localPatterns com search ""). */
const isOptimizable = (src: string) => src.startsWith(OPTIMIZED_PREFIX) && !/[?#]/.test(src);

/**
 * Imagem dos sites com proporção reservada (evita saltos de layout),
 * carregamento sob demanda e substituto visual quando a imagem falta ou falha.
 */
export function SiteImage({
  image,
  className,
  imgClassName,
  ratio,
  priority = false,
  sizes,
}: {
  image: ImageRef;
  className?: string;
  imgClassName?: string;
  /** Proporção CSS (ex.: "4/5"). Sem proporção, o contêiner define o tamanho. */
  ratio?: string;
  /** Imagem principal (capa): carrega imediatamente e com prioridade alta. */
  priority?: boolean;
  /** Largura ocupada na tela, para o navegador escolher o tamanho certo (padrão: tela inteira). */
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const missing = !image.src || failed;
  // Só aplica "relative" quando quem usa não definiu outro posicionamento (evita conflito com "absolute").
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className ?? "");
  const imgProps = {
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : undefined,
    decoding: "async" as const,
    onError: () => setFailed(true),
    className: cn("absolute inset-0 size-full object-cover", imgClassName),
    "data-reveal-media": true,
  };
  return (
    <div className={cn(!positioned && "relative", "overflow-hidden bg-site-surface", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      {missing ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-site-muted"
          style={{ background: "radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--site-primary) 22%, transparent), transparent 60%), var(--site-surface)" }}
          role={image.alt ? "img" : undefined}
          aria-label={image.alt || undefined}
        >
          <ImageOff className="size-6 opacity-50" aria-hidden />
          <span className="text-[11px] tracking-widest uppercase opacity-60">{failed ? "Imagem indisponível" : "Sem imagem"}</span>
        </div>
      ) : isOptimizable(image.src) ? (
        <Image {...imgProps} src={image.src} alt={image.alt} fill sizes={sizes ?? "100vw"} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- upload local ou URL externa definida pelo usuário (fora do otimizador)
        <img {...imgProps} src={image.src} alt={image.alt} sizes={sizes} />
      )}
    </div>
  );
}
