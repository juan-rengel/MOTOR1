import { z } from "zod";
import { businessSchema } from "./business";
import { motionSchema } from "./motion";
import { imageRefSchema, slugSchema, uuidSchema } from "./primitives";
import { sceneSchema } from "./scene";
import { sectionSchema } from "./sections";
import { themeSchema, visualStyleIdSchema } from "./theme";

export const PROJECT_SCHEMA_VERSION = 1 as const;

/** Domínio no formato exemplo.com.br (sem protocolo). Vazio = nenhum. */
const hostnameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .refine(
    (v) => v === "" || /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,63}$/.test(v),
    "Domínio inválido. Exemplo: minhaempresa.com.br",
  );

export const publishingSchema = z.object({
  /**
   * draft: só existe localmente. "published" só poderá ser atribuído por um
   * provedor de publicação real (ainda não implementado).
   */
  status: z.enum(["draft", "published"]),
  slug: slugSchema,
  customDomain: hostnameSchema,
  lastPublishedAt: z.string().max(40),
});
export type PublishingSettings = z.infer<typeof publishingSchema>;

export const projectSchema = z
  .object({
    schemaVersion: z.literal(PROJECT_SCHEMA_VERSION),
    id: uuidSchema,
    /** Proprietário. Hoje sempre "local"; com autenticação será o id do usuário. */
    ownerId: z.string().min(1).max(128),
    /** Incrementado a cada gravação; usado para detectar edições concorrentes. */
    revision: z.number().int().nonnegative(),
    templateId: z.string().min(1).max(40),
    style: visualStyleIdSchema,
    business: businessSchema,
    brand: z.object({ logo: imageRefSchema, showNameWithLogo: z.boolean() }),
    theme: themeSchema,
    motion: motionSchema,
    scene: sceneSchema,
    sections: z.array(sectionSchema).max(30),
    seo: z.object({ title: z.string().max(70), description: z.string().max(170) }),
    publishing: publishingSchema,
    flags: z.object({
      /** Verdadeiro enquanto o projeto contém conteúdo demonstrativo do modelo. */
      demoContent: z.boolean(),
    }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((project, ctx) => {
    const seenIds = new Set<string>();
    const seenAnchors = new Set<string>();
    project.sections.forEach((section, index) => {
      if (seenIds.has(section.id)) {
        ctx.addIssue({ code: "custom", message: "Seção duplicada.", path: ["sections", index, "id"] });
      }
      if (seenAnchors.has(section.anchor)) {
        ctx.addIssue({
          code: "custom",
          message: `A âncora "${section.anchor}" já está em uso por outra seção.`,
          path: ["sections", index, "anchor"],
        });
      }
      seenIds.add(section.id);
      seenAnchors.add(section.anchor);
    });
  });

export type Project = z.infer<typeof projectSchema>;

/** Resumo exibido na lista de projetos. */
export interface ProjectSummary {
  id: string;
  name: string;
  segment: Project["business"]["segment"];
  templateId: string;
  style: Project["style"];
  status: Project["publishing"]["status"];
  primaryColor: string;
  backgroundColor: string;
  updatedAt: string;
  createdAt: string;
}

export function toProjectSummary(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.business.name,
    segment: project.business.segment,
    templateId: project.templateId,
    style: project.style,
    status: project.publishing.status,
    primaryColor: project.theme.colors.primary,
    backgroundColor: project.theme.colors.background,
    updatedAt: project.updatedAt,
    createdAt: project.createdAt,
  };
}
