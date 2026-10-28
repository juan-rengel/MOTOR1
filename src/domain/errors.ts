/** Erros de domínio com código estável, convertidos em respostas HTTP pela camada de API. */
export class DomainError extends Error {
  constructor(
    readonly code: "not_found" | "conflict" | "validation" | "forbidden" | "unsupported",
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const notFound = (message = "Recurso não encontrado.") => new DomainError("not_found", message);
export const conflict = (message: string) => new DomainError("conflict", message);
export const validationError = (message: string, details?: unknown) =>
  new DomainError("validation", message, details);
