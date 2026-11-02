import { emptySocialLinks } from "@/domain/business";
import type { SiteIconId } from "@/domain/icons";
import { PRIMARY_CTA_BY_GOAL } from "@/features/content/copy-packs";
import { createSection, emptyImage, withIds } from "@/features/sections/create-section";
import type { TemplateContext, TemplateDefinition } from "./types";

/**
 * Oficina Real — modelo dedicado a oficinas mecânicas, ao lado da Garagem
 * Cinematográfica (que continua intacta). A identidade visual 3D cinematográfica
 * (camadas, cartões com volume, botões tridimensionais) virá de estilos próprios
 * escopados por `[data-template="mechanic-real"]`, sem WebGL e sem mudar as seções
 * compartilhadas. Usa só tipos de seção existentes.
 *
 * Fotografias: ainda não há imagens autorizadas para este modelo. Até lá, a capa
 * usa degradê, o "Sobre" fica sem foto e a galeria começa oculta (sem espaço vazio
 * no site); o cliente adiciona as próprias fotos pelo editor.
 */

const IMG = "/assets/demo/mechanic-real";

/** Ícone de cada serviço a partir do nome (serviços informados pelo usuário ou sugestões do segmento). */
const KEYWORD_ICONS: Array<[RegExp, SiteIconId]> = [
  [/frei/i, "disc"],
  [/óleo|oleo|filtro/i, "droplets"],
  [/suspens|direç|alinh|balance/i, "cog"],
  [/injeç|elétric|eletric|bateria/i, "zap"],
  [/ar[- ]?condicionado|climatiz/i, "wind"],
  [/revis|diagn/i, "gauge"],
  [/funilaria|pintura|lataria/i, "palette"],
  [/pneu|roda/i, "disc"],
];

function iconFor(title: string): SiteIconId {
  return KEYWORD_ICONS.find(([re]) => re.test(title))?.[1] ?? "wrench";
}

/** Serviços: os informados pelo usuário ou, na falta deles, as sugestões do segmento (conteúdo demonstrativo). */
function servicesFor(ctx: TemplateContext) {
  const titles = ctx.business.offerings.length > 0 ? ctx.business.offerings : ctx.segment.offeringHints;
  return titles.map((title) => ({ icon: iconFor(title), title, description: ctx.copy.offeringDescription(title, ctx.business), note: "" }));
}

export const mechanicRealTemplate: TemplateDefinition = {
  id: "mechanic-real",
  name: "Oficina Real",
  tagline: "Oficina de verdade em destaque: serviços claros, diferenciais e orçamento pelo WhatsApp.",
  description:
    "Capa com a oficina e o carro em primeiro plano, serviços em cartões com volume, diferenciais, passo a passo do atendimento, galeria da estrutura e contato. Pensado para fotografias reais da oficina e leve no celular (sem cena 3D).",
  segments: ["mechanic"],
  defaultStyle: "industrial",
  features: ["Fotos reais da oficina", "Serviços em cartões com volume", "Diferenciais e passo a passo", "Orçamento pelo WhatsApp"],
  preview: { src: `${IMG}/preview.jpg`, alt: "Página do modelo Oficina Real" },
  scene: () => ({
    enabled: false,
    sceneId: "custom-model",
    cameraMotion: "static",
    interactive: true,
    quality: "auto",
    primaryColor: "#c2410c",
    accentColor: "#f59e0b",
    environment: "studio",
    fallbackImage: emptyImage(),
    modelSrc: "",
    variant: "",
  }),
  buildSections: (ctx) => {
    const { business, copy } = ctx;
    const quoteMessage = copy.whatsappMessage(business);
    const goal = business.goal === "catalog" ? "quote" : business.goal;
    return [
      createSection("hero", {
        props: {
          eyebrow: business.city ? `Oficina mecânica · ${business.city}` : "Oficina mecânica",
          title: copy.heroTitles[1] ?? copy.heroTitles[0] ?? "",
          subtitle: copy.heroSubtitle(business),
          primaryCta: { label: PRIMARY_CTA_BY_GOAL[goal], action: "whatsapp", target: quoteMessage },
          secondaryCta: { label: "Ver serviços", action: "section", target: "servicos" },
          // Degradê até haver fotografia autorizada da oficina (troque por "image" no editor).
          mediaKind: "gradient",
          image: emptyImage(),
          video: { src: "", poster: "" },
          align: "left",
          overlay: 0.55,
        },
      }),
      createSection("services", {
        props: {
          eyebrow: "Serviços",
          title: "Cuidamos do seu carro por inteiro",
          subtitle: "Cada serviço começa com avaliação e orçamento aprovado por você.",
          layout: "grid",
          items: withIds(servicesFor(ctx)),
        },
      }),
      createSection("about", {
        anchor: "diferenciais",
        navLabel: "Diferenciais",
        props: {
          eyebrow: "Diferenciais",
          title: business.name,
          text: copy.aboutText(business),
          image: emptyImage(),
          highlights: withIds([
            { text: "Orçamento apresentado antes do serviço" },
            { text: "Diagnóstico explicado ao cliente" },
            { text: "Atendimento com hora marcada" },
          ]),
        },
      }),
      createSection("steps", {
        props: {
          eyebrow: "Atendimento",
          title: "Como funciona",
          subtitle: "",
          items: withIds([
            { title: "Chame no WhatsApp", text: "Conte o que está acontecendo com o carro e combine um horário." },
            { title: "Avaliação", text: "O carro é avaliado e você recebe a explicação do que foi encontrado." },
            { title: "Orçamento aprovado", text: "Nenhum serviço começa sem a sua aprovação." },
            { title: "Entrega", text: "Você retira o carro sabendo o que foi feito." },
          ]),
        },
      }),
      {
        ...createSection("gallery", {
          anchor: "estrutura",
          navLabel: "Estrutura",
          props: {
            eyebrow: "Estrutura",
            title: "Conheça a oficina",
            subtitle: "Adicione fotos reais da oficina, da equipe e das ferramentas.",
            layout: "mosaic",
            images: [],
          },
        }),
        // Oculta até receber fotos: uma galeria vazia não deve deixar espaço no site.
        hidden: true,
      },
      createSection("faq", {
        props: {
          eyebrow: "Dúvidas",
          title: "Perguntas frequentes",
          items: withIds([
            { question: "Preciso agendar?", answer: "Recomendamos combinar o horário pelo WhatsApp. Edite esta resposta conforme o funcionamento da oficina." },
            { question: "Como funciona o orçamento?", answer: "Depois da avaliação do carro, apresentamos o orçamento para sua aprovação antes de iniciar o serviço." },
            { question: "Quais formas de pagamento?", answer: "Informe aqui as formas de pagamento aceitas pela oficina." },
          ]),
        },
      }),
      createSection("cta", {
        props: {
          eyebrow: "Orçamento",
          title: "Seu carro em boas mãos.",
          subtitle: "Fale com a oficina e combine a avaliação.",
          primaryCta: { label: "Pedir orçamento no WhatsApp", action: "whatsapp", target: quoteMessage },
          secondaryCta: { label: "", action: "section", target: "" },
          background: "primary",
          image: emptyImage(),
        },
      }),
      createSection("contact", {
        props: {
          eyebrow: "Contato",
          title: "Fale com a oficina",
          subtitle: "Escolha o canal que preferir.",
          showForm: true,
          formIntro: "Descreva o problema do carro. Ao enviar, a mensagem abre no WhatsApp para você confirmar.",
          showHours: true,
          showAddress: true,
          showSocial: true,
        },
      }),
    ];
  },
  demoBusiness: {
    name: "Oficina Ponto Certo",
    segment: "mechanic",
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
    goal: "quote",
  },
};
