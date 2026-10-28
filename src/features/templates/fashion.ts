import { emptySocialLinks } from "@/domain/business";
import type { SceneSettings } from "@/domain/scene";
import { createSection, withIds } from "@/features/sections/create-section";
import type { TemplateContext, TemplateDefinition } from "./types";

const IMG = "/assets/demo/fashion";

const DEMO_SNEAKERS = [
  { name: "Pulse", category: "Casual", description: "Cabedal branco com detalhes em rosa.", image: "sneaker-white-rose.jpg", alt: "Tênis branco com detalhes rosa" },
  { name: "Night Run", category: "Corrida", description: "Preto com faixa ciano.", image: "sneaker-black-cyan.jpg", alt: "Tênis preto com faixa ciano" },
  { name: "Harbor", category: "Casual", description: "Azul-marinho com detalhes laranja.", image: "sneaker-navy-orange.jpg", alt: "Tênis azul-marinho com detalhes laranja" },
  { name: "Dune", category: "Casual", description: "Areia com faixa verde.", image: "sneaker-sand-green.jpg", alt: "Tênis cor de areia com faixa verde" },
  { name: "Blaze", category: "Corrida", description: "Vermelho com detalhes brancos.", image: "sneaker-red-white.jpg", alt: "Tênis vermelho com detalhes brancos" },
  { name: "Slate", category: "Casual", description: "Cinza com faixa violeta.", image: "sneaker-grey-violet.jpg", alt: "Tênis cinza com faixa violeta" },
];

const DEMO_FABRICS = [
  { name: "Lenço de seda Rosé", category: "Acessórios", description: "Toque acetinado e caimento leve.", image: "silk-rose.jpg", alt: "Tecido acetinado rosa ondulando" },
  { name: "Blusa em cetim Marinho", category: "Feminino", description: "Cetim fluido em azul profundo.", image: "silk-navy.jpg", alt: "Tecido acetinado azul-marinho" },
  { name: "Vestido fluido Esmeralda", category: "Feminino", description: "Tecido leve com brilho suave.", image: "silk-emerald.jpg", alt: "Tecido acetinado verde-esmeralda" },
  { name: "Camisa Âmbar", category: "Masculino", description: "Cor quente para dias de sol.", image: "silk-amber.jpg", alt: "Tecido acetinado âmbar" },
  { name: "Saia midi Noir", category: "Feminino", description: "Preto clássico com movimento.", image: "silk-black.jpg", alt: "Tecido acetinado preto" },
  { name: "Echarpe Pérola", category: "Acessórios", description: "Tom pérola que combina com tudo.", image: "silk-pearl.jpg", alt: "Tecido acetinado cor pérola" },
];

const isSneakers = (ctx: TemplateContext) => ctx.business.segment === "sneakers";

function catalogItems(ctx: TemplateContext) {
  const demo = isSneakers(ctx) ? DEMO_SNEAKERS : DEMO_FABRICS;
  if (ctx.business.offerings.length > 0) {
    return ctx.business.offerings.map((name, i) => {
      const d = demo[i % demo.length]!;
      return { name, description: ctx.copy.offeringDescription(name, ctx.business), price: "Consulte", category: "", badge: "", image: { src: `${IMG}/${d.image}`, alt: d.alt } };
    });
  }
  return demo.map((d, i) => ({ name: d.name, description: d.description, price: "Consulte", category: d.category, badge: i === 0 ? "Novo" : "", image: { src: `${IMG}/${d.image}`, alt: d.alt } }));
}

function sceneFor(ctx: TemplateContext): SceneSettings {
  const sneakers = isSneakers(ctx);
  return {
    enabled: true,
    sceneId: sneakers ? "sneaker" : "silk-flow",
    cameraMotion: "scroll",
    interactive: true,
    quality: "auto",
    primaryColor: sneakers ? "#f4f4f2" : "#9d174d",
    accentColor: sneakers ? "#e11d48" : "#f9a8d4",
    environment: "studio",
    fallbackImage: sneakers
      ? { src: `${IMG}/sneaker-hero.jpg`, alt: "Tênis branco com detalhes rosa sobre pedestal iluminado" }
      : { src: `${IMG}/silk-hero.jpg`, alt: "Tecido acetinado rosa ondulando sob luz de estúdio" },
    modelSrc: "",
    variant: "",
  };
}

export const fashionTemplate: TemplateDefinition = {
  id: "fashion-editorial",
  name: "Coleção Editorial",
  tagline: "Loja de roupas ou tênis com abertura 3D, lookbook e pedidos pelo WhatsApp.",
  description:
    "Abertura com tecido acetinado em movimento (roupas) ou tênis em destaque (calçados), faixa animada da coleção, catálogo com filtros, lookbook editorial e pedido de cada produto direto no WhatsApp.",
  segments: ["fashion", "sneakers"],
  defaultStyle: "vibrant",
  features: ["Tecido ou tênis 3D", "Catálogo com pedido por produto", "Lookbook editorial", "Faixa animada da coleção"],
  preview: { src: `${IMG}/silk-hero.jpg`, alt: "Tecido acetinado rosa em movimento" },
  scene: sceneFor,
  buildSections: (ctx) => {
    const { business, copy } = ctx;
    const sneakers = isSneakers(ctx);
    const items = catalogItems(ctx);
    const message = copy.whatsappMessage(business);
    return [
      createSection("sceneStory", {
        props: {
          eyebrow: business.city ? `Nova coleção · ${business.city}` : "Nova coleção",
          title: copy.heroTitles[0] ?? "",
          subtitle: copy.heroSubtitle(business),
          primaryCta: { label: "Ver coleção", action: "section", target: "colecao" },
          secondaryCta: { label: "Chamar no WhatsApp", action: "whatsapp", target: message },
          chapters: withIds(
            sneakers
              ? [
                  { kicker: "Design", title: "Feito para a rua", text: "Modelos para o dia a dia e para quem vive a cultura sneaker." },
                  { kicker: "Conforto", title: "Cada passo conta", text: "Consulte numeração e materiais de cada modelo." },
                  { kicker: "Pedido", title: "Escolheu? Chama no WhatsApp", text: "Confirme tamanho, pagamento e entrega direto com a loja." },
                ]
              : [
                  { kicker: "Coleção", title: "Peças que se movem com você", text: "Tecidos leves e cores escolhidas para a estação." },
                  { kicker: "Detalhes", title: "Toque, caimento e cor", text: "Cada peça é selecionada pensando em conforto e estilo." },
                  { kicker: "Pedido", title: "Escolheu? Chama no WhatsApp", text: "Confirme tamanho, pagamento e entrega direto com a loja." },
                ],
          ),
        },
      }),
      createSection("marquee", {
        props: { items: withIds((sneakers ? ["Lançamentos", "Casual", "Corrida", "Streetwear"] : ["Nova coleção", "Seda", "Cetim", "Linho"]).map((text) => ({ text }))), speed: "normal" },
      }),
      createSection("catalog", {
        anchor: "colecao",
        navLabel: "Coleção",
        props: {
          eyebrow: "Coleção",
          title: sneakers ? "Modelos em destaque" : "Peças em destaque",
          subtitle: "Itens e imagens demonstrativos — substitua pelos produtos e fotos reais da loja.",
          showFilters: true,
          orderLabel: "Pedir no WhatsApp",
          orderMessage: "Olá! Tenho interesse em: {produto}. Qual a disponibilidade?",
          items: withIds(items),
        },
      }),
      createSection("editorial", {
        anchor: "lookbook",
        navLabel: "Lookbook",
        props: {
          eyebrow: "Lookbook",
          title: "Inspiração da estação",
          items: withIds(
            sneakers
              ? [
                  { kicker: "Drop 01", title: "Contraste que chama atenção", text: "Edite este bloco para apresentar um lançamento ou uma combinação de looks.", image: { src: `${IMG}/sneaker-detail.jpg`, alt: "Detalhe do bico de um tênis" } },
                  { kicker: "Drop 02", title: "Leve no pé, forte no visual", text: "Use imagens próprias da loja para mostrar modelos em uso.", image: { src: `${IMG}/sneaker-top.jpg`, alt: "Tênis visto de cima" } },
                ]
              : [
                  { kicker: "Look 01", title: "Fluidez para dias quentes", text: "Edite este bloco para apresentar uma composição de looks da coleção.", image: { src: `${IMG}/look-1.jpg`, alt: "Tecido acetinado coral em close" } },
                  { kicker: "Look 02", title: "Noite em tons profundos", text: "Use fotos próprias da loja para mostrar as peças em uso.", image: { src: `${IMG}/look-2.jpg`, alt: "Tecido acetinado azul-noite" } },
                ],
          ),
        },
      }),
      createSection("gallery", {
        props: {
          eyebrow: "Galeria",
          title: "Detalhes da coleção",
          subtitle: "Imagens demonstrativas geradas em 3D.",
          layout: "strip",
          images: withIds(items.slice(0, 6).map((i) => ({ image: i.image, caption: i.name }))),
        },
      }),
      createSection("steps", {
        props: {
          eyebrow: "Como comprar",
          title: "Do catálogo ao seu armário",
          subtitle: "",
          items: withIds([
            { title: "Escolha no catálogo", text: "Toque em “Pedir no WhatsApp” no produto desejado." },
            { title: "Converse com a loja", text: "Confirme tamanho, cor e disponibilidade." },
            { title: "Combine pagamento", text: "Informe aqui as formas de pagamento aceitas." },
            { title: "Retire ou receba", text: "Informe aqui as opções de retirada e entrega." },
          ]),
        },
      }),
      createSection("faq", {
        props: {
          eyebrow: "Dúvidas",
          title: "Perguntas frequentes",
          items: withIds([
            { question: "Como sei meu tamanho?", answer: sneakers ? "Informe aqui a tabela de numeração ou como a loja orienta a escolha." : "Informe aqui a tabela de medidas ou como a loja orienta a escolha." },
            { question: "Vocês fazem trocas?", answer: "Informe aqui a política de trocas da loja." },
            { question: "Fazem entregas?", answer: "Informe aqui as regiões, prazos e custos de entrega." },
          ]),
        },
      }),
      createSection("cta", {
        props: {
          eyebrow: "Atendimento",
          title: sneakers ? "Achou o seu par?" : "Gostou de alguma peça?",
          subtitle: "Fale com a loja e confirme a disponibilidade.",
          primaryCta: { label: "Chamar no WhatsApp", action: "whatsapp", target: message },
          secondaryCta: { label: "", action: "section", target: "" },
          background: "primary",
          image: { src: "", alt: "" },
        },
      }),
      createSection("contact", {
        props: {
          eyebrow: "Contato",
          title: "Fale com a loja",
          subtitle: "",
          showForm: true,
          formIntro: "Diga o que você procura. Ao enviar, a mensagem abre no WhatsApp para você confirmar.",
          showHours: true,
          showAddress: true,
          showSocial: true,
        },
      }),
    ];
  },
  demoBusiness: {
    name: "Maison Rosa",
    segment: "fashion",
    city: "",
    description: "",
    offerings: [],
    audience: "Quem busca peças leves e atuais",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "Seg. a sáb., 10h às 20h",
    social: emptySocialLinks(),
    goal: "catalog",
  },
};
