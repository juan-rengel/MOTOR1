import { emptySocialLinks, type BusinessGoal } from "@/domain/business";
import type { Cta } from "@/domain/cta";
import { PRIMARY_CTA_BY_GOAL } from "@/features/content/copy-packs";
import { createSection, emptyImage, withIds } from "@/features/sections/create-section";
import type { TemplateContext, TemplateDefinition } from "./types";

/**
 * Modelo universal: base neutra para qualquer segmento, principalmente os que
 * ainda não têm modelo dedicado. Não usa cena 3D nem imagens — nada de um
 * segmento específico aparece no site. Textos vêm do pacote do segmento e dos
 * dados do negócio; o que for exemplo fica marcado como conteúdo demonstrativo.
 */

/** Itens provisórios quando não há serviços informados nem sugestões do segmento. */
const PLACEHOLDER_SERVICES = [
  { title: "Seu primeiro serviço", description: "Descreva aqui o que você oferece, para quem e como funciona." },
  { title: "Seu segundo serviço", description: "Descreva aqui o que você oferece, para quem e como funciona." },
  { title: "Seu terceiro serviço", description: "Descreva aqui o que você oferece, para quem e como funciona." },
];

function servicesFor(ctx: TemplateContext) {
  const { business, segment, copy } = ctx;
  const titles = business.offerings.length > 0 ? business.offerings : segment.offeringHints;
  if (titles.length > 0) {
    return titles.map((title) => ({ icon: segment.offeringIcon, title, description: copy.offeringDescription(title, business), note: "" }));
  }
  return PLACEHOLDER_SERVICES.map((s) => ({ icon: segment.offeringIcon, ...s, note: "" }));
}

/** Botão principal conforme o objetivo do negócio (só usa seções que este modelo tem). */
function primaryCtaFor(ctx: TemplateContext): Cta {
  const goal: BusinessGoal = ctx.business.goal;
  const label = PRIMARY_CTA_BY_GOAL[goal];
  if (goal === "catalog") return { label: "Ver serviços", action: "section", target: "servicos" };
  if (goal === "contact") return { label, action: "section", target: "contato" };
  if (goal === "awareness") return { label, action: "section", target: "sobre" };
  return { label, action: "whatsapp", target: ctx.copy.whatsappMessage(ctx.business) };
}

function eyebrowFor(ctx: TemplateContext): string {
  const { business, segment } = ctx;
  // "Outro pequeno negócio" não descreve o negócio para o visitante; nesse caso, só a cidade.
  const label = segment.id === "other" ? "" : segment.label;
  return [label, business.city].filter(Boolean).join(" · ");
}

export const essentialTemplate: TemplateDefinition = {
  id: "universal-essential",
  name: "Essencial",
  tagline: "Base neutra e direta para qualquer negócio, com os textos do seu segmento.",
  description:
    "Capa em degradê com as cores da marca, serviços, passo a passo, sobre, dúvidas e contato. Sem cena 3D e sem imagens de outros negócios: um ponto de partida limpo para adicionar suas próprias fotos.",
  kind: "universal",
  segments: [],
  defaultStyle: "modern",
  features: ["Capa em degradê com as cores da marca", "Textos iniciais do seu segmento", "Sem imagens de terceiros", "Contato pelo WhatsApp"],
  preview: { src: "/assets/demo/essential/preview.jpg", alt: "Capa do modelo Essencial: título grande sobre degradê azul-claro e botões de contato" },
  scene: () => ({
    enabled: false,
    sceneId: "custom-model",
    cameraMotion: "static",
    interactive: true,
    quality: "auto",
    primaryColor: "#2563eb",
    accentColor: "#0ea5e9",
    environment: "studio",
    fallbackImage: emptyImage(),
    modelSrc: "",
    variant: "",
  }),
  buildSections: (ctx) => {
    const { business, copy } = ctx;
    const services = servicesFor(ctx);
    const primaryCta = primaryCtaFor(ctx);
    const hours = business.hours.trim();
    return [
      createSection("hero", {
        props: {
          eyebrow: eyebrowFor(ctx),
          title: copy.heroTitles[0] ?? "",
          subtitle: copy.heroSubtitle(business),
          primaryCta,
          secondaryCta: { label: "Ver serviços", action: "section", target: "servicos" },
          mediaKind: "gradient",
          image: emptyImage(),
          video: { src: "", poster: "" },
          align: "left",
          overlay: 0.4,
        },
      }),
      createSection("services", {
        props: {
          eyebrow: "Serviços",
          title: "O que oferecemos",
          subtitle: "Edite a lista com os serviços reais do seu negócio.",
          layout: "grid",
          items: withIds(services),
        },
      }),
      createSection("steps", {
        props: {
          eyebrow: "Passo a passo",
          title: "Como funciona",
          subtitle: "",
          items: withIds([
            { title: "Fale com a gente", text: "Entre em contato pelo canal que preferir e conte o que você precisa." },
            { title: "Entendemos o pedido", text: "Tiramos as dúvidas e explicamos como funciona o atendimento." },
            { title: "Combinamos os detalhes", text: "Você recebe as informações para decidir com tranquilidade." },
          ]),
        },
      }),
      createSection("about", {
        props: {
          eyebrow: "Sobre",
          title: business.name,
          text: copy.aboutText(business),
          image: emptyImage(),
          highlights: [],
        },
      }),
      createSection("faq", {
        props: {
          eyebrow: "Dúvidas",
          title: "Perguntas frequentes",
          items: withIds([
            { question: "Como faço para ser atendido?", answer: "Fale com a gente pelos contatos desta página. Edite esta resposta conforme o seu atendimento." },
            {
              question: "Qual é o horário de atendimento?",
              answer: hours ? `Atendemos: ${hours}.` : "Informe aqui os dias e horários de atendimento.",
            },
            { question: "Quais formas de pagamento são aceitas?", answer: "Informe aqui as formas de pagamento aceitas." },
          ]),
        },
      }),
      createSection("cta", {
        props: {
          eyebrow: "",
          title: "Vamos conversar?",
          subtitle: "Fale com a gente e tire suas dúvidas.",
          primaryCta: { label: "Chamar no WhatsApp", action: "whatsapp", target: copy.whatsappMessage(business) },
          secondaryCta: { label: "", action: "section", target: "" },
          background: "primary",
          image: emptyImage(),
        },
      }),
      createSection("contact", {
        props: {
          eyebrow: "Contato",
          title: "Fale com a gente",
          subtitle: "Escolha o canal que preferir.",
          showForm: true,
          formIntro: "Preencha e envie: sua mensagem será aberta no WhatsApp para você confirmar o envio.",
          showHours: true,
          showAddress: true,
          showSocial: true,
        },
      }),
    ];
  },
  demoBusiness: {
    name: "Ponto Essencial",
    segment: "services",
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
