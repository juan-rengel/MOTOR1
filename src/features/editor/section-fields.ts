import { SITE_ICON_IDS } from "@/domain/icons";
import type { SectionType } from "@/domain/sections";
import { emptyImage } from "@/features/sections/create-section";

/**
 * Descrição declarativa dos campos editáveis de cada seção. O painel de
 * propriedades é gerado a partir daqui; adicionar um campo não exige criar
 * componentes novos.
 */
export type FieldDef =
  | { kind: "text"; key: string; label: string; max: number; hint?: string }
  | { kind: "textarea"; key: string; label: string; max: number; rows?: number; hint?: string }
  | { kind: "select"; key: string; label: string; options: Array<{ value: string; label: string }> }
  | { kind: "boolean"; key: string; label: string; hint?: string }
  | { kind: "range"; key: string; label: string; min: number; max: number; step: number }
  | { kind: "image"; key: string; label: string }
  | { kind: "video"; key: string; label: string }
  | { kind: "cta"; key: string; label: string }
  | { kind: "icon"; key: string; label: string }
  | {
      kind: "list";
      key: string;
      label: string;
      itemLabel: string;
      max: number;
      fields: FieldDef[];
      newItem: () => Record<string, unknown>;
      /** Campo usado como título do item na lista. */
      titleKey: string;
    };

const t = (key: string, label: string, max: number, hint?: string): FieldDef => ({ kind: "text", key, label, max, hint });
const ta = (key: string, label: string, max: number, rows = 3, hint?: string): FieldDef => ({ kind: "textarea", key, label, max, rows, hint });

const HEADING: FieldDef[] = [t("eyebrow", "Sobretítulo", 60), ta("title", "Título", 140, 2), ta("subtitle", "Subtítulo", 400, 3)];

export const ICON_OPTIONS = SITE_ICON_IDS.map((id) => ({ value: id, label: id }));

export const SECTION_FIELDS: Record<SectionType, FieldDef[]> = {
  hero: [
    ...HEADING,
    { kind: "cta", key: "primaryCta", label: "Botão principal" },
    { kind: "cta", key: "secondaryCta", label: "Botão secundário" },
    {
      kind: "select",
      key: "mediaKind",
      label: "Fundo",
      options: [
        { value: "gradient", label: "Gradiente das cores do tema" },
        { value: "image", label: "Imagem" },
        { value: "video", label: "Vídeo" },
      ],
    },
    { kind: "image", key: "image", label: "Imagem de fundo" },
    { kind: "video", key: "video", label: "Vídeo de fundo" },
    { kind: "range", key: "overlay", label: "Escurecimento sobre a mídia", min: 0, max: 0.9, step: 0.05 },
    { kind: "select", key: "align", label: "Alinhamento", options: [{ value: "left", label: "Esquerda" }, { value: "center", label: "Centro" }] },
  ],
  sceneStory: [
    ...HEADING,
    { kind: "cta", key: "primaryCta", label: "Botão principal" },
    { kind: "cta", key: "secondaryCta", label: "Botão secundário" },
    {
      kind: "list",
      key: "chapters",
      label: "Capítulos (cada um ocupa uma tela durante a rolagem)",
      itemLabel: "Capítulo",
      max: 6,
      titleKey: "title",
      newItem: () => ({ kicker: "", title: "Novo capítulo", text: "" }),
      fields: [t("kicker", "Marcador", 40), t("title", "Título", 80), ta("text", "Texto", 300)],
    },
  ],
  services: [
    ...HEADING,
    { kind: "select", key: "layout", label: "Layout", options: [{ value: "grid", label: "Grade de cartões" }, { value: "list", label: "Lista numerada" }] },
    {
      kind: "list",
      key: "items",
      label: "Serviços",
      itemLabel: "Serviço",
      max: 12,
      titleKey: "title",
      newItem: () => ({ icon: "check", title: "Novo serviço", description: "", note: "" }),
      fields: [{ kind: "icon", key: "icon", label: "Ícone" }, t("title", "Nome", 80), ta("description", "Descrição", 300), t("note", "Observação (ex.: preço a partir de)", 60)],
    },
  ],
  catalog: [
    ...HEADING,
    { kind: "boolean", key: "showFilters", label: "Mostrar filtros por categoria" },
    t("orderLabel", "Texto do botão de pedido", 40),
    t("orderMessage", "Mensagem do pedido no WhatsApp", 200, "Use {produto} para inserir o nome do item."),
    {
      kind: "list",
      key: "items",
      label: "Produtos",
      itemLabel: "Produto",
      max: 24,
      titleKey: "name",
      newItem: () => ({ name: "Novo produto", description: "", price: "", category: "", badge: "", image: emptyImage() }),
      fields: [
        { kind: "image", key: "image", label: "Foto" },
        t("name", "Nome", 80),
        ta("description", "Descrição", 240, 2),
        t("price", "Preço (texto livre)", 40, "Ex.: R$ 299,90 ou Sob consulta"),
        t("category", "Categoria", 40),
        t("badge", "Selo (ex.: Novo)", 30),
      ],
    },
  ],
  gallery: [
    ...HEADING,
    {
      kind: "select",
      key: "layout",
      label: "Layout",
      options: [
        { value: "mosaic", label: "Mosaico" },
        { value: "grid", label: "Grade" },
        { value: "strip", label: "Faixa horizontal" },
      ],
    },
    {
      kind: "list",
      key: "images",
      label: "Imagens",
      itemLabel: "Imagem",
      max: 16,
      titleKey: "caption",
      newItem: () => ({ image: emptyImage(), caption: "" }),
      fields: [{ kind: "image", key: "image", label: "Imagem" }, t("caption", "Legenda", 120)],
    },
  ],
  editorial: [
    t("eyebrow", "Sobretítulo", 60),
    ta("title", "Título", 140, 2),
    {
      kind: "list",
      key: "items",
      label: "Blocos",
      itemLabel: "Bloco",
      max: 6,
      titleKey: "title",
      newItem: () => ({ kicker: "", title: "Novo bloco", text: "", image: emptyImage() }),
      fields: [{ kind: "image", key: "image", label: "Imagem" }, t("kicker", "Marcador", 40), t("title", "Título", 100), ta("text", "Texto", 500, 4)],
    },
  ],
  about: [
    t("eyebrow", "Sobretítulo", 60),
    ta("title", "Título", 140, 2),
    ta("text", "Texto", 1200, 6),
    { kind: "image", key: "image", label: "Imagem" },
    {
      kind: "list",
      key: "highlights",
      label: "Destaques",
      itemLabel: "Destaque",
      max: 6,
      titleKey: "text",
      newItem: () => ({ text: "Novo destaque" }),
      fields: [t("text", "Texto", 80)],
    },
  ],
  steps: [
    ...HEADING,
    {
      kind: "list",
      key: "items",
      label: "Etapas",
      itemLabel: "Etapa",
      max: 8,
      titleKey: "title",
      newItem: () => ({ title: "Nova etapa", text: "" }),
      fields: [t("title", "Título", 80), ta("text", "Texto", 300)],
    },
  ],
  marquee: [
    {
      kind: "select",
      key: "speed",
      label: "Velocidade",
      options: [
        { value: "slow", label: "Lenta" },
        { value: "normal", label: "Normal" },
        { value: "fast", label: "Rápida" },
      ],
    },
    {
      kind: "list",
      key: "items",
      label: "Palavras",
      itemLabel: "Palavra",
      max: 12,
      titleKey: "text",
      newItem: () => ({ text: "Palavra" }),
      fields: [t("text", "Texto", 40)],
    },
  ],
  cta: [
    ...HEADING,
    { kind: "cta", key: "primaryCta", label: "Botão principal" },
    { kind: "cta", key: "secondaryCta", label: "Botão secundário" },
    {
      kind: "select",
      key: "background",
      label: "Fundo",
      options: [
        { value: "primary", label: "Cor principal" },
        { value: "surface", label: "Superfície" },
        { value: "image", label: "Imagem" },
      ],
    },
    { kind: "image", key: "image", label: "Imagem de fundo" },
  ],
  faq: [
    t("eyebrow", "Sobretítulo", 60),
    ta("title", "Título", 140, 2),
    {
      kind: "list",
      key: "items",
      label: "Perguntas",
      itemLabel: "Pergunta",
      max: 12,
      titleKey: "question",
      newItem: () => ({ question: "Nova pergunta?", answer: "" }),
      fields: [t("question", "Pergunta", 160), ta("answer", "Resposta", 800, 4)],
    },
  ],
  contact: [
    ...HEADING,
    { kind: "boolean", key: "showForm", label: "Mostrar formulário", hint: "O formulário abre o WhatsApp (ou e-mail) do negócio; nada é enviado automaticamente." },
    ta("formIntro", "Texto acima do formulário", 200, 2),
    { kind: "boolean", key: "showHours", label: "Mostrar horário" },
    { kind: "boolean", key: "showAddress", label: "Mostrar endereço" },
    { kind: "boolean", key: "showSocial", label: "Mostrar redes sociais" },
  ],
};
