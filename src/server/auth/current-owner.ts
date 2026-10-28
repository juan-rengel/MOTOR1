import "server-only";

/**
 * Identidade do proprietário da requisição.
 *
 * FASE ATUAL: não há autenticação. Toda requisição age como o proprietário
 * "local" (uso em uma única máquina). O servidor de desenvolvimento escuta
 * apenas em 127.0.0.1 justamente por isso.
 *
 * FASE 9: substituir por verificação de sessão (ex.: Firebase Auth via cookie
 * de sessão verificado no servidor). Todas as rotas já passam o ownerId ao
 * repositório, então o controle de acesso por usuário/projeto se encaixa aqui.
 */
export interface Owner {
  id: string;
  kind: "local";
}

export async function getCurrentOwner(): Promise<Owner> {
  return { id: "local", kind: "local" };
}
