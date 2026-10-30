import { SEGMENTS } from "@/config/segments";
import { VISUAL_STYLE_LIST } from "@/config/styles";
import { emptySocialLinks, SEGMENT_IDS, type BusinessInfo, type SegmentId } from "@/domain/business";
import { projectSchema, type Project } from "@/domain/project";
import { getCopyPack } from "@/features/content/copy-packs";
import { checkProject } from "@/features/editor/project-checks";
import { createProjectFromTemplate, createTemplateDemo } from "@/features/templates/create-project";
import { getTemplate, isTemplateCompatible, templatesForSegment, TEMPLATES } from "@/features/templates/registry";

const essential = getTemplate("universal-essential")!;

function business(segment: SegmentId, overrides: Partial<BusinessInfo> = {}): BusinessInfo {
  return {
    name: "Negócio Teste",
    segment,
    city: "",
    description: "",
    offerings: [],
    audience: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "",
    social: emptySocialLinks(),
    goal: "whatsapp",
    ...overrides,
  };
}

const create = (segment: SegmentId, overrides: Partial<BusinessInfo> = {}, style = essential.defaultStyle) =>
  createProjectFromTemplate({ templateId: essential.id, style, business: business(segment, overrides) }, { ownerId: "local" });

/** Todos os textos das seções (sem ids e sem valores numéricos de configuração), em minúsculas. */
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

/** Termos que pertencem a um segmento específico e não podem aparecer em outro. */
const FOREIGN_TERMS: Array<{ segments: SegmentId[]; terms: string[] }> = [
  { segments: ["mechanic"], terms: ["oficina", "carro", "veículo", "motor"] },
  { segments: ["optics"], terms: ["ótica", "armaç", "lentes"] },
  { segments: ["fashion", "sneakers"], terms: ["coleção", "tênis", "numeração", "lookbook"] },
];

describe("modelo Essencial (universal)", () => {
  it("é universal e aceito em todos os segmentos", () => {
    expect(essential.kind).toBe("universal");
    for (const segment of SEGMENT_IDS) expect(isTemplateCompatible(essential, segment)).toBe(true);
  });

  it.each(SEGMENT_IDS.flatMap((segment) => VISUAL_STYLE_LIST.map((style) => [segment, style.id] as const)))(
    "gera projeto válido para %s no estilo %s, com contraste aprovado",
    (segment, style) => {
      const project = create(segment, {}, style);
      expect(projectSchema.safeParse(project).success).toBe(true);
      const contrast = checkProject(project, (s) => s.type).filter((i) => i.id.startsWith("contrast"));
      expect(contrast, contrast.map((i) => i.message).join("; ")).toEqual([]);
    },
  );

  it.each(SEGMENT_IDS)("não contém textos de outros segmentos (%s)", (segment) => {
    const text = sectionText(create(segment));
    for (const group of FOREIGN_TERMS) {
      if (group.segments.includes(segment)) continue;
      for (const term of group.terms) expect(text, `"${term}" em ${segment}`).not.toContain(term);
    }
  });

  it("não usa cena 3D, imagens nem contatos que o usuário não informou", () => {
    for (const segment of SEGMENT_IDS) {
      const project = create(segment);
      expect(project.scene.enabled).toBe(false);
      expect(project.sections.some((s) => s.type === "sceneStory")).toBe(false);
      const sources = [...JSON.stringify(project.sections).matchAll(/"src":"([^"]*)"/g)].map((m) => m[1]);
      expect(sources.every((src) => src === "")).toBe(true);
      expect(project.business.whatsapp).toBe("");
      expect(project.business.phone).toBe("");
      expect(project.business.email).toBe("");
      expect(project.business.address).toBe("");
    }
  });

  it("usa os textos do segmento escolhido", () => {
    const project = create("law");
    const hero = project.sections.find((s) => s.type === "hero");
    expect(hero?.type === "hero" && hero.props.title).toBe(getCopyPack("law").heroTitles[0]);
    expect(hero?.type === "hero" && hero.props.eyebrow).toBe("Advocacia");
  });

  it("serviços: usa os informados; senão as sugestões do segmento; senão itens provisórios", () => {
    const titles = (p: Project) => {
      const services = p.sections.find((s) => s.type === "services");
      return services?.type === "services" ? services.props.items.map((i) => i.title) : [];
    };
    expect(titles(create("restaurant", { offerings: ["Almoço", "Jantar"] }))).toEqual(["Almoço", "Jantar"]);
    expect(titles(create("dental"))).toEqual(SEGMENTS.find((s) => s.id === "dental")!.offeringHints);
    expect(titles(create("other"))).toEqual(["Seu primeiro serviço", "Seu segundo serviço", "Seu terceiro serviço"]);
  });

  it("marca o conteúdo como demonstrativo", () => {
    expect(createTemplateDemo(essential).flags.demoContent).toBe(true);
  });

  it("não inventa números, avaliações, preços ou superlativos", () => {
    for (const segment of SEGMENT_IDS) {
      const text = sectionText(create(segment));
      expect(text).not.toMatch(/\d/);
      // Só o superlativo ("o melhor", "a melhor"): o pacote da ótica (já existente) usa "Pareça ainda melhor", que não é afirmação de mercado.
      expect(text).not.toMatch(/r\$|avalia[çc][ãa]o de clientes|depoimento|estrelas|(^|[^a-zà-ú])(o|a|os|as) melhor|nº ?1|número 1|certificad|premiad/);
    }
  });
});

describe("compatibilidade entre modelo e segmento", () => {
  it("oferece só modelos dedicados ao segmento e o Essencial", () => {
    const ids = (segment: SegmentId) => {
      const { recommended, others } = templatesForSegment(segment);
      return { recommended: recommended.map((t) => t.id), others: others.map((t) => t.id) };
    };
    expect(ids("mechanic")).toEqual({ recommended: ["mechanic-cinematic"], others: ["universal-essential"] });
    expect(ids("sneakers")).toEqual({ recommended: ["fashion-editorial"], others: ["universal-essential"] });
    expect(ids("law")).toEqual({ recommended: ["universal-essential"], others: [] });
  });

  it("todo segmento tem ao menos um modelo oferecido", () => {
    for (const segment of SEGMENT_IDS) expect(templatesForSegment(segment).recommended.length).toBeGreaterThan(0);
  });

  it("o servidor recusa modelo dedicado em outro segmento", () => {
    for (const template of TEMPLATES.filter((t) => t.kind !== "universal")) {
      for (const segment of SEGMENT_IDS.filter((s) => !template.segments.includes(s))) {
        expect(() =>
          createProjectFromTemplate({ templateId: template.id, style: template.defaultStyle, business: business(segment) }, { ownerId: "local" }),
        ).toThrow(/não foi feito para o segmento/);
      }
    }
  });
});

describe("pacotes de texto novos", () => {
  it.each(["beauty", "restaurant", "furniture", "services"] as const)("%s tem pacote próprio, sem números nem contatos", (segment) => {
    const pack = getCopyPack(segment);
    expect(pack).not.toBe(getCopyPack("other"));
    const b = business(segment);
    const text = [...pack.heroTitles, pack.heroSubtitle(b), pack.offeringDescription("Item", b), pack.aboutText(b), pack.whatsappMessage(b)].join(" ").toLowerCase();
    expect(text).not.toMatch(/\d|r\$|melhor|nº ?1|premiad|certificad|@|https?:/);
  });
});
