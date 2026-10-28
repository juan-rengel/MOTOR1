import Link from "next/link";
import { platformConfig } from "@/config/platform";
import { Logo } from "@/components/studio/logo";
import { StudioNav } from "@/components/studio/studio-nav";
import { ToastProvider } from "@/components/ui/toast";

export default function StudioShellLayout({ children }: LayoutProps<"/studio">) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-ink-900/70 px-4 py-5 lg:flex">
        <Link href="/" className="mb-8 px-2" aria-label={`${platformConfig.name} — página inicial`}>
          <Logo />
        </Link>
        <StudioNav />
        <div className="mt-auto rounded-lg border border-line bg-ink-850 p-3 text-xs text-fg-subtle">
          <p className="font-medium text-fg-muted">{platformConfig.engine}</p>
          <p className="mt-1">Modo local · dados salvos nesta instalação.</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-ink-950/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="mb-3 inline-block" aria-label={`${platformConfig.name} — página inicial`}>
            <Logo />
          </Link>
          <StudioNav orientation="horizontal" />
        </header>
        <ToastProvider>
          <main className="studio-grid min-h-screen px-4 py-8 sm:px-8 lg:px-10">{children}</main>
        </ToastProvider>
      </div>
    </div>
  );
}
