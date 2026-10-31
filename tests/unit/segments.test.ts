import { GOAL_LABELS, getSegment, SEGMENTS } from "@/config/segments";
import { VISUAL_STYLE_IDS } from "@/domain/theme";
import { SITE_ICON_IDS } from "@/domain/icons";
import { SEGMENT_IDS, segmentIdSchema } from "@/domain/business";
import { migrateProject } from "@/domain/migrations";
import { projectSchema } from "@/domain/project";
import { createProjectFromTemplate, createTemplateDemo } from "@/features/templates/create-project";
import { getTemplate, templatesForSegment, TEMPLATES } from "@/features/templates/registry";

/** Os 12 segmentos que existiam antes da Etapa 1C.1, na posição original. */
const OLD_IDS = ["mechanic", "law", "dental", "optics", "fashion", "sneakers", "furniture", "gym", "beauty", "restaurant", "services", "other"];

/** Ordem de exibição: os seis prioritários do MOTOR1 (ordem oficial) e depois os demais. */
const DISPLAY_ORDER = ["mechanic", "barbershop", "beauty", "fashion", "sneakers", "variety", "law", "dental", "optics", "furniture", "gym", "restaurant", "services", "other"];

describe("segmentos", () => {
  it("são 14: os 12 antigos na mesma posição e os novos no fim", () => {
    expect(SEGMENT_IDS).toHaveLength(14);
    expect(SEGMENT_IDS.slice(0, 12)).toEqual(OLD_IDS);
    expect(SEGMENT_IDS.slice(12)).toEqual(["barbershop", "variety"]);
  });

  it("cada id tem exatamente uma configuração", () => {
    expect([...SEGMENTS.map((s) => s.id)].sort()).toEqual([...SEGMENT_IDS].sort());
    for (const id of SEGMENT_IDS) expect(getSegment(id).id).toBe(id);
  });

  it("aparecem na ordem oficial: os seis prioritários primeiro", () => {
    expect(SEGMENTS.map((s) => s.id)).toEqual(DISPLAY_ORDER);
    expect(SEGMENTS.slice(0, 6).map((s) => s.label)).toEqual(["Oficina mecânica", "Barbearia", "Beleza", "Loja de roupas", "Loja de calçados", "Loja de variedades"]);
  });

  it("toda configuração é válida (ícones, estilos, objetivo, sugestões sem números)", () => {
    for (const s of SEGMENTS) {
      expect(SITE_ICON_IDS).toContain(s.icon);
      expect(SITE_ICON_IDS).toContain(s.offeringIcon);
      expect(s.suggestedStyles.length).toBeGreaterThan(0);
      for (const style of s.suggestedStyles) expect(VISUAL_STYLE_IDS).toContain(style);
      expect(Object.keys(GOAL_LABELS)).toContain(s.defaultGoal);
      expect(s.label.trim()).not.toBe("");
      for (const hint of s.offeringHints) expect(hint).not.toMatch(/\d/);
    }
  });

  it("Barbearia (nova)", () => {
    expect(getSegment("barbershop")).toMatchObject({
      label: "Barbearia",
      description: "Cortes, barba e cuidados masculinos.",
      icon: "scissors",
      offeringHints: ["Corte degradê", "Corte clássico", "Barba", "Sobrancelha", "Pigmentação"],
      defaultGoal: "booking",
      suggestedStyles: ["luxury", "cinematic", "industrial"],
      offeringIcon: "scissors",
    });
  });

  it("Beleza (antes 'Barbearia e salão'): unhas, cílios, sobrancelhas e cabelo", () => {
    const beauty = getSegment("beauty");
    expect(beauty).toMatchObject({
      label: "Beleza",
      description: "Unhas, cílios, sobrancelhas e cabelo.",
      icon: "sparkles",
      offeringHints: ["Unhas", "Cílios", "Sobrancelhas", "Cabelo"],
      defaultGoal: "booking",
      suggestedStyles: ["elegant", "minimal", "luxury"],
      offeringIcon: "sparkles",
    });
    expect(JSON.stringify(beauty).toLowerCase()).not.toMatch(/barb/);
  });

  it("Loja de calçados (antes 'Loja de tênis'): mesmo id, ícone e estilos", () => {
    expect(getSegment("sneakers")).toMatchObject({
      label: "Loja de calçados",
      description: "Tênis, sapatos, sandálias e calçados infantis.",
      icon: "footprints",
      offeringHints: ["Tênis", "Sapatos sociais", "Sandálias", "Botas", "Infantil"],
      defaultGoal: "catalog",
      suggestedStyles: ["vibrant", "tech", "cinematic"],
      offeringIcon: "footprints",
    });
  });

  it("Loja de variedades (nova)", () => {
    expect(getSegment("variety")).toMatchObject({
      label: "Loja de variedades",
      description: "Relógios, garrafas térmicas, utilidades e presentes.",
      icon: "package",
      offeringHints: ["Relógios", "Garrafas térmicas", "Utilidades", "Presentes", "Acessórios"],
      defaultGoal: "catalog",
      suggestedStyles: ["vibrant", "modern", "minimal"],
      offeringIcon: "package",
    });
  });
});

describe("modelos oferecidos aos segmentos novos e alterados", () => {
  it("Barbearia e Variedades só recebem o Essencial; o servidor recusa modelos dedicados", () => {
    for (const segment of ["barbershop", "variety"] as const) {
      const { recommended, others } = templatesForSegment(segment);
      expect(recommended.map((t) => t.id)).toEqual(["universal-essential"]);
      expect(others).toEqual([]);
      for (const template of TEMPLATES.filter((t) => t.kind !== "universal")) {
        expect(() =>
          createProjectFromTemplate({ templateId: template.id, style: template.defaultStyle, business: { ...template.demoBusiness, segment } }, { ownerId: "local" }),
        ).toThrow(/não foi feito para o segmento/);
      }
    }
  });

  it("Calçados continua com a Coleção Editorial; Beleza continua com o Essencial", () => {
    expect(templatesForSegment("sneakers").recommended.map((t) => t.id)).toEqual(["fashion-editorial"]);
    expect(templatesForSegment("beauty").recommended.map((t) => t.id)).toEqual(["universal-essential"]);
  });
});

describe("compatibilidade de projetos gravados antes da Etapa 1C.1", () => {
  // Projeto como gravado em disco (JSON), sem passar pelo código novo de criação.
  const saved = (templateId: string, segment: string) => {
    const project = JSON.parse(JSON.stringify(createTemplateDemo(getTemplate(templateId)!)));
    return { ...project, business: { ...project.business, segment } };
  };

  it.each(OLD_IDS)("projeto com o segmento antigo %s abre sem migração", (segment) => {
    const project = saved("universal-essential", segment);
    const migrated = migrateProject(project);
    expect(migrated).toBe(project);
    expect(projectSchema.safeParse(migrated).success).toBe(true);
  });

  it("'beauty' e 'sneakers' gravados continuam válidos (ids mantidos)", () => {
    expect(segmentIdSchema.safeParse("beauty").success).toBe(true);
    expect(segmentIdSchema.safeParse("sneakers").success).toBe(true);
    expect(projectSchema.safeParse(saved("fashion-editorial", "sneakers")).success).toBe(true);
    expect(projectSchema.safeParse(saved("universal-essential", "beauty")).success).toBe(true);
  });

  it("segmento desconhecido continua sendo recusado", () => {
    expect(segmentIdSchema.safeParse("barbearia").success).toBe(false);
    expect(projectSchema.safeParse(saved("universal-essential", "nao-existe")).success).toBe(false);
  });
});
