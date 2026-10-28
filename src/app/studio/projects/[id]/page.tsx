import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EditorShell } from "@/features/editor/editor-shell";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { getProjectRepository } from "@/server/storage";

export const metadata: Metadata = { title: "Editor" };

async function EditorLoader({ params }: PageProps<"/studio/projects/[id]">) {
  await connection();
  const { id } = await params;
  const owner = await getCurrentOwner();
  const project = await getProjectRepository().get(owner.id, id);
  if (!project) notFound();
  return <EditorShell initialProject={project} />;
}

export default function EditorPage(props: PageProps<"/studio/projects/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-ink-950 text-sm text-fg-muted" role="status">
          Abrindo editor…
        </div>
      }
    >
      <EditorLoader {...props} />
    </Suspense>
  );
}
