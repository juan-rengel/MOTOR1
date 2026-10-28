/**
 * Configuração central da plataforma.
 * Altere o nome do produto aqui — ele é lido por toda a interface.
 */
export const platformConfig = {
  name: "Cinematic Web Studio",
  shortName: "CWS",
  tagline: "Sites comerciais com linguagem de cinema.",
  description:
    "Plataforma para criar sites comerciais cinematográficos com 3D, animações e modelos especializados por segmento.",
  engine: "Motor 1 — Construtor de sites",
  version: "0.1.0",
  locale: "pt-BR",
} as const;

export type PlatformConfig = typeof platformConfig;
