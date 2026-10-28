import { DEMO_SHOTS } from "@/features/scenes3d/demo-shots";

/** Lista de enquadramentos para o script de captura (somente em desenvolvimento). */
export async function GET() {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  return Response.json(DEMO_SHOTS.map(({ id, file, width, height }) => ({ id, file, width, height })));
}
