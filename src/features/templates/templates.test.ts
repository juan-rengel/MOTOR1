import { createHash } from "node:crypto";
import { projectSchema } from "@/domain/project";
import { VISUAL_STYLE_IDS } from "@/domain/theme";
import { emptySocialLinks } from "@/domain/business";
import { createProjectFromTemplate, createTemplateDemo } from "./create-project";
import { TEMPLATES } from "./registry";

/** Remove os identificadores aleatórios (seções e itens de lista) para comparar o conteúdo gerado. */
function normalizeIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "id" ? "<id>" : normalizeIds(v)]));
  }
  return value;
}

const FIXED = { ownerId: "local", now: new Date("2026-01-01T00:00:00.000Z"), id: "00000000-0000-4000-8000-000000000000" };
const DEDICATED_IDS = ["mechanic-cinematic", "optics-atelier", "fashion-editorial"];

describe("modelos", () => {
  it.each(TEMPLATES.map((t) => [t.id, t] as const))("%s gera demonstração válida", (_id, template) => {
    const project = createTemplateDemo(template);
    expect(projectSchema.safeParse(project).success).toBe(true);
    expect(project.sections.length).toBeGreaterThan(3);
    expect(project.flags.demoContent).toBe(true);
  });

  it.each(TEMPLATES.flatMap((t) => VISUAL_STYLE_IDS.map((s) => [t.id, s] as const)))(
    "%s funciona com o estilo %s",
    (templateId, style) => {
      const template = TEMPLATES.find((t) => t.id === templateId)!;
      const project = createProjectFromTemplate(
        { templateId, style, business: template.demoBusiness },
        { ownerId: "local" },
      );
      expect(project.style).toBe(style);
      expect(projectSchema.safeParse(project).success).toBe(true);
    },
  );

  it("usa os serviços informados pelo usuário em vez dos demonstrativos", () => {
    const project = createProjectFromTemplate(
      {
        templateId: "mechanic-cinematic",
        style: "industrial",
        business: {
          name: "Auto Center Silva",
          segment: "mechanic",
          city: "Campinas",
          description: "",
          offerings: ["Freios", "Troca de óleo"],
          audience: "",
          phone: "",
          whatsapp: "(19) 99876-5432",
          email: "",
          address: "",
          hours: "",
          social: emptySocialLinks(),
          goal: "quote",
        },
      },
      { ownerId: "local" },
    );
    const services = project.sections.find((s) => s.type === "services");
    expect(services?.type === "services" && services.props.items.map((i) => i.title)).toEqual(["Freios", "Troca de óleo"]);
    expect(project.publishing.slug).toBe("auto-center-silva");
    expect(project.seo.title).toBe("Auto Center Silva — Campinas");
  });

  it("não inventa telefone: WhatsApp do projeto é exatamente o informado", () => {
    const template = TEMPLATES[0]!;
    const project = createTemplateDemo(template);
    expect(project.business.whatsapp).toBe("");
    expect(project.business.phone).toBe("");
  });

  it("modelos dedicados geram exatamente o mesmo conteúdo da referência gravada", async () => {
    // Referência gravada com o código anterior à Etapa 1A: qualquer mudança no que os
    // modelos de mecânica, ótica e moda geram (em qualquer estilo e segmento) quebra este teste.
    const hashes: Record<string, string> = {};
    for (const templateId of DEDICATED_IDS) {
      const template = TEMPLATES.find((t) => t.id === templateId)!;
      for (const segment of template.segments) {
        const business = { ...template.demoBusiness, segment };
        for (const style of VISUAL_STYLE_IDS) {
          const project = createProjectFromTemplate({ templateId, style, business }, FIXED);
          hashes[`${templateId} | ${segment} | ${style}`] = createHash("sha256").update(JSON.stringify(normalizeIds(project))).digest("hex");
        }
        const custom = createProjectFromTemplate(
          {
            templateId,
            style: template.defaultStyle,
            business: { ...business, name: "Negócio Referência", city: "Campinas", offerings: ["Primeiro item", "Segundo item"], whatsapp: "(19) 99876-5432", goal: "whatsapp" },
          },
          FIXED,
        );
        hashes[`${templateId} | ${segment} | dados do usuário`] = createHash("sha256").update(JSON.stringify(normalizeIds(custom))).digest("hex");
      }
    }
    await expect(JSON.stringify(hashes, null, 2) + "\n").toMatchFileSnapshot("./__snapshots__/dedicated-templates.reference.json");
  });

  it("rejeita modelo inexistente", () => {
    expect(() =>
      createProjectFromTemplate(
        { templateId: "nao-existe", style: "modern", business: TEMPLATES[0]!.demoBusiness },
        { ownerId: "local" },
      ),
    ).toThrow(/Modelo não encontrado/);
  });
});
