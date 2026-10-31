import type { BusinessGoal, SegmentId } from "@/domain/business";
import type { SiteIconId } from "@/domain/icons";
import type { VisualStyleId } from "@/domain/theme";

export interface SegmentDefinition {
  id: SegmentId;
  label: string;
  description: string;
  icon: SiteIconId;
  /** Sugestões exibidas no formulário (o usuário decide se usa). */
  offeringHints: string[];
  defaultGoal: BusinessGoal;
  suggestedStyles: VisualStyleId[];
  /** Ícone padrão para serviços/produtos informados pelo usuário. */
  offeringIcon: SiteIconId;
}

/**
 * Ordem de exibição (assistente, página de modelos): primeiro os seis segmentos
 * prioritários do MOTOR1, na ordem oficial — Mecânica, Barbearia, Beleza, Roupas,
 * Calçados, Variedades —, depois os demais.
 */
export const SEGMENTS: readonly SegmentDefinition[] = [
  {
    id: "mechanic",
    label: "Oficina mecânica",
    description: "Manutenção, revisão, funilaria e serviços automotivos.",
    icon: "wrench",
    offeringHints: ["Revisão completa", "Freios", "Suspensão", "Injeção eletrônica", "Troca de óleo", "Ar-condicionado"],
    defaultGoal: "quote",
    suggestedStyles: ["cinematic", "industrial", "tech"],
    offeringIcon: "wrench",
  },
  {
    id: "barbershop",
    label: "Barbearia",
    description: "Cortes, barba e cuidados masculinos.",
    icon: "scissors",
    offeringHints: ["Corte degradê", "Corte clássico", "Barba", "Sobrancelha", "Pigmentação"],
    defaultGoal: "booking",
    suggestedStyles: ["luxury", "cinematic", "industrial"],
    offeringIcon: "scissors",
  },
  {
    id: "beauty",
    label: "Beleza",
    description: "Unhas, cílios, sobrancelhas e cabelo.",
    icon: "sparkles",
    offeringHints: ["Unhas", "Cílios", "Sobrancelhas", "Cabelo"],
    defaultGoal: "booking",
    suggestedStyles: ["elegant", "minimal", "luxury"],
    offeringIcon: "sparkles",
  },
  {
    id: "fashion",
    label: "Loja de roupas",
    description: "Moda feminina, masculina, infantil e acessórios.",
    icon: "shirt",
    offeringHints: ["Nova coleção", "Vestidos", "Jeans", "Alfaiataria", "Acessórios"],
    defaultGoal: "catalog",
    suggestedStyles: ["vibrant", "modern", "luxury"],
    offeringIcon: "shirt",
  },
  {
    id: "sneakers",
    label: "Loja de calçados",
    description: "Tênis, sapatos, sandálias e calçados infantis.",
    icon: "footprints",
    offeringHints: ["Tênis", "Sapatos sociais", "Sandálias", "Botas", "Infantil"],
    defaultGoal: "catalog",
    suggestedStyles: ["vibrant", "tech", "cinematic"],
    offeringIcon: "footprints",
  },
  {
    id: "variety",
    label: "Loja de variedades",
    description: "Relógios, garrafas térmicas, utilidades e presentes.",
    icon: "package",
    offeringHints: ["Relógios", "Garrafas térmicas", "Utilidades", "Presentes", "Acessórios"],
    defaultGoal: "catalog",
    suggestedStyles: ["vibrant", "modern", "minimal"],
    offeringIcon: "package",
  },
  {
    id: "law",
    label: "Advocacia",
    description: "Escritórios jurídicos e advogados autônomos.",
    icon: "scale",
    offeringHints: ["Direito trabalhista", "Direito de família", "Direito empresarial", "Direito do consumidor"],
    defaultGoal: "contact",
    suggestedStyles: ["elegant", "minimal", "luxury"],
    offeringIcon: "scale",
  },
  {
    id: "dental",
    label: "Clínica odontológica",
    description: "Clínicas e consultórios odontológicos.",
    icon: "stethoscope",
    offeringHints: ["Avaliação", "Limpeza", "Clareamento", "Ortodontia", "Implantes"],
    defaultGoal: "booking",
    suggestedStyles: ["minimal", "modern", "elegant"],
    offeringIcon: "sparkles",
  },
  {
    id: "optics",
    label: "Ótica",
    description: "Armações, lentes, óculos de sol e exames de vista.",
    icon: "glasses",
    offeringHints: ["Armações de grau", "Óculos de sol", "Lentes multifocais", "Lentes de contato", "Ajustes e consertos"],
    defaultGoal: "catalog",
    suggestedStyles: ["luxury", "elegant", "minimal"],
    offeringIcon: "glasses",
  },
  {
    id: "furniture",
    label: "Loja de móveis",
    description: "Móveis, decoração e projetos de ambientes.",
    icon: "sofa",
    offeringHints: ["Sala de estar", "Quartos", "Cozinha planejada", "Escritório", "Decoração"],
    defaultGoal: "catalog",
    suggestedStyles: ["elegant", "minimal", "luxury"],
    offeringIcon: "sofa",
  },
  {
    id: "gym",
    label: "Academia",
    description: "Academias, estúdios e treinamento.",
    icon: "dumbbell",
    offeringHints: ["Musculação", "Funcional", "Spinning", "Pilates", "Avaliação física"],
    defaultGoal: "booking",
    suggestedStyles: ["vibrant", "industrial", "cinematic"],
    offeringIcon: "dumbbell",
  },
  {
    id: "restaurant",
    label: "Restaurante",
    description: "Restaurantes, cafés, bares e delivery.",
    icon: "utensils",
    offeringHints: ["Almoço executivo", "Jantar", "Delivery", "Eventos", "Cardápio do dia"],
    defaultGoal: "whatsapp",
    suggestedStyles: ["elegant", "vibrant", "cinematic"],
    offeringIcon: "utensils",
  },
  {
    id: "services",
    label: "Prestador de serviços",
    description: "Profissionais e empresas de serviços em geral.",
    icon: "hammer",
    offeringHints: ["Orçamento", "Instalação", "Manutenção", "Consultoria"],
    defaultGoal: "quote",
    suggestedStyles: ["modern", "minimal", "tech"],
    offeringIcon: "check",
  },
  {
    id: "other",
    label: "Outro pequeno negócio",
    description: "Qualquer negócio local que precise de presença digital.",
    icon: "sparkles",
    offeringHints: [],
    defaultGoal: "whatsapp",
    suggestedStyles: ["modern", "minimal", "cinematic"],
    offeringIcon: "check",
  },
] as const;

export function getSegment(id: SegmentId): SegmentDefinition {
  const segment = SEGMENTS.find((s) => s.id === id);
  if (!segment) throw new Error(`Segmento desconhecido: ${id}`);
  return segment;
}

export const GOAL_LABELS: Record<BusinessGoal, string> = {
  whatsapp: "Receber mensagens no WhatsApp",
  quote: "Receber pedidos de orçamento",
  booking: "Agendar atendimentos",
  catalog: "Apresentar produtos / catálogo",
  contact: "Receber contatos",
  awareness: "Apresentar a marca",
};
