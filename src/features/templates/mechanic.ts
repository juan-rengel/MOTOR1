import { emptySocialLinks } from "@/domain/business";
import type { SiteIconId } from "@/domain/icons";
import { PRIMARY_CTA_BY_GOAL } from "@/features/content/copy-packs";
import { createSection, withIds } from "@/features/sections/create-section";
import type { TemplateContext, TemplateDefinition } from "./types";

const IMG = "/assets/demo/mechanic";

/** Serviços demonstrativos usados quando o usuário não informou os próprios. */
const DEMO_SERVICES: Array<{ icon: SiteIconId; title: string; description: string }> = [
  { icon: "gauge", title: "Revisão completa", description: "Checagem dos principais sistemas do veículo com relatório do que precisa de atenção." },
  { icon: "disc", title: "Freios", description: "Avaliação de pastilhas, discos e fluido, com troca quando necessário." },
  { icon: "cog", title: "Suspensão e direção", description: "Diagnóstico de ruídos, folgas e alinhamento do conjunto." },
  { icon: "zap", title: "Injeção e elétrica", description: "Leitura de falhas por scanner e análise do sistema elétrico." },
  { icon: "droplets", title: "Troca de óleo e filtros", description: "Óleo e filtros conforme a especificação do fabricante do veículo." },
  { icon: "wind", title: "Ar-condicionado", description: "Higienização, verificação de carga e funcionamento do sistema." },
];

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

function iconForOffering(offering: string): SiteIconId {
  return KEYWORD_ICONS.find(([re]) => re.test(offering))?.[1] ?? "wrench";
}

function servicesFor(ctx: TemplateContext) {
  if (ctx.business.offerings.length > 0) {
    return ctx.business.offerings.map((title) => ({
      icon: iconForOffering(title),
      title,
      description: ctx.copy.offeringDescription(title, ctx.business),
      note: "",
    }));
  }
  return DEMO_SERVICES.map((s) => ({ ...s, note: "" }));
}

export const mechanicTemplate: TemplateDefinition = {
  id: "mechanic-cinematic",
  name: "Garagem Cinematográfica",
  tagline: "Oficina mecânica com carro 3D e câmera guiada pela rolagem.",
  description:
    "Abertura com um carro 3D iluminado como em estúdio: a câmera percorre o veículo enquanto o visitante rola a página. Serviços, processo, estrutura e orçamento pelo WhatsApp.",
  segments: ["mechanic"],
  defaultStyle: "cinematic",
  features: ["Cena 3D do carro com câmera na rolagem", "Serviços com ícones", "Orçamento via WhatsApp", "Galeria da estrutura"],
  preview: { src: `${IMG}/hero-poster.jpg`, alt: "Carro esportivo 3D em estúdio escuro com luzes âmbar" },
  themeTweaks: {
    tech: { colors: { primary: "#38bdf8" } },
  },
  scene: () => ({
    enabled: true,
    sceneId: "garage-car",
    cameraMotion: "scroll",
    interactive: true,
    quality: "auto",
    primaryColor: "#b3121b",
    accentColor: "#ffb547",
    environment: "studio",
    fallbackImage: { src: `${IMG}/hero-poster.jpg`, alt: "Carro esportivo em estúdio com iluminação dramática" },
    modelSrc: "",
  }),
  buildSections: (ctx) => {
    const { business, copy } = ctx;
    const quoteMessage = copy.whatsappMessage(business);
    const services = servicesFor(ctx);
    return [
      createSection("sceneStory", {
        props: {
          eyebrow: business.city ? `Oficina mecânica · ${business.city}` : "Oficina mecânica",
          title: copy.heroTitles[0] ?? "",
          subtitle: copy.heroSubtitle(business),
          primaryCta: { label: PRIMARY_CTA_BY_GOAL[business.goal === "catalog" ? "quote" : business.goal], action: "whatsapp", target: quoteMessage },
          secondaryCta: { label: "Ver serviços", action: "section", target: "servicos" },
          chapters: withIds([
            { kicker: "01 · Diagnóstico", title: "Entender antes de consertar", text: "O carro é avaliado com calma e você recebe a explicação do que foi encontrado." },
            { kicker: "02 · Precisão", title: "Cada componente no lugar certo", text: "Serviço executado com as ferramentas adequadas e atenção aos detalhes." },
            { kicker: "03 · Entrega", title: "Pronto para a estrada", text: "Você retira o carro sabendo exatamente o que foi feito." },
          ]),
        },
      }),
      createSection("marquee", {
        props: {
          items: withIds(services.slice(0, 8).map((s) => ({ text: s.title }))),
          speed: "normal",
        },
      }),
      createSection("services", {
        props: {
          eyebrow: "Serviços",
          title: "O que fazemos pelo seu carro",
          subtitle: "Cada serviço começa com avaliação e orçamento aprovado por você.",
          layout: "grid",
          items: withIds(services),
        },
      }),
      createSection("steps", {
        props: {
          eyebrow: "Processo",
          title: "Como funciona",
          subtitle: "",
          items: withIds([
            { title: "Agende pelo WhatsApp", text: "Conte o que está acontecendo com o carro e combine o melhor horário." },
            { title: "Diagnóstico", text: "Avaliamos o veículo e explicamos o que foi encontrado." },
            { title: "Orçamento aprovado", text: "Nenhum serviço começa sem a sua aprovação." },
            { title: "Serviço e entrega", text: "Executamos o combinado e devolvemos o carro com as informações do serviço." },
          ]),
        },
      }),
      createSection("gallery", {
        anchor: "estrutura",
        navLabel: "Estrutura",
        props: {
          eyebrow: "Estrutura",
          title: "Detalhes que fazem diferença",
          subtitle: "Imagens demonstrativas geradas em 3D — substitua por fotos reais da sua oficina.",
          layout: "mosaic",
          images: withIds([
            { image: { src: `${IMG}/car-front.jpg`, alt: "Frente de carro esportivo com faróis acesos" }, caption: "Diagnóstico completo" },
            { image: { src: `${IMG}/car-side.jpg`, alt: "Lateral de carro esportivo em estúdio" }, caption: "Suspensão e direção" },
            { image: { src: `${IMG}/wheel.jpg`, alt: "Close de roda e disco de freio" }, caption: "Freios" },
            { image: { src: `${IMG}/car-rear.jpg`, alt: "Traseira de carro esportivo com lanternas acesas" }, caption: "Revisão" },
            { image: { src: `${IMG}/headlight.jpg`, alt: "Close do farol de um carro esportivo" }, caption: "Elétrica e iluminação" },
          ]),
        },
      }),
      createSection("about", {
        props: {
          eyebrow: "Sobre a oficina",
          title: business.name,
          text: copy.aboutText(business),
          image: { src: `${IMG}/car-top.jpg`, alt: "Carro esportivo visto de cima em estúdio" },
          highlights: withIds([
            { text: "Orçamento apresentado antes do serviço" },
            { text: "Diagnóstico explicado ao cliente" },
            { text: "Atendimento com hora marcada" },
          ]),
        },
      }),
      createSection("faq", {
        props: {
          eyebrow: "Dúvidas",
          title: "Perguntas frequentes",
          items: withIds([
            { question: "Preciso agendar?", answer: "Recomendamos agendar pelo WhatsApp para garantir o melhor horário. Edite esta resposta conforme o funcionamento da oficina." },
            { question: "Como funciona o orçamento?", answer: "Após a avaliação do veículo, apresentamos o orçamento detalhado para sua aprovação antes de iniciar o serviço." },
            { question: "Quais formas de pagamento?", answer: "Informe aqui as formas de pagamento aceitas pela oficina." },
          ]),
        },
      }),
      createSection("cta", {
        props: {
          eyebrow: "Orçamento",
          title: "Seu carro merece um diagnóstico de verdade.",
          subtitle: "Fale com a oficina e combine a avaliação.",
          primaryCta: { label: "Pedir orçamento no WhatsApp", action: "whatsapp", target: quoteMessage },
          secondaryCta: { label: "", action: "section", target: "" },
          background: "image",
          image: { src: `${IMG}/headlight.jpg`, alt: "" },
        },
      }),
      createSection("contact", {
        props: {
          eyebrow: "Contato",
          title: "Fale com a oficina",
          subtitle: "Escolha o canal que preferir para falar com a oficina.",
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
    name: "Torque Garage",
    segment: "mechanic",
    city: "",
    description: "",
    offerings: [],
    audience: "Motoristas que querem manutenção transparente",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "Seg. a sex., 8h às 18h · Sáb., 8h às 12h",
    social: emptySocialLinks(),
    goal: "quote",
  },
};
