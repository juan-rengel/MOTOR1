import { z } from "zod";
import { projectSchema } from "@/domain/project";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { readJsonBody, rejectCrossOrigin } from "@/server/http/request-guards";
import { handleRouteError, jsonError, zodIssues } from "@/server/http/responses";
import { getProjectRepository } from "@/server/storage";

const MAX_PROJECT_BYTES = 1024 * 1024;

const updateBodySchema = z.object({
  project: projectSchema,
  /** Revisão que o editor carregou. Se divergir da gravada, a gravação é recusada (409). */
  expectedRevision: z.number().int().nonnegative(),
});

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await ctx.params;
    const owner = await getCurrentOwner();
    const project = await getProjectRepository().get(owner.id, id);
    if (!project) return jsonError(404, "not_found", "Projeto não encontrado.");
    return Response.json({ project });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const { id } = await ctx.params;
    const body = await readJsonBody(request, MAX_PROJECT_BYTES);
    if (!body.ok) return body.response;
    const parsed = updateBodySchema.safeParse(body.data);
    if (!parsed.success) return jsonError(422, "validation", "O projeto contém dados inválidos.", zodIssues(parsed.error));
    if (parsed.data.project.id !== id) return jsonError(400, "id_mismatch", "Identificador do projeto não confere.");

    const owner = await getCurrentOwner();
    const saved = await getProjectRepository().update(owner.id, parsed.data.project, parsed.data.expectedRevision);
    return Response.json({ project: saved });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const { id } = await ctx.params;
    const owner = await getCurrentOwner();
    const deleted = await getProjectRepository().delete(owner.id, id);
    if (!deleted) return jsonError(404, "not_found", "Projeto não encontrado.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
