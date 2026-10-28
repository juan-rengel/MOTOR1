import { emptySocialLinks } from "@/domain/business";
import { createSection, withIds } from "@/features/sections/create-section";
import type { TemplateContext, TemplateDefinition } from "./types";

const IMG = "/assets/demo/optics";

/** Armações demonstrativas (nomes fictícios; imagens geradas pela cena 3D). */
const DEMO_FRAMES = [
  { name: "Aurora", category: "Grau", description: "Acetato preto, formato quadrado de linhas suaves.", image: "frame-square-black.jpg", alt: "Armação quadrada preta de acetato" },
  { name: "Lumen", category: "Grau", description: "Formato redondo em acetato tartaruga.", image: "frame-round-tortoise.jpg", alt: "Armação redonda marrom tartaruga" },
  { name: "Carmim", category: "Grau", description: "Formato gatinho em acetato bordô.", image: "frame-cat-burgundy.jpg", alt: "Armação gatinho bordô" },
  { name: "Horizonte", category: "Sol", description: "Aviador em metal dourado com lentes escuras.", image: "frame-aviator-gold.jpg", alt: "Óculos aviador dourado com lentes escuras" },
  { name: "Cristal", category: "Grau", description: "Acetato translúcido, formato quadrado.", image: "frame-square-crystal.jpg", alt: "Armação quadrada translúcida" },
  { name: "Marinho", category: "Grau", description: "Formato redondo em azul profundo.", image: "frame-round-navy.jpg", alt: "Armação redonda azul-marinho" },
];

function catalogItems(ctx: TemplateContext) {
  if (ctx.business.offerings.length > 0) {
    return ctx.business.offerings.map((name, i) => {
      const demo = DEMO_FRAMES[i % DEMO_FRAMES.length]!;
      return { name, description: ctx.copy.offeringDescription(name, ctx.business), price: "Sob consulta", category: "", badge: "", image: { src: `${IMG}/${demo.image}`, alt: demo.alt } };
    });
  }
  return DEMO_FRAMES.map((f) => ({ name: f.name, description: f.description, price: "Sob consulta", category: f.category, badge: "", image: { src: `${IMG}/${f.image}`, alt: f.alt } }));
}

export const opticsTemplate: TemplateDefinition = {
  id: "optics-atelier",
  name: "Ótica Atelier",
  tagline: "Vitrine 3D de armações, catálogo filtrável e atendimento pelo WhatsApp.",
  description:
    "Uma armação 3D com lentes de vidro gira sobre um pedestal de vitrine enquanto o visitante rola. Catálogo de armações por categoria, blocos editoriais sobre atendimento e agendamento de visita.",
  segments: ["optics"],
  defaultStyle: "elegant",
  features: ["Armação 3D com lentes de vidro", "Catálogo com filtros", "Editorial com revelação de imagens", "Agendamento via WhatsApp"],
  preview: { src: `${IMG}/hero-poster.jpg`, alt: "Armação de óculos 3D sobre pedestal em vitrine clara" },
  themeTweaks: {
    elegant: { colors: { primary: "#1d3b4f", accent: "#b08d57" } },
  },
  scene: () => ({
    enabled: true,
    sceneId: "eyewear",
    cameraMotion: "scroll",
    interactive: true,
    quality: "auto",
    primaryColor: "#3b2a20",
    accentColor: "#c9a96e",
    environment: "warm",
    fallbackImage: { src: `${IMG}/hero-poster.jpg`, alt: "Armação de óculos sobre pedestal de vitrine" },
    modelSrc: "",
    variant: "square",
  }),
  buildSections: (ctx) => {
    const { business, copy } = ctx;
    const message = copy.whatsappMessage(business);
    return [
      createSection("sceneStory", {
        props: {
          eyebrow: business.city ? `Ótica · ${business.city}` : "Ótica",
          title: copy.heroTitles[0] ?? "",
          subtitle: copy.heroSubtitle(business),
          primaryCta: { label: "Agendar visita", action: "whatsapp", target: `Olá, ${business.name}! Gostaria de agendar uma visita para ver armações.` },
          secondaryCta: { label: "Ver armações", action: "section", target: "armacoes" },
          chapters: withIds([
            { kicker: "Armações", title: "Formatos que valorizam o rosto", text: "Curadoria de modelos em acetato e metal para estilos diferentes." },
            { kicker: "Lentes", title: "Clareza para a sua rotina", text: "Lentes indicadas de acordo com a sua receita e o seu dia a dia." },
            { kicker: "Ajuste", title: "Conforto do começo ao fim do dia", text: "Ajuste fino da armação no momento da entrega." },
          ]),
        },
      }),
      createSection("catalog", {
        anchor: "armacoes",
        navLabel: "Armações",
        props: {
          eyebrow: "Coleção",
          title: "Armações em destaque",
          subtitle: "Modelos demonstrativos — substitua pelas armações e fotos reais da ótica.",
          showFilters: true,
          orderLabel: "Consultar no WhatsApp",
          orderMessage: "Olá! Gostaria de saber mais sobre a armação {produto}.",
          items: withIds(catalogItems(ctx)),
        },
      }),
      createSection("editorial", {
        anchor: "atendimento",
        navLabel: "Atendimento",
        props: {
          eyebrow: "Atendimento",
          title: "Do primeiro olhar ao ajuste final",
          items: withIds([
            { kicker: "01", title: "Orientação na escolha", text: "Ajudamos você a comparar formatos, cores e materiais com calma, considerando o formato do rosto e o seu estilo.", image: { src: `${IMG}/detail-front.jpg`, alt: "Armação de óculos vista de frente" } },
            { kicker: "02", title: "Lentes para cada necessidade", text: "Apresentamos as opções de lentes compatíveis com a sua receita e explicamos as diferenças antes da compra.", image: { src: `${IMG}/detail-lens.jpg`, alt: "Detalhe das lentes de uma armação" } },
            { kicker: "03", title: "Ajustes e manutenção", text: "Edite este bloco com os serviços de ajuste e manutenção oferecidos pela ótica.", image: { src: `${IMG}/detail-hinge.jpg`, alt: "Detalhe da dobradiça e da haste de uma armação" } },
          ]),
        },
      }),
      createSection("steps", {
        props: {
          eyebrow: "Passo a passo",
          title: "Como escolher seus óculos",
          subtitle: "",
          items: withIds([
            { title: "Traga sua receita", text: "Para lentes de grau, traga a receita emitida pelo profissional de saúde visual." },
            { title: "Experimente formatos", text: "Compare modelos e veja o que combina com você." },
            { title: "Escolha as lentes", text: "Entenda as opções de lentes e tratamentos disponíveis." },
            { title: "Ajuste e retirada", text: "Seus óculos são ajustados para o seu rosto na entrega." },
          ]),
        },
      }),
      createSection("about", {
        props: {
          eyebrow: "Sobre",
          title: business.name,
          text: copy.aboutText(business),
          image: { src: `${IMG}/frame-round-tortoise.jpg`, alt: "Armação redonda tartaruga" },
          highlights: withIds([{ text: "Atendimento com orientação na escolha" }, { text: "Armações de grau e de sol" }, { text: "Ajuste na entrega" }]),
        },
      }),
      createSection("faq", {
        props: {
          eyebrow: "Dúvidas",
          title: "Perguntas frequentes",
          items: withIds([
            { question: "Preciso de receita para lentes de grau?", answer: "Sim. Traga a receita emitida pelo profissional de saúde visual. Edite esta resposta conforme o atendimento da ótica." },
            { question: "Posso reservar uma armação pelo WhatsApp?", answer: "Informe aqui como funcionam reservas, prazos e formas de pagamento." },
            { question: "Vocês fazem ajustes em óculos comprados em outro lugar?", answer: "Informe aqui a política da ótica para ajustes e consertos." },
          ]),
        },
      }),
      createSection("cta", {
        props: {
          eyebrow: "Visite a ótica",
          title: "Encontre a armação que combina com você.",
          subtitle: "Agende uma visita e experimente os modelos com calma.",
          primaryCta: { label: "Agendar pelo WhatsApp", action: "whatsapp", target: message },
          secondaryCta: { label: "", action: "section", target: "" },
          background: "primary",
          image: { src: "", alt: "" },
        },
      }),
      createSection("contact", {
        props: {
          eyebrow: "Contato",
          title: "Fale com a ótica",
          subtitle: "Tire dúvidas sobre armações, lentes e horários.",
          showForm: true,
          formIntro: "Conte o que você procura. Ao enviar, a mensagem abre no WhatsApp para você confirmar.",
          showHours: true,
          showAddress: true,
          showSocial: true,
        },
      }),
    ];
  },
  demoBusiness: {
    name: "Ótica Lumière",
    segment: "optics",
    city: "",
    description: "",
    offerings: [],
    audience: "Quem busca armações com orientação personalizada",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "Seg. a sáb., 9h às 19h",
    social: emptySocialLinks(),
    goal: "catalog",
  },
};
