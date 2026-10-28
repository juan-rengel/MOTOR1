import type { Project } from "@/domain/project";
import type { Section } from "@/domain/sections";
import { resolveCta } from "@/lib/cta";
import { contrastRatio } from "@/lib/color";
import { normalizePhone } from "@/lib/phone";
import { SCENES } from "@/features/scenes3d/registry";

export interface ProjectIssue {
  id: string;
  level: "error" | "warning" | "info";
  message: string;
  /** Seção relacionada (para o editor selecionar ao clicar). */
  sectionId?: string;
  /** Aba do editor onde se corrige. */
  tab: "sections" | "business" | "brand" | "scene" | "settings";
}

function collectCtas(section: Section): Array<{ label: string; cta: { label: string; action: "whatsapp" | "section" | "link" | "phone" | "email"; target: string } }> {
  const props = section.props as Record<string, unknown>;
  const out: Array<{ label: string; cta: never }> = [];
  for (const [key, value] of Object.entries(props)) {
    if (value && typeof value === "object" && "action" in value && "label" in value) {
      out.push({ label: key === "primaryCta" ? "botão principal" : "botão secundário", cta: value as never });
    }
  }
  return out;
}

function collectImages(section: Section): Array<{ src: string; alt: string }> {
  const found: Array<{ src: string; alt: string }> = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const v = value as Record<string, unknown>;
      if (typeof v.src === "string" && typeof v.alt === "string") found.push({ src: v.src, alt: v.alt });
      else Object.values(v).forEach(walk);
    }
  };
  walk(section.props);
  return found;
}

/**
 * Verificações de qualidade antes de publicar. Não bloqueiam a edição;
 * ajudam a evitar botões quebrados, imagens sem descrição e pouco contraste.
 */
export function checkProject(project: Project, sectionLabel: (s: Section) => string): ProjectIssue[] {
  const issues: ProjectIssue[] = [];
  const { business, theme } = project;

  if (project.flags.demoContent) {
    issues.push({ id: "demo", level: "warning", tab: "settings", message: "O projeto ainda contém conteúdo demonstrativo. Revise textos e imagens e desmarque o aviso nas configurações." });
  }
  if (business.whatsapp && !normalizePhone(business.whatsapp).ok) {
    issues.push({ id: "wa-invalid", level: "error", tab: "business", message: "O número de WhatsApp informado é inválido." });
  }

  const anchors = new Set(project.sections.map((s) => s.anchor));
  for (const section of project.sections) {
    if (section.hidden) continue;
    for (const { label, cta } of collectCtas(section)) {
      const resolved = resolveCta(cta, business);
      if (resolved.status === "unavailable") {
        issues.push({ id: `cta-${section.id}-${label}`, level: "warning", tab: "sections", sectionId: section.id, message: `${sectionLabel(section)} — ${label} “${cta.label}”: ${resolved.reason}` });
      } else if (cta.action === "section" && !anchors.has(cta.target.replace(/^#/, ""))) {
        issues.push({ id: `cta-anchor-${section.id}-${label}`, level: "warning", tab: "sections", sectionId: section.id, message: `${sectionLabel(section)} — ${label} aponta para uma seção que não existe.` });
      }
    }
    const images = collectImages(section).filter((i) => i.src);
    const missingAlt = images.filter((i) => !i.alt.trim()).length;
    if (missingAlt > 0 && section.type !== "cta") {
      issues.push({ id: `alt-${section.id}`, level: "warning", tab: "sections", sectionId: section.id, message: `${sectionLabel(section)}: ${missingAlt} imagem(ns) sem texto alternativo.` });
    }
  }

  const pairs: Array<[string, string, string, number]> = [
    ["texto sobre o fundo", theme.colors.text, theme.colors.background, 4.5],
    ["texto secundário sobre o fundo", theme.colors.muted, theme.colors.background, 4.5],
    ["texto dos botões principais", theme.colors.onPrimary, theme.colors.primary, 4.5],
  ];
  for (const [label, fg, bg, min] of pairs) {
    const ratio = contrastRatio(fg, bg);
    if (ratio !== null && ratio < min) {
      issues.push({ id: `contrast-${label}`, level: "warning", tab: "brand", message: `Contraste baixo no ${label} (${ratio.toFixed(1)}:1; recomendado ${min}:1).` });
    }
  }

  const usesScene = project.sections.some((s) => s.type === "sceneStory" && !s.hidden);
  if (usesScene && project.scene.enabled && SCENES[project.scene.sceneId].requiresModel && !project.scene.modelSrc) {
    issues.push({ id: "scene-model", level: "error", tab: "scene", message: "A cena “Modelo próprio” precisa de um arquivo GLB." });
  }
  if (usesScene && !project.scene.fallbackImage.src) {
    issues.push({ id: "scene-fallback", level: "info", tab: "scene", message: "Defina uma imagem substituta para quem não puder ver o 3D." });
  }
  if (!project.seo.title.trim() || !project.seo.description.trim()) {
    issues.push({ id: "seo", level: "info", tab: "settings", message: "Preencha título e descrição para buscadores e compartilhamento." });
  }
  return issues;
}
