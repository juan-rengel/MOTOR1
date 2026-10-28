import "server-only";
import { LocalRulesContentGenerator } from "@/features/content/local-rules-generator";
import type { ContentGenerator } from "@/features/content/types";

export interface ContentProviderStatus {
  requested: string;
  active: ContentGenerator["info"];
  warning?: string;
}

/**
 * Seleciona o provedor de conteúdo pela variável CWS_CONTENT_PROVIDER.
 * Hoje só existe "local-rules". Provedores de IA (FASE 8) serão registrados
 * aqui, lendo chaves exclusivamente do servidor.
 */
export function getContentGenerator(): { generator: ContentGenerator; status: ContentProviderStatus } {
  const requested = (process.env.CWS_CONTENT_PROVIDER || "local-rules").trim();
  const generator = new LocalRulesContentGenerator();
  const status: ContentProviderStatus = { requested, active: generator.info };
  if (requested !== "local-rules") {
    status.warning = `Provedor "${requested}" ainda não está implementado. Usando regras locais (sem IA).`;
  }
  return { generator, status };
}
