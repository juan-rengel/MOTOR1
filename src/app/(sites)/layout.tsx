import { SITE_MOTION_SCRIPT } from "@/features/animations/site-motion-script";

/** Layout das páginas que exibem sites (demonstrações e pré-visualizações). */
export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SITE_MOTION_SCRIPT }} />
      {children}
    </>
  );
}
