"use client";

import type { ComponentType } from "react";
import type { Section, SectionOf, SectionType } from "@/domain/sections";
import { AboutSection } from "./sections/about-section";
import { CatalogSection } from "./sections/catalog-section";
import { ContactSection } from "./sections/contact-section";
import { CtaSection } from "./sections/cta-section";
import { EditorialSection } from "./sections/editorial-section";
import { FaqSection } from "./sections/faq-section";
import { GallerySection } from "./sections/gallery-section";
import { HeroSection } from "./sections/hero-section";
import { MarqueeSection } from "./sections/marquee-section";
import { SceneStorySection } from "./sections/scene-story-section";
import { ServicesSection } from "./sections/services-section";
import { StepsSection } from "./sections/steps-section";

/** Mapa tipo de seção → componente. Novos tipos: registrar aqui. */
export const SECTION_COMPONENTS: { [T in SectionType]: ComponentType<{ section: SectionOf<T> }> } = {
  hero: HeroSection,
  sceneStory: SceneStorySection,
  services: ServicesSection,
  catalog: CatalogSection,
  gallery: GallerySection,
  editorial: EditorialSection,
  about: AboutSection,
  steps: StepsSection,
  marquee: MarqueeSection,
  cta: CtaSection,
  faq: FaqSection,
  contact: ContactSection,
};

export function RenderSection({ section }: { section: Section }) {
  const Component = SECTION_COMPONENTS[section.type] as ComponentType<{ section: Section }>;
  return <Component section={section} />;
}
