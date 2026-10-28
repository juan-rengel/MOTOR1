import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteRenderer } from "@/features/site-renderer/site-renderer";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { getProjectRepository } from "@/server/storage";
import { SiteStatusBanner } from "../../site-banner";

export const metadata: Metadata = { title: "Pré-visualização", robots: { index: false, follow: false } };

async function Preview({ params }: PageProps<"/preview/[id]">) {
  await connection();
  const { id } = await params;
  const owner = await getCurrentOwner();
  const project = await getProjectRepository().get(owner.id, id);
  if (!project) notFound();
  return (
    <>
      <title>{`${project.seo.title || project.business.name} · Pré-visualização`}</title>
      <SiteRenderer project={project} mode="live" />
      <SiteStatusBanner text="Pré-visualização local — este site não está publicado na internet." actionHref={`/studio/projects/${project.id}`} actionLabel="Editar" />
    </>
  );
}

export default function PreviewPage(props: PageProps<"/preview/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" aria-busy="true" />}>
      <Preview {...props} />
    </Suspense>
  );
}
