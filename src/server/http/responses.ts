import "server-only";
import { DomainError } from "@/domain/errors";
import { ZodError } from "zod";

export interface ApiErrorBody {
  error: { code: string; message: string; issues?: Array<{ path: string; message: string }> };
}

export function jsonError(status: number, code: string, message: string, issues?: ApiErrorBody["error"]["issues"]) {
  return Response.json({ error: { code, message, issues } } satisfies ApiErrorBody, { status });
}

export function zodIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.slice(0, 20).map((i) => ({ path: i.path.join("."), message: i.message }));
}

const STATUS_BY_CODE: Record<DomainError["code"], number> = {
  not_found: 404,
  conflict: 409,
  validation: 422,
  forbidden: 403,
  unsupported: 415,
};

/** Converte exceções em respostas JSON sem vazar detalhes internos. */
export function handleRouteError(error: unknown): Response {
  if (error instanceof DomainError) {
    return jsonError(STATUS_BY_CODE[error.code], error.code, error.message);
  }
  if (error instanceof ZodError) {
    return jsonError(422, "validation", "Dados inválidos.", zodIssues(error));
  }
  console.error("[api] Erro inesperado:", error instanceof Error ? error.message : "desconhecido");
  return jsonError(500, "internal", "Erro interno. Tente novamente.");
}
