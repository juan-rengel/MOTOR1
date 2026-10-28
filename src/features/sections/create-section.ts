import type { SectionOf, SectionProps, SectionType } from "@/domain/sections";
import { shortId } from "@/lib/ids";

/** Adiciona ids a itens de lista. */
export function withIds<T extends object>(items: T[]): Array<T & { id: string }> {
  return items.map((item) => ({ ...item, id: shortId() }));
}

export const emptyImage = () => ({ src: "", alt: "" });

interface SectionBlueprint<T extends SectionType> {
  label: string;
  description: string;
  anchor: string;
  navLabel: string;
  props: () => SectionProps<T>;
}

/**
 * Valores padrão de cada tipo de seção (usados pelo editor ao adicionar uma
 * seção e pelos modelos como base). Textos padrão são genéricos e editáveis.
 */
export const SECTION_BLUEPRINTS: { [T in SectionType]: SectionBlueprint<T> } = {
  hero: {
    label: "Capa (hero)",
    description: "Abertura com título, texto, botões e imagem/vídeo de fundo.",
    anchor: "inicio",
    navLabel: "",
    props: () => ({
      eyebrow: "",
      title: "Seu título principal aqui",
      subtitle: "Uma frase curta explicando o que o negócio faz e para quem.",
      primaryCta: { label: "Fale conosco", action: "whatsapp", target: "Olá! Vim pelo site." },
      secondaryCta: { label: "", action: "section", target: "" },
      mediaKind: "gradient",
      image: emptyImage(),
      video: { src: "", poster: "" },
      align: "left",
      overlay: 0.5,
    }),
  },
  sceneStory: {
    label: "História 3D",
    description: "Abertura cinematográfica com cena 3D sincronizada à rolagem.",
    anchor: "inicio",
    navLabel: "",
    props: () => ({
      eyebrow: "",
      title: "Uma abertura cinematográfica",
      subtitle: "A cena 3D acompanha a rolagem enquanto os capítulos contam sua história.",
      primaryCta: { label: "Fale conosco", action: "whatsapp", target: "Olá! Vim pelo site." },
      secondaryCta: { label: "", action: "section", target: "" },
      chapters: withIds([
        { kicker: "01", title: "Primeiro capítulo", text: "Apresente um diferencial do seu negócio." },
        { kicker: "02", title: "Segundo capítulo", text: "Mostre como você trabalha." },
      ]),
    }),
  },
  services: {
    label: "Serviços",
    description: "Lista de serviços com ícone, descrição e observação.",
    anchor: "servicos",
    navLabel: "Serviços",
    props: () => ({
      eyebrow: "O que fazemos",
      title: "Serviços",
      subtitle: "",
      layout: "grid",
      items: withIds([
        { icon: "check", title: "Serviço 1", description: "Descreva o serviço.", note: "" },
        { icon: "check", title: "Serviço 2", description: "Descreva o serviço.", note: "" },
        { icon: "check", title: "Serviço 3", description: "Descreva o serviço.", note: "" },
      ]),
    }),
  },
  catalog: {
    label: "Catálogo de produtos",
    description: "Produtos com foto, preço, categoria e pedido pelo WhatsApp.",
    anchor: "catalogo",
    navLabel: "Catálogo",
    props: () => ({
      eyebrow: "Catálogo",
      title: "Produtos",
      subtitle: "",
      showFilters: true,
      orderLabel: "Pedir no WhatsApp",
      orderMessage: "Olá! Tenho interesse no produto: {produto}.",
      items: withIds([
        { name: "Produto 1", description: "", price: "", category: "", badge: "", image: emptyImage() },
        { name: "Produto 2", description: "", price: "", category: "", badge: "", image: emptyImage() },
      ]),
    }),
  },
  gallery: {
    label: "Galeria",
    description: "Imagens em grade, mosaico ou faixa horizontal.",
    anchor: "galeria",
    navLabel: "Galeria",
    props: () => ({ eyebrow: "", title: "Galeria", subtitle: "", layout: "mosaic", images: [] }),
  },
  editorial: {
    label: "Editorial",
    description: "Blocos de imagem e texto alternados, com revelação e parallax.",
    anchor: "destaques",
    navLabel: "Destaques",
    props: () => ({
      eyebrow: "",
      title: "Destaques",
      items: withIds([{ kicker: "", title: "Título do destaque", text: "Texto do destaque.", image: emptyImage() }]),
    }),
  },
  about: {
    label: "Sobre",
    description: "História do negócio com imagem e pontos de destaque.",
    anchor: "sobre",
    navLabel: "Sobre",
    props: () => ({
      eyebrow: "Sobre",
      title: "Nossa história",
      text: "Conte aqui a história do seu negócio.",
      image: emptyImage(),
      highlights: [],
    }),
  },
  steps: {
    label: "Como funciona",
    description: "Etapas numeradas do atendimento.",
    anchor: "como-funciona",
    navLabel: "Como funciona",
    props: () => ({
      eyebrow: "Passo a passo",
      title: "Como funciona",
      subtitle: "",
      items: withIds([
        { title: "Contato", text: "Fale com a gente pelo WhatsApp." },
        { title: "Atendimento", text: "Entendemos o que você precisa." },
        { title: "Entrega", text: "Realizamos o serviço combinado." },
      ]),
    }),
  },
  marquee: {
    label: "Faixa animada",
    description: "Palavras em movimento contínuo (desliga com movimento reduzido).",
    anchor: "faixa",
    navLabel: "",
    props: () => ({ items: withIds([{ text: "Palavra" }, { text: "Outra palavra" }]), speed: "normal" }),
  },
  cta: {
    label: "Chamada para ação",
    description: "Faixa de destaque com título e botões.",
    anchor: "chamada",
    navLabel: "",
    props: () => ({
      eyebrow: "",
      title: "Vamos conversar?",
      subtitle: "",
      primaryCta: { label: "Chamar no WhatsApp", action: "whatsapp", target: "Olá! Vim pelo site." },
      secondaryCta: { label: "", action: "section", target: "" },
      background: "primary",
      image: emptyImage(),
    }),
  },
  faq: {
    label: "Perguntas frequentes",
    description: "Perguntas e respostas em acordeão acessível.",
    anchor: "perguntas",
    navLabel: "Dúvidas",
    props: () => ({
      eyebrow: "",
      title: "Perguntas frequentes",
      items: withIds([{ question: "Pergunta frequente?", answer: "Resposta." }]),
    }),
  },
  contact: {
    label: "Contato",
    description: "Formulário que abre o WhatsApp, horários, endereço e redes.",
    anchor: "contato",
    navLabel: "Contato",
    props: () => ({
      eyebrow: "Contato",
      title: "Fale com a gente",
      subtitle: "",
      showForm: true,
      formIntro: "Preencha e envie: sua mensagem será aberta no WhatsApp para você confirmar o envio.",
      showHours: true,
      showAddress: true,
      showSocial: true,
    }),
  },
};

export interface CreateSectionOptions<T extends SectionType> {
  anchor?: string;
  navLabel?: string;
  props?: Partial<SectionProps<T>>;
}

export function createSection<T extends SectionType>(type: T, options: CreateSectionOptions<T> = {}): SectionOf<T> {
  const blueprint = SECTION_BLUEPRINTS[type] as SectionBlueprint<T>;
  const section = {
    id: shortId(),
    type,
    anchor: options.anchor ?? blueprint.anchor,
    navLabel: options.navLabel ?? blueprint.navLabel,
    hidden: false,
    props: { ...(blueprint.props() as object), ...(options.props as object | undefined) },
  };
  return section as unknown as SectionOf<T>;
}

/** Garante âncora única ao inserir uma seção em uma lista existente. */
export function uniqueAnchor(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
}
