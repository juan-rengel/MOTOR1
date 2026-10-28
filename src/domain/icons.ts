import { z } from "zod";

/**
 * Ícones disponíveis para itens de serviços. A lista é fechada para manter
 * consistência visual e permitir validação; o mapeamento para componentes
 * fica em features/site-renderer/icons.tsx.
 */
export const SITE_ICON_IDS = [
  "wrench",
  "gauge",
  "cog",
  "car",
  "battery",
  "disc",
  "droplets",
  "wind",
  "zap",
  "shield",
  "clock",
  "calendar",
  "message",
  "glasses",
  "eye",
  "scan",
  "shirt",
  "footprints",
  "sparkles",
  "truck",
  "package",
  "ruler",
  "palette",
  "gem",
  "scissors",
  "dumbbell",
  "utensils",
  "scale",
  "stethoscope",
  "sofa",
  "hammer",
  "leaf",
  "map-pin",
  "credit-card",
  "heart",
  "check",
] as const;
export const siteIconIdSchema = z.enum(SITE_ICON_IDS);
export type SiteIconId = z.infer<typeof siteIconIdSchema>;
