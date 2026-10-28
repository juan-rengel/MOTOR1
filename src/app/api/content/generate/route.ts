import { contentRequestSchema } from "@/features/content/types";
import { getContentGenerator } from "@/server/content";
import { readJsonBody, rejectCrossOrigin } from "@/server/http/request-guards";
import { handleRouteError, jsonError, zodIssues } from "@/server/http/responses";

/** Gera sugestões de texto com o provedor configurado no servidor. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const body = await readJsonBody(request, 32 * 1024);
    if (!body.ok) return body.response;
    const parsed = contentRequestSchema.safeParse(body.data);
    if (!parsed.success) return jsonError(422, "validation", "Pedido inválido.", zodIssues(parsed.error));
    const { generator } = getContentGenerator();
    const suggestion = await generator.generate(parsed.data);
    return Response.json({ suggestion });
  } catch (error) {
    return handleRouteError(error);
  }
}
