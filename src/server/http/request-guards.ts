import "server-only";
import { jsonError } from "./responses";

/**
 * Proteção contra CSRF para rotas que alteram dados: navegadores sempre enviam
 * o cabeçalho Origin em requisições POST/PUT/DELETE; se ele existir, precisa
 * ser a própria origem do servidor.
 */
export function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return null;
  } catch {
    // Origin malformado cai na rejeição abaixo.
  }
  return jsonError(403, "forbidden", "Origem da requisição não permitida.");
}

/** Lê JSON limitando o tamanho do corpo. */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false, response: jsonError(415, "unsupported", "Envie os dados como JSON.") };
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    return { ok: false, response: jsonError(413, "too_large", "Conteúdo muito grande.") };
  }
  const textBody = await request.text();
  if (new TextEncoder().encode(textBody).byteLength > maxBytes) {
    return { ok: false, response: jsonError(413, "too_large", "Conteúdo muito grande.") };
  }
  try {
    return { ok: true, data: JSON.parse(textBody) };
  } catch {
    return { ok: false, response: jsonError(400, "bad_json", "JSON malformado.") };
  }
}
