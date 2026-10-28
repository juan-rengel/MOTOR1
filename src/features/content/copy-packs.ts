import type { BusinessInfo, BusinessGoal, SegmentId } from "@/domain/business";

/**
 * Pacotes de texto por segmento usados pelo gerador de regras locais e pelos
 * modelos. Regras importantes:
 * - Nada de números, prêmios, certificações, avaliações ou depoimentos inventados.
 * - Textos são pontos de partida editáveis, escritos de forma genérica.
 */
export interface CopyPack {
  heroTitles: string[];
  heroSubtitle: (b: BusinessInfo) => string;
  offeringDescription: (offering: string, b: BusinessInfo) => string;
  aboutText: (b: BusinessInfo) => string;
  whatsappMessage: (b: BusinessInfo) => string;
}

const where = (b: BusinessInfo) => (b.city ? ` em ${b.city}` : "");

const GENERIC: CopyPack = {
  heroTitles: ["Atendimento próximo, resultado de verdade.", "Do primeiro contato à entrega, com cuidado.", "Seu próximo passo começa aqui."],
  heroSubtitle: (b) =>
    b.description ||
    `${b.name}${where(b)}. Conheça nossos serviços e fale com a gente para tirar dúvidas ou solicitar um orçamento.`,
  offeringDescription: (o) => `${o}: fale com a gente para entender como funciona e combinar os detalhes.`,
  aboutText: (b) =>
    b.description ||
    `${b.name} atende${where(b)} com foco em atendimento claro e transparente. Edite este texto para contar a história do seu negócio.`,
  whatsappMessage: (b) => `Olá, ${b.name}! Vim pelo site e gostaria de mais informações.`,
};

const PACKS: Partial<Record<SegmentId, CopyPack>> = {
  mechanic: {
    heroTitles: [
      "Precisão em cada detalhe do seu carro.",
      "Seu carro em mãos que entendem de motor.",
      "Diagnóstico claro. Serviço bem feito.",
    ],
    heroSubtitle: (b) =>
      b.description ||
      `Oficina mecânica${where(b)}. Diagnóstico explicado, orçamento antes do serviço e atenção a cada componente.`,
    offeringDescription: (o) => `${o} com avaliação prévia e orçamento explicado antes de qualquer intervenção.`,
    aboutText: (b) =>
      b.description ||
      `${b.name} é uma oficina${where(b)} que trabalha com transparência: você entende o diagnóstico, aprova o orçamento e acompanha o serviço. Edite este texto com a história real da oficina.`,
    whatsappMessage: (b) => `Olá, ${b.name}! Gostaria de solicitar um orçamento para o meu carro.`,
  },
  optics: {
    heroTitles: ["Enxergue bem. Pareça ainda melhor.", "A armação certa muda o olhar.", "Visão, estilo e ajuste sob medida."],
    heroSubtitle: (b) =>
      b.description ||
      `Ótica${where(b)} com armações, lentes e óculos de sol escolhidos com orientação personalizada.`,
    offeringDescription: (o) => `${o} com orientação na escolha e ajuste para o seu rosto.`,
    aboutText: (b) =>
      b.description ||
      `${b.name} ajuda você a escolher armações e lentes com calma e orientação. Edite este texto com a história real da ótica.`,
    whatsappMessage: (b) => `Olá, ${b.name}! Vi as armações no site e gostaria de mais informações.`,
  },
  fashion: {
    heroTitles: ["A nova coleção chegou.", "Peças que contam a sua história.", "Estilo para todos os dias."],
    heroSubtitle: (b) =>
      b.description || `Moda${where(b)} com peças selecionadas e atendimento direto pelo WhatsApp.`,
    offeringDescription: (o) => `${o} com peças selecionadas. Consulte tamanhos e disponibilidade.`,
    aboutText: (b) =>
      b.description ||
      `${b.name} seleciona cada peça pensando em conforto e estilo. Edite este texto com a história real da loja.`,
    whatsappMessage: (b) => `Olá, ${b.name}! Vi a coleção no site e gostaria de saber mais.`,
  },
  sneakers: {
    heroTitles: ["Cada passo, um statement.", "Lançamentos que movem a rua.", "Feito para andar. Pensado para chamar atenção."],
    heroSubtitle: (b) =>
      b.description || `Tênis e streetwear${where(b)}. Consulte numeração e disponibilidade direto pelo WhatsApp.`,
    offeringDescription: (o) => `${o}: consulte numerações e disponibilidade.`,
    aboutText: (b) =>
      b.description ||
      `${b.name} reúne modelos para o dia a dia e para quem vive a cultura sneaker. Edite este texto com a história real da loja.`,
    whatsappMessage: (b) => `Olá, ${b.name}! Quero consultar numeração e disponibilidade de um modelo.`,
  },
  dental: {
    heroTitles: ["Cuidado que aparece no seu sorriso.", "Tratamentos explicados com clareza.", "Seu sorriso em boas mãos."],
    heroSubtitle: (b) =>
      b.description || `Clínica odontológica${where(b)}. Agende sua avaliação e tire suas dúvidas com a equipe.`,
    offeringDescription: (o) => `${o}: indicação definida após avaliação com o profissional.`,
    aboutText: GENERIC.aboutText,
    whatsappMessage: (b) => `Olá, ${b.name}! Gostaria de agendar uma avaliação.`,
  },
  law: {
    heroTitles: ["Orientação jurídica com clareza.", "Seus direitos, tratados com seriedade.", "Atendimento jurídico próximo e objetivo."],
    heroSubtitle: (b) =>
      b.description || `Escritório de advocacia${where(b)}. Entre em contato para agendar uma conversa inicial.`,
    offeringDescription: (o) => `${o}: análise do caso e orientação sobre os caminhos possíveis.`,
    aboutText: GENERIC.aboutText,
    whatsappMessage: (b) => `Olá, ${b.name}! Gostaria de agendar uma conversa sobre meu caso.`,
  },
  gym: {
    heroTitles: ["Seu treino começa agora.", "Mais energia em cada treino.", "Movimento, constância e resultado."],
    heroSubtitle: (b) => b.description || `Academia${where(b)}. Conheça as modalidades e agende uma visita.`,
    offeringDescription: (o) => `${o}: consulte horários e planos disponíveis.`,
    aboutText: GENERIC.aboutText,
    whatsappMessage: (b) => `Olá, ${b.name}! Quero saber sobre planos e horários.`,
  },
};

export function getCopyPack(segment: SegmentId): CopyPack {
  return PACKS[segment] ?? GENERIC;
}

export const PRIMARY_CTA_BY_GOAL: Record<BusinessGoal, string> = {
  whatsapp: "Chamar no WhatsApp",
  quote: "Pedir orçamento",
  booking: "Agendar horário",
  catalog: "Ver catálogo",
  contact: "Fale conosco",
  awareness: "Conheça",
};
