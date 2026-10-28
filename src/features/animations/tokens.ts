import type { MotionLevel } from "@/domain/motion";

/**
 * Padrões de movimento compartilhados por todos os sites.
 * Durações em segundos (GSAP). A distância é o deslocamento inicial dos
 * elementos que entram em cena.
 */
export const DURATION = { fast: 0.35, base: 0.7, slow: 1.1, cinematic: 1.5 } as const;

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
  soft: "sine.out",
} as const;

export const STAGGER = { tight: 0.04, base: 0.08, loose: 0.14 } as const;

export interface LevelProfile {
  distance: number;
  duration: number;
  stagger: number;
  /** Multiplicador do parallax (0 = desligado). */
  parallax: number;
  /** Escala inicial das imagens reveladas. */
  imageScale: number;
}

export const LEVEL_PROFILES: Record<MotionLevel, LevelProfile> = {
  none: { distance: 0, duration: 0, stagger: 0, parallax: 0, imageScale: 1 },
  subtle: { distance: 14, duration: DURATION.base, stagger: STAGGER.tight, parallax: 0.04, imageScale: 1.04 },
  balanced: { distance: 28, duration: DURATION.slow * 0.85, stagger: STAGGER.base, parallax: 0.08, imageScale: 1.1 },
  cinematic: { distance: 44, duration: DURATION.slow, stagger: STAGGER.base, parallax: 0.14, imageScale: 1.18 },
};

/** Gatilho padrão: anima quando o topo do elemento cruza 85% da altura da janela. */
export const REVEAL_START = "top 85%";

/**
 * Toca a animação uma vez ao entrar e não reverte.
 * Preferido a `once: true`: gatilhos com `once` se removem durante
 * ScrollTrigger.refresh() quando a página abre já rolada (ex.: link com #âncora),
 * o que quebra a atualização dos demais gatilhos.
 */
export const PLAY_ONCE = "play none none none";
