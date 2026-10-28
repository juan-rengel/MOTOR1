/** Identificador curto (base36) para seções e itens de lista. */
export function shortId(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export function uuid(): string {
  return crypto.randomUUID();
}

/** Converte texto livre em slug (minúsculas, sem acentos, com hífens). */
export function slugify(value: string, maxLength = 48): string {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "site";
}
