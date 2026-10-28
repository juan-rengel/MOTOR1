import { projectSchema } from "@/domain/project";
import { VISUAL_STYLE_IDS } from "@/domain/theme";
import { emptySocialLinks } from "@/domain/business";
import { createProjectFromTemplate, createTemplateDemo } from "./create-project";
import { TEMPLATES } from "./registry";

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

  it("rejeita modelo inexistente", () => {
    expect(() =>
      createProjectFromTemplate(
        { templateId: "nao-existe", style: "modern", business: TEMPLATES[0]!.demoBusiness },
        { ownerId: "local" },
      ),
    ).toThrow(/Modelo não encontrado/);
  });
});
