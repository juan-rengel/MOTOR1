"use client";

import "./site-fonts";
import "./site.css";
import { useEffect, type MouseEvent } from "react";
import type { Project } from "@/domain/project";
import { MotionProvider } from "@/features/animations/motion-context";
import { ScrollTrigger, ensureGsap } from "@/features/animations/gsap";
import { cn } from "@/lib/cn";
import { FloatingWhatsApp } from "./chrome/floating-whatsapp";
import { SiteFooter } from "./chrome/site-footer";
import { SiteHeader } from "./chrome/site-header";
import { RenderSection } from "./section-registry";
import { SiteProvider, type RenderMode } from "./site-context";
import { themeToCssVars } from "./theme-vars";

interface SiteRendererProps {
  project: Project;
  mode: RenderMode;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  /** Desliga animações (prévia "sem movimento" no editor). */
  motionDisabled?: boolean;
}

/**
 * Renderiza um site completo a partir do projeto. É o mesmo componente usado
 * no editor (iframe), na pré-visualização e nas demonstrações — o que você vê
 * no editor é o que o visitante verá.
 */
export function SiteRenderer({ project, mode, selectedSectionId, onSelectSection, motionDisabled }: SiteRendererProps) {
  const sections = project.sections.filter((s) => !s.hidden);

  // Recalcula gatilhos de rolagem quando a estrutura muda (seções adicionadas, reordenadas...).
  const structureKey = sections.map((s) => s.id).join("|");
  useEffect(() => {
    ensureGsap();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [structureKey]);

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (mode !== "editor") return;
    const target = event.target as HTMLElement;
    const sectionEl = target.closest<HTMLElement>("[data-section-id]");
    if (sectionEl?.dataset.sectionId) onSelectSection?.(sectionEl.dataset.sectionId);
    // No editor, links não navegam (exceto âncoras internas) para não sair da prévia.
    const link = target.closest("a");
    if (link && !link.getAttribute("href")?.startsWith("#")) event.preventDefault();
  }

  return (
    <SiteProvider project={project} mode={mode}>
      <MotionProvider settings={project.motion} forceDisabled={motionDisabled}>
        <div
          id="top"
          className={cn("site-root min-h-screen", project.theme.grain && "site-grain")}
          style={themeToCssVars(project.theme)}
          data-editor-mode={mode === "editor" || undefined}
          onClickCapture={onClickCapture}
        >
          <a href="#conteudo" className="sr-only z-[80] rounded bg-site-primary px-4 py-2 text-site-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Pular para o conteúdo
          </a>
          <SiteHeader />
          <main id="conteudo">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.anchor}
                data-section-id={section.id}
                data-section-type={section.type}
                data-selected={selectedSectionId === section.id || undefined}
                className="scroll-mt-20"
              >
                <RenderSection section={section} />
              </div>
            ))}
          </main>
          <SiteFooter />
          <FloatingWhatsApp />
        </div>
      </MotionProvider>
    </SiteProvider>
  );
}
