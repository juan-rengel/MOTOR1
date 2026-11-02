import { createHash } from "node:crypto";
import { VISUAL_STYLE_LIST } from "@/config/styles";
import { SEGMENT_IDS } from "@/domain/business";
import { projectSchema, type Project } from "@/domain/project";
import { checkProject } from "@/features/editor/project-checks";
import { createProjectFromTemplate, createTemplateDemo } from "@/features/templates/create-project";
import { getTemplate, templatesForSegment, TEMPLATES } from "@/features/templates/registry";

const template = getTemplate("mechanic-real")!;
const FIXED = { ownerId: "local", now: new Date("2026-01-01T00:00:00.000Z"), id: "00000000-0000-4000-8000-000000000000" };

/** Todos os textos das seções (sem ids), em minúsculas. */
function sectionText(project: Project): string {
  const texts: string[] = [];
  const walk = (value: unknown, key = ""): void => {
    if (typeof value === "string") {
      if (key !== "id") texts.push(value);
    } else if (Array.isArray(value)) value.forEach((v) => walk(v));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk(project.sections);
  return texts.join(" | ").toLowerCase();
}

/** Remove os identificadores aleatórios (seções e itens de lista) para comparar o conteúdo gerado. */
const normalizeIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "id" ? "<id>" : normalizeIds(v)]));
  return value;
};

describe("modelo Oficina Real (mechanic-real)", () => {
  it("é dedicado à mecânica e fica no fim do registro", () => {
    expect(template.name).toBe("Oficina Real");
    expect(template.kind ?? "dedicated").toBe("dedicated");
    expect(template.segments).toEqual(["mechanic"]);
    expect(TEMPLATES.at(-1)?.id).toBe("mechanic-real");
  });

  it("a Garagem continua a primeira recomendada da mecânica", () => {
    const { recommended, others } = templatesForSegment("mechanic");
    expect(recommended.map((t) => t.id)).toEqual(["mechanic-cinematic", "mechanic-real"]);
    expect(others.map((t) => t.id)).toEqual(["universal-essential"]);
  });

  it("o servidor recusa o modelo em qualquer outro segmento", () => {
    for (const segment of SEGMENT_IDS.filter((s) => s !== "mechanic")) {
      expect(() =>
        createProjectFromTemplate({ templateId: template.id, style: template.defaultStyle, business: { ...template.demoBusiness, segment } }, { ownerId: "local" }),
      ).toThrow(/não foi feito para o segmento/);
    }
  });

  it.each(VISUAL_STYLE_LIST.map((s) => s.id))("projeto válido e com contraste aprovado no estilo %s", (style) => {
    const project = createProjectFromTemplate({ templateId: template.id, style, business: template.demoBusiness }, { ownerId: "local" });
    expect(projectSchema.safeParse(project).success).toBe(true);
    const contrast = checkProject(project, (s) => s.type).filter((i) => i.id.startsWith("contrast"));
    expect(contrast, contrast.map((i) => i.message).join("; ")).toEqual([]);
  });

  it("estrutura: só tipos de seção existentes, âncoras únicas e galeria oculta até ter fotos", () => {
    const project = createTemplateDemo(template);
    expect(project.sections.map((s) => [s.type, s.anchor, s.hidden])).toEqual([
      ["hero", "inicio", false],
      ["services", "servicos", false],
      ["about", "diferenciais", false],
      ["steps", "como-funciona", false],
      ["gallery", "estrutura", true],
      ["faq", "perguntas", false],
      ["cta", "chamada", false],
      ["contact", "contato", false],
    ]);
  });

  it("demonstração: conteúdo demonstrativo, contatos vazios, sem cena 3D e sem imagens", () => {
    const project = createTemplateDemo(template);
    expect(project.flags.demoContent).toBe(true);
    const { phone, whatsapp, email, address, hours } = project.business;
    expect([phone, whatsapp, email, address, hours]).toEqual(["", "", "", "", ""]);
    expect(project.scene.enabled).toBe(false);
    expect(project.sections.some((s) => s.type === "sceneStory")).toBe(false);
    const sources = [...JSON.stringify(project.sections).matchAll(/"src":"([^"]*)"/g)].map((m) => m[1]);
    expect(sources.every((src) => src === "")).toBe(true);
  });

  it("nada inventado e nenhum texto de outro segmento", () => {
    const text = sectionText(createTemplateDemo(template));
    expect(text).not.toMatch(/\d|r\$|(^|[^a-zà-ú])(o|a|os|as) melhor|depoimento|estrelas|garantia|certificad|premiad|nº ?1/);
    for (const term of ["ótica", "armaç", "lentes", "coleção", "tênis", "numeração", "barbearia", "unhas", "cílios"]) expect(text).not.toContain(term);
  });

  it("usa os serviços informados pelo usuário, com ícone pelo nome", () => {
    const project = createProjectFromTemplate(
      { templateId: template.id, style: "industrial", business: { ...template.demoBusiness, offerings: ["Freios", "Troca de óleo", "Funilaria"] } },
      { ownerId: "local" },
    );
    const services = project.sections.find((s) => s.type === "services");
    expect(services?.type === "services" && services.props.items.map((i) => [i.title, i.icon])).toEqual([
      ["Freios", "disc"],
      ["Troca de óleo", "droplets"],
      ["Funilaria", "palette"],
    ]);
  });

  it("gera exatamente o mesmo conteúdo da referência gravada (8 estilos e dados do usuário)", async () => {
    const hashes: Record<string, string> = {};
    for (const style of VISUAL_STYLE_LIST) {
      const project = createProjectFromTemplate({ templateId: template.id, style: style.id, business: template.demoBusiness }, FIXED);
      hashes[`mechanic-real | ${style.id}`] = createHash("sha256").update(JSON.stringify(normalizeIds(project))).digest("hex");
    }
    const custom = createProjectFromTemplate(
      {
        templateId: template.id,
        style: template.defaultStyle,
        business: { ...template.demoBusiness, name: "Negócio Referência", city: "Campinas", offerings: ["Primeiro item", "Segundo item"], whatsapp: "(19) 99876-5432", goal: "whatsapp" },
      },
      FIXED,
    );
    hashes["mechanic-real | dados do usuário"] = createHash("sha256").update(JSON.stringify(normalizeIds(custom))).digest("hex");
    await expect(JSON.stringify(hashes, null, 2) + "\n").toMatchFileSnapshot("../../src/features/templates/__snapshots__/mechanic-real.reference.json");
  });
});
