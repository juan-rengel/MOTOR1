import { createTemplateDemo } from "@/features/templates/create-project";
import { TEMPLATES } from "@/features/templates/registry";
import { checkProject } from "./project-checks";

const label = (s: { type: string }) => s.type;

describe("checkProject", () => {
  it("avisa sobre conteúdo demonstrativo e botões de WhatsApp sem número", () => {
    const project = createTemplateDemo(TEMPLATES[0]!);
    const issues = checkProject(project, label);
    expect(issues.some((i) => i.id === "demo")).toBe(true);
    expect(issues.some((i) => i.message.includes("WhatsApp do negócio não configurado"))).toBe(true);
  });

  it("some com os avisos de WhatsApp quando o número é válido", () => {
    const project = createTemplateDemo(TEMPLATES[0]!);
    project.business.whatsapp = "(11) 91234-5678";
    const issues = checkProject(project, label);
    expect(issues.some((i) => i.message.includes("WhatsApp do negócio"))).toBe(false);
  });

  it("aponta número inválido e contraste baixo", () => {
    const project = createTemplateDemo(TEMPLATES[0]!);
    project.business.whatsapp = "123";
    project.theme.colors.text = "#111111";
    project.theme.colors.background = "#151515";
    const issues = checkProject(project, label);
    expect(issues.some((i) => i.id === "wa-invalid")).toBe(true);
    expect(issues.some((i) => i.id.startsWith("contrast-texto sobre o fundo"))).toBe(true);
  });

  it("todos os estilos visuais padrão passam no contraste principal", async () => {
    const { VISUAL_STYLE_LIST } = await import("@/config/styles");
    for (const style of VISUAL_STYLE_LIST) {
      const project = createTemplateDemo(TEMPLATES[0]!, style.id);
      const issues = checkProject(project, label).filter((i) => i.id.startsWith("contrast"));
      expect(issues, `${style.id}: ${issues.map((i) => i.message).join("; ")}`).toEqual([]);
    }
  });
});
