import { PageHeader } from "@/components/studio/page-header";
import { NewProjectWizard } from "@/features/projects/wizard/new-project-wizard";

export const metadata = { title: "Criar novo site" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Novo projeto"
        title="Criar novo site"
        description="Quatro etapas: dados do negócio, estilo visual, modelo inicial e revisão. Campos opcionais podem ficar em branco."
      />
      <NewProjectWizard />
    </div>
  );
}
