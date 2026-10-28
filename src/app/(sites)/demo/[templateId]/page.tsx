import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { visualStyleIdSchema } from "@/domain/theme";
import { createTemplateDemo } from "@/features/templates/create-project";
import { getTemplate } from "@/features/templates/registry";
import { SiteRenderer } from "@/features/site-renderer/site-renderer";
import { SiteStatusBanner } from "../../site-banner";

export async function generateMetadata({ params }: PageProps<"/demo/[templateId]">): Promise<Metadata> {
  const { templateId } = await params;
  const template = getTemplate(templateId);
  return { title: template ? `Demonstração: ${template.name}` : "Modelo não encontrado", robots: { index: false } };
}

async function Demo({ params, searchParams }: PageProps<"/demo/[templateId]">) {
  // Renderizado sob demanda: o conteúdo gera identificadores aleatórios para seções.
  await connection();
  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();
  const styleParam = (await searchParams).style;
  const style = visualStyleIdSchema.safeParse(styleParam);
  const project = createTemplateDemo(template, style.success ? style.data : undefined);
  return (
    <>
      <SiteRenderer project={project} mode="demo" />
      <SiteStatusBanner
        text={`Demonstração do modelo "${template.name}" — empresa fictícia, conteúdo de exemplo.`}
        actionHref="/studio/new"
        actionLabel="Criar meu site"
      />
    </>
  );
}

export default function DemoPage(props: PageProps<"/demo/[templateId]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" aria-busy="true" />}>
      <Demo {...props} />
    </Suspense>
  );
}
