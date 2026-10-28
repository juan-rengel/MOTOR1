import { z } from "zod";

/**
 * Ação de um botão de chamada (CTA).
 * - whatsapp: abre conversa com o número do negócio; `target` = mensagem inicial.
 * - section: rola até uma seção; `target` = âncora da seção (sem #).
 * - link: abre um link; `target` = URL ou caminho.
 * - phone: liga para o telefone do negócio.
 * - email: abre o e-mail do negócio.
 */
export const ctaActionSchema = z.enum(["whatsapp", "section", "link", "phone", "email"]);
export type CtaAction = z.infer<typeof ctaActionSchema>;

export const ctaSchema = z.object({
  label: z.string().max(60),
  action: ctaActionSchema,
  target: z.string().max(500),
});
export type Cta = z.infer<typeof ctaSchema>;

export const CTA_ACTION_LABELS: Record<CtaAction, string> = {
  whatsapp: "Abrir WhatsApp",
  section: "Ir para seção",
  link: "Abrir link",
  phone: "Ligar",
  email: "Enviar e-mail",
};
