import { z } from "zod";
import { ctaSchema } from "./cta";
import { siteIconIdSchema } from "./icons";
import { imageRefSchema, shortIdSchema, slugSchema, text, videoRefSchema } from "./primitives";

/**
 * Seções conhecidas pelo renderizador.
 * Cada seção tem uma base comum (id, âncora, rótulo de menu, visibilidade) e
 * propriedades tipadas próprias. Novas seções: adicionar o schema aqui, o
 * componente em features/site-renderer/sections e a definição de edição em
 * features/editor/section-definitions.
 */
const base = {
  id: shortIdSchema,
  anchor: slugSchema,
  navLabel: text(30),
  hidden: z.boolean(),
};

const listItemId = { id: shortIdSchema };

export const heroSectionSchema = z.object({
  ...base,
  type: z.literal("hero"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    mediaKind: z.enum(["gradient", "image", "video"]),
    image: imageRefSchema,
    video: videoRefSchema,
    align: z.enum(["left", "center"]),
    overlay: z.number().min(0).max(0.9),
  }),
});

export const sceneStorySectionSchema = z.object({
  ...base,
  type: z.literal("sceneStory"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    chapters: z
      .array(z.object({ ...listItemId, kicker: text(40), title: text(80), text: text(300) }))
      .max(6),
  }),
});

export const servicesSectionSchema = z.object({
  ...base,
  type: z.literal("services"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    layout: z.enum(["grid", "list"]),
    items: z
      .array(
        z.object({
          ...listItemId,
          icon: siteIconIdSchema,
          title: text(80),
          description: text(300),
          note: text(60),
        }),
      )
      .max(12),
  }),
});

export const catalogSectionSchema = z.object({
  ...base,
  type: z.literal("catalog"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    showFilters: z.boolean(),
    orderLabel: text(40),
    /** Mensagem enviada ao WhatsApp. {produto} é substituído pelo nome do item. */
    orderMessage: text(200),
    items: z
      .array(
        z.object({
          ...listItemId,
          name: text(80),
          description: text(240),
          price: text(40),
          category: text(40),
          badge: text(30),
          image: imageRefSchema,
        }),
      )
      .max(24),
  }),
});

export const gallerySectionSchema = z.object({
  ...base,
  type: z.literal("gallery"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    layout: z.enum(["grid", "mosaic", "strip"]),
    images: z
      .array(z.object({ ...listItemId, image: imageRefSchema, caption: text(120) }))
      .max(16),
  }),
});

export const editorialSectionSchema = z.object({
  ...base,
  type: z.literal("editorial"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    items: z
      .array(
        z.object({ ...listItemId, kicker: text(40), title: text(100), text: text(500), image: imageRefSchema }),
      )
      .max(6),
  }),
});

export const aboutSectionSchema = z.object({
  ...base,
  type: z.literal("about"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    text: text(1200),
    image: imageRefSchema,
    highlights: z.array(z.object({ ...listItemId, text: text(80) })).max(6),
  }),
});

export const stepsSectionSchema = z.object({
  ...base,
  type: z.literal("steps"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    items: z.array(z.object({ ...listItemId, title: text(80), text: text(300) })).max(8),
  }),
});

export const marqueeSectionSchema = z.object({
  ...base,
  type: z.literal("marquee"),
  props: z.object({
    items: z.array(z.object({ ...listItemId, text: text(40) })).max(12),
    speed: z.enum(["slow", "normal", "fast"]),
  }),
});

export const ctaSectionSchema = z.object({
  ...base,
  type: z.literal("cta"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    background: z.enum(["primary", "surface", "image"]),
    image: imageRefSchema,
  }),
});

export const faqSectionSchema = z.object({
  ...base,
  type: z.literal("faq"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    items: z
      .array(z.object({ ...listItemId, question: text(160), answer: text(800) }))
      .max(12),
  }),
});

export const contactSectionSchema = z.object({
  ...base,
  type: z.literal("contact"),
  props: z.object({
    eyebrow: text(60),
    title: text(140),
    subtitle: text(400),
    showForm: z.boolean(),
    formIntro: text(200),
    showHours: z.boolean(),
    showAddress: z.boolean(),
    showSocial: z.boolean(),
  }),
});

export const sectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  sceneStorySectionSchema,
  servicesSectionSchema,
  catalogSectionSchema,
  gallerySectionSchema,
  editorialSectionSchema,
  aboutSectionSchema,
  stepsSectionSchema,
  marqueeSectionSchema,
  ctaSectionSchema,
  faqSectionSchema,
  contactSectionSchema,
]);

export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>;
export type SectionProps<T extends SectionType> = SectionOf<T>["props"];

export const SECTION_TYPES = sectionSchema.options.map((o) => o.shape.type.value) as SectionType[];
