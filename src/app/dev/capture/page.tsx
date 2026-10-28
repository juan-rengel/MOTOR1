import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaptureView } from "./capture-view";

/**
 * Página de captura de imagens de demonstração (somente em desenvolvimento).
 * Em produção responde 404.
 */
async function Capture({ searchParams }: PageProps<"/dev/capture">) {
  if (process.env.NODE_ENV !== "development") notFound();
  const shot = (await searchParams).shot;
  return <CaptureView shotId={typeof shot === "string" ? shot : ""} />;
}

export default function CapturePage(props: PageProps<"/dev/capture">) {
  return (
    <Suspense fallback={null}>
      <Capture {...props} />
    </Suspense>
  );
}
