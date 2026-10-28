import { z } from "zod";
import { getSegment } from "@/config/segments";
import { VISUAL_STYLES } from "@/config/styles";
import { businessSchema } from "@/domain/business";
import { validationError } from "@/domain/errors";
import type { MotionSettings } from "@/domain/motion";
import { PROJECT_SCHEMA_VERSION, projectSchema, type Project } from "@/domain/project";
import { visualStyleIdSchema, type SiteTheme, type VisualStyleId } from "@/domain/theme";
import { getCopyPack } from "@/features/content/copy-packs";
import { slugify, uuid } from "@/lib/ids";
import { getTemplate } from "./registry";
import type { TemplateDefinition, ThemeTweak } from "./types";

export const createProjectInputSchema = z.object({
  templateId: z.string().min(1).max(40),
  style: visualStyleIdSchema,
  business: businessSchema,
});
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

function applyTweak(theme: SiteTheme, tweak: ThemeTweak | undefined): SiteTheme {
  if (!tweak) return theme;
  return {
    ...theme,
    ...tweak,
    colors: { ...theme.colors, ...tweak.colors },
    fonts: { ...theme.fonts, ...tweak.fonts },
  };
}

export function buildTheme(template: TemplateDefinition, style: VisualStyleId): SiteTheme {
  const base = structuredClone(VISUAL_STYLES[style].theme);
  return applyTweak(applyTweak(base, template.themeTweaks?.all), template.themeTweaks?.[style]);
}

export function buildMotion(style: VisualStyleId): MotionSettings {
  const level = VISUAL_STYLES[style].motionLevel;
  return {
    level,
    textReveal: level !== "subtle",
    imageReveal: true,
    parallax: level === "cinematic" || level === "balanced",
    sectionTransitions: true,
  };
}

/** Cria um projeto completo e válido a partir de um modelo e dos dados do negócio. */
export function createProjectFromTemplate(
  input: CreateProjectInput,
  options: { ownerId: string; now?: Date; id?: string },
): Project {
  const template = getTemplate(input.templateId);
  if (!template) throw validationError("Modelo não encontrado.");

  const business = businessSchema.parse(input.business);
  const ctx = {
    business,
    style: input.style,
    segment: getSegment(business.segment),
    copy: getCopyPack(business.segment),
  };
  const timestamp = (options.now ?? new Date()).toISOString();
  const subtitle = ctx.copy.heroSubtitle(business);

  return projectSchema.parse({
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: options.id ?? uuid(),
    ownerId: options.ownerId,
    revision: 0,
    templateId: template.id,
    style: input.style,
    business,
    brand: { logo: { src: "", alt: "" }, showNameWithLogo: true },
    theme: buildTheme(template, input.style),
    motion: buildMotion(input.style),
    scene: template.scene(ctx),
    sections: template.buildSections(ctx),
    seo: {
      title: `${business.name}${business.city ? ` — ${business.city}` : ""}`.slice(0, 70),
      description: subtitle.slice(0, 170),
    },
    publishing: { status: "draft", slug: slugify(business.name), customDomain: "", lastPublishedAt: "" },
    flags: { demoContent: true },
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

/** Projeto de demonstração do modelo (negócio fictício), usado nas páginas /demo. */
export function createTemplateDemo(template: TemplateDefinition, style?: VisualStyleId): Project {
  return createProjectFromTemplate(
    { templateId: template.id, style: style ?? template.defaultStyle, business: template.demoBusiness },
    { ownerId: "demo", now: new Date("2026-01-01T00:00:00.000Z"), id: "00000000-0000-4000-8000-000000000000" },
  );
}
