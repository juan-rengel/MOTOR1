import { Suspense } from "react";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { PageHeader } from "@/components/studio/page-header";
import { ProjectGrid } from "@/features/projects/project-grid";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { getProjectRepository } from "@/server/storage";

export const metadata = { title: "Projetos" };

async function ProjectList() {
  await connection();
  const owner = await getCurrentOwner();
  const repository = getProjectRepository();
  const projects = await repository.list(owner.id);
  return <ProjectGrid projects={projects} storageScope={repository.driver.scope} />;
}

function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Carregando projetos">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Studio"
        title="Seus projetos"
        description="Sites criados nesta instalação. Abra um projeto para editar, pré-visualizar e preparar a publicação."
        actions={
          <ButtonLink href="/studio/new" variant="primary" icon={<Plus className="size-4" aria-hidden />}>
            Criar novo site
          </ButtonLink>
        }
      />
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList />
      </Suspense>
    </>
  );
}
