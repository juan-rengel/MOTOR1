/**
 * Normalização de telefones para links de WhatsApp e tel:.
 *
 * Regras:
 * - Remove tudo que não for dígito.
 * - Números com 10 ou 11 dígitos são tratados como brasileiros (DDD + número) e
 *   recebem o código do país 55.
 * - Números com + no início são mantidos como internacionais (8 a 15 dígitos, E.164).
 * - Qualquer outro formato é rejeitado — nunca "inventamos" um número.
 */
export type PhoneResult = { ok: true; e164Digits: string } | { ok: false; reason: string };

export function normalizePhone(input: string, defaultCountryCode = "55"): PhoneResult {
  const raw = input.trim();
  if (raw === "") return { ok: false, reason: "Número não informado." };

  const hasPlus = raw.startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (digits === "") return { ok: false, reason: "Número sem dígitos." };

  if (!hasPlus) {
    digits = digits.replace(/^0+/, "");
    if (digits.length === 10 || digits.length === 11) {
      digits = defaultCountryCode + digits;
    }
  }

  if (digits.length < 8 || digits.length > 15) {
    return { ok: false, reason: "Número com quantidade de dígitos inválida." };
  }

  if (digits.startsWith("55")) {
    const national = digits.slice(2);
    if (national.length !== 10 && national.length !== 11) {
      return { ok: false, reason: "Número brasileiro deve ter DDD + 8 ou 9 dígitos." };
    }
    if (/^0/.test(national)) return { ok: false, reason: "DDD inválido." };
  }

  return { ok: true, e164Digits: digits };
}

/** Monta link wa.me. A mensagem só é enviada se o visitante confirmar no WhatsApp. */
export function buildWhatsAppLink(phone: string, message = ""): string | null {
  const result = normalizePhone(phone);
  if (!result.ok) return null;
  const text = message.trim();
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${result.e164Digits}${query}`;
}

export function buildTelLink(phone: string): string | null {
  const result = normalizePhone(phone);
  return result.ok ? `tel:+${result.e164Digits}` : null;
}

/** Formata para exibição: +55 (11) 91234-5678. */
export function formatPhoneForDisplay(phone: string): string {
  const result = normalizePhone(phone);
  if (!result.ok) return phone;
  const d = result.e164Digits;
  if (d.startsWith("55")) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    const split = rest.length === 9 ? 5 : 4;
    return `+55 (${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
  }
  return `+${d}`;
}
