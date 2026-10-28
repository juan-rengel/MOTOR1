import { PROJECT_SCHEMA_VERSION } from "./project";

/**
 * Ponto único para migrar projetos gravados em versões anteriores do schema.
 * Hoje só existe a versão 1; ao criar a versão 2, adicionar aqui a conversão
 * de v1 → v2 para que projetos antigos continuem abrindo.
 */
export function migrateProject(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const version = (raw as { schemaVersion?: unknown }).schemaVersion;
  if (version === PROJECT_SCHEMA_VERSION) return raw;
  return raw;
}
