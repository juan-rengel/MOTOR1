import { PageHeader } from "@/components/studio/page-header";
import { AssetLibrary } from "@/features/assets/asset-library";

export const metadata = { title: "Recursos" };

export default function AssetsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Recursos"
        description="Imagens, vídeos e modelos 3D usados nos sites. Uploads ficam salvos nesta instalação e são verificados pelo conteúdo do arquivo."
      />
      <AssetLibrary />
    </>
  );
}
