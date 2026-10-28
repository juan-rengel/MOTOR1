import { createProjectFromTemplate } from "@/features/templates/create-project";
import { getTemplate } from "@/features/templates/registry";
import { projectSchema } from "@/domain/project";

describe("modelo Coleção Editorial", () => {
  const template = getTemplate("fashion-editorial")!;

  it("usa a cena de tênis para lojas de tênis", () => {
    const project = createProjectFromTemplate({ templateId: template.id, style: "tech", business: { ...template.demoBusiness, segment: "sneakers" } }, { ownerId: "local" });
    expect(project.scene.sceneId).toBe("sneaker");
    const catalog = project.sections.find((s) => s.type === "catalog");
    expect(catalog?.type === "catalog" && catalog.props.items[0]?.image.src).toContain("sneaker-");
  });

  it("usa a cena de tecido para lojas de roupas", () => {
    const project = createProjectFromTemplate({ templateId: template.id, style: "vibrant", business: template.demoBusiness }, { ownerId: "local" });
    expect(project.scene.sceneId).toBe("silk-flow");
  });
});

describe("compatibilidade de projetos gravados", () => {
  it("aceita projeto salvo antes do campo scene.variant (preenche padrão)", () => {
    const template = getTemplate("mechanic-cinematic")!;
    const project = createProjectFromTemplate({ templateId: template.id, style: "cinematic", business: template.demoBusiness }, { ownerId: "local" });
    const legacy = JSON.parse(JSON.stringify(project));
    delete legacy.scene.variant;
    const parsed = projectSchema.safeParse(legacy);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.scene.variant).toBe("");
  });
});

describe("ótica", () => {
  it("usa a vitrine de óculos e itens 'Sob consulta' (sem preços inventados)", () => {
    const template = getTemplate("optics-atelier")!;
    const project = createProjectFromTemplate({ templateId: template.id, style: "elegant", business: template.demoBusiness }, { ownerId: "local" });
    expect(project.scene.sceneId).toBe("eyewear");
    const catalog = project.sections.find((s) => s.type === "catalog");
    expect(catalog?.type === "catalog" && catalog.props.items.every((i) => i.price === "Sob consulta")).toBe(true);
  });
});
