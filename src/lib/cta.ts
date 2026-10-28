import type { BusinessInfo } from "@/domain/business";
import type { Cta } from "@/domain/cta";
import { isSafeHref } from "@/domain/primitives";
import { buildTelLink, buildWhatsAppLink } from "./phone";

export type ResolvedCta =
  | { status: "ok"; href: string; external: boolean; label: string }
  | { status: "hidden" }
  | { status: "unavailable"; label: string; reason: string };

/**
 * Transforma a configuração de um botão em um link utilizável.
 * Nunca inventa dados: se faltar telefone/e-mail, o botão fica indisponível e
 * o motivo é informado (o editor exibe esse motivo como alerta).
 */
export function resolveCta(cta: Cta, business: BusinessInfo): ResolvedCta {
  const label = cta.label.trim();
  if (!label) return { status: "hidden" };

  switch (cta.action) {
    case "whatsapp": {
      const href = buildWhatsAppLink(business.whatsapp, cta.target);
      return href
        ? { status: "ok", href, external: true, label }
        : { status: "unavailable", label, reason: "WhatsApp do negócio não configurado ou inválido." };
    }
    case "phone": {
      const href = buildTelLink(business.phone || business.whatsapp);
      return href
        ? { status: "ok", href, external: false, label }
        : { status: "unavailable", label, reason: "Telefone do negócio não configurado ou inválido." };
    }
    case "email": {
      const email = business.email.trim();
      return email
        ? { status: "ok", href: `mailto:${email}`, external: false, label }
        : { status: "unavailable", label, reason: "E-mail do negócio não configurado." };
    }
    case "section": {
      const anchor = cta.target.trim().replace(/^#/, "");
      return /^[a-z0-9-]+$/.test(anchor)
        ? { status: "ok", href: `#${anchor}`, external: false, label }
        : { status: "unavailable", label, reason: "Seção de destino não definida." };
    }
    case "link": {
      const target = cta.target.trim();
      if (!isSafeHref(target)) {
        return { status: "unavailable", label, reason: "Link vazio ou não permitido." };
      }
      return { status: "ok", href: target, external: /^https?:/i.test(target), label };
    }
  }
}
