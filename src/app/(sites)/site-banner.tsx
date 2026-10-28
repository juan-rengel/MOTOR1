import Link from "next/link";
import { Info } from "lucide-react";

/** Faixa discreta que deixa claro o status da página (demonstração ou prévia local). */
export function SiteStatusBanner({ text, actionHref, actionLabel }: { text: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="fixed bottom-4 left-4 z-[90] flex max-w-[calc(100vw-6rem)] items-center gap-3 rounded-full border border-white/15 bg-black/75 py-2 pr-2 pl-4 text-xs text-white shadow-xl backdrop-blur-md" role="note">
      <Info className="size-3.5 shrink-0 text-cyan-300" aria-hidden />
      <span className="truncate">{text}</span>
      {actionHref && (
        <Link href={actionHref} className="shrink-0 rounded-full bg-cyan-400 px-3 py-1 font-medium text-black hover:bg-cyan-300">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
