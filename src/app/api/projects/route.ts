import { createProjectFromTemplate, createProjectInputSchema } from "@/features/templates/create-project";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { readJsonBody, rejectCrossOrigin } from "@/server/http/request-guards";
import { handleRouteError, jsonError, zodIssues } from "@/server/http/responses";
import { getProjectRepository } from "@/server/storage";

export async function GET() {
  try {
    const owner = await getCurrentOwner();
    const projects = await getProjectRepository().list(owner.id);
    return Response.json({ projects });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Cria um projeto a partir de um modelo. Validação completa no servidor. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const body = await readJsonBody(request, 64 * 1024);
    if (!body.ok) return body.response;
    const parsed = createProjectInputSchema.safeParse(body.data);
    if (!parsed.success) return jsonError(422, "validation", "Dados do projeto inválidos.", zodIssues(parsed.error));

    const owner = await getCurrentOwner();
    const project = createProjectFromTemplate(parsed.data, { ownerId: owner.id });
    const created = await getProjectRepository().create(project);
    return Response.json({ project: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
