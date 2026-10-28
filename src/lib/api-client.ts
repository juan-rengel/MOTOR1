/** Cliente HTTP do Studio: trata erros da API de forma uniforme. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues: Array<{ path: string; message: string }> = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let response: Response;
  try {
    response = await fetch(input, {
      ...rest,
      headers: { ...(json !== undefined ? { "content-type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, "network", "Não foi possível conectar ao servidor local. Ele está em execução?");
  }
  if (response.status === 204) return undefined as T;
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // corpo vazio ou não-JSON
  }
  if (!response.ok) {
    const err = (data as { error?: { code?: string; message?: string; issues?: ApiError["issues"] } } | null)?.error;
    throw new ApiError(response.status, err?.code ?? "http_error", err?.message ?? `Erro ${response.status}.`, err?.issues);
  }
  return data as T;
}
