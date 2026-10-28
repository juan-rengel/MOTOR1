import "@fontsource-variable/oswald";
import Link from "next/link";
import { ArrowRight, Box, Check, Clapperboard, Clock3, LayoutTemplate, MessageCircle, MonitorSmartphone, PencilRuler, Sparkles } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { Logo } from "@/components/studio/logo";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { segmentLabel } from "@/config/labels";
import { TEMPLATES } from "@/features/templates/registry";

const FEATURES = [
  { icon: Box, title: "Cenas 3D", text: "Objetos tridimensionais com luz de estúdio, reflexos e câmera que acompanha a rolagem — com imagem substituta para aparelhos sem suporte." },
  { icon: Clapperboard, title: "Animações cinematográficas", text: "Revelação de títulos e imagens, parallax e transições, com padrões de duração e respeito a quem prefere menos movimento." },
  { icon: PencilRuler, title: "Editor visual", text: "Seções, textos, imagens, botões, cores e tipografia, com pré-visualização ao vivo e desfazer/refazer." },
  { icon: LayoutTemplate, title: "Modelos por segmento", text: "Estruturas pensadas para cada tipo de negócio, compartilhando os mesmos componentes e motores." },
  { icon: MessageCircle, title: "Pronto para WhatsApp", text: "Botões, catálogo e formulário que abrem a conversa com a mensagem pronta — o visitante confirma o envio." },
  { icon: MonitorSmartphone, title: "Responsivo e acessível", text: "Pré-visualização em computador, tablet e celular; contraste verificado, navegação por teclado e textos alternativos." },
];

const DONE = [
  "Criação de projetos em 4 etapas e salvamento local",
  "Modelos: oficina mecânica, ótica e loja de roupas/tênis",
  "Editor de seções, conteúdo, identidade, movimento e cena 3D",
  "Cenas 3D procedurais com câmera cinematográfica",
  "Biblioteca de recursos com upload validado",
  "Pré-visualização responsiva e exportação do projeto",
];
const NEXT = [
  "Integração com IA para textos (FASE 8)",
  "Contas de usuário e dados na nuvem (FASE 9)",
  "Publicação real, hospedagem e domínios (FASE 10)",
];

export default function HomePage() {
  const showcase = TEMPLATES[0];
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(60%_50%_at_70%_10%,rgba(34,211,238,0.16),transparent_70%)]" aria-hidden />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label={`${platformConfig.name} — início`}>
          <Logo />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-6">
          <a href="#recursos" className="hidden text-sm text-fg-muted hover:text-fg sm:inline">Recursos</a>
          <a href="#modelos" className="hidden text-sm text-fg-muted hover:text-fg sm:inline">Modelos</a>
          <a href="#status" className="hidden text-sm text-fg-muted hover:text-fg sm:inline">Status</a>
          <ButtonLink href="/studio" size="sm" variant="secondary">
            Abrir Studio
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section className="studio-grid relative mx-auto grid max-w-7xl items-center gap-12 px-5 pt-12 pb-24 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div className="animate-rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-cyan-soft uppercase">
              <Sparkles className="size-3.5" aria-hidden /> {platformConfig.engine}
            </p>
            <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] font-semibold tracking-tight">
              Sites comerciais com <span className="bg-gradient-to-r from-cyan-soft to-cyan-deep bg-clip-text text-transparent">linguagem de cinema</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-fg-muted">
              Crie sites para pequenos e médios negócios com cenas 3D, animações e modelos especializados — e edite tudo
              visualmente, com pré-visualização em qualquer tela.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/studio/new" variant="primary" size="lg" icon={<Sparkles className="size-4" aria-hidden />}>
                Criar novo site
              </ButtonLink>
              {showcase && (
                <ButtonLink href={`/demo/${showcase.id}`} size="lg" variant="secondary">
                  Ver demonstração <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              )}
            </div>
          </div>
          {showcase && (
            <div className="animate-rise relative [animation-delay:150ms]">
              <div className="overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-[0_40px_120px_-30px_rgba(34,211,238,0.35)]">
                <div className="flex items-center gap-1.5 border-b border-line px-4 py-3" aria-hidden>
                  <span className="size-2.5 rounded-full bg-ink-600" />
                  <span className="size-2.5 rounded-full bg-ink-600" />
                  <span className="size-2.5 rounded-full bg-ink-600" />
                  <span className="ml-3 h-5 flex-1 rounded bg-ink-800" />
                </div>
                <div className="relative aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagem local gerada pela cena 3D */}
                  <img src={showcase.preview.src} alt={showcase.preview.alt} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" aria-hidden />
                  <div className="absolute top-1/2 left-6 max-w-[55%] -translate-y-1/2" aria-hidden>
                    <p className="font-['Oswald_Variable'] text-[clamp(1.2rem,2.6vw,2rem)] leading-none font-semibold text-white uppercase">Precisão em cada detalhe</p>
                    <span className="mt-3 inline-block rounded-sm bg-[#e8b04a] px-3 py-1.5 text-[11px] font-semibold text-black">Pedir orçamento</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 flex flex-wrap gap-2 sm:-left-6" aria-hidden>
                {["Cena 3D", "Câmera na rolagem", "WhatsApp"].map((chip) => (
                  <span key={chip} className="rounded-full border border-cyan-glow/40 bg-ink-900/90 px-3 py-1.5 text-xs text-cyan-soft backdrop-blur">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section id="recursos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">O que o Motor 1 faz</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-line bg-ink-900/70 p-6 transition-colors hover:border-cyan-glow/40">
                <Icon className="size-5 text-cyan-glow" aria-hidden />
                <h3 className="mt-4 font-display font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-fg-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="modelos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Modelos</h2>
          <p className="mt-2 max-w-2xl text-fg-muted">Demonstrações com empresas fictícias e conteúdo de exemplo.</p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <Link href={`/demo/${t.id}`} className="group block overflow-hidden rounded-xl border border-line bg-ink-900 transition-colors hover:border-cyan-glow/50">
                  <div className="aspect-[16/10] overflow-hidden bg-ink-800">
                    {/* eslint-disable-next-line @next/next/no-img-element -- imagem local de demonstração */}
                    <img src={t.preview.src} alt={t.preview.alt} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {t.segments.map((s) => (
                        <Badge key={s} tone="cyan">
                          {segmentLabel(s)}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">{t.name}</h3>
                    <p className="mt-1 text-sm text-fg-muted">{t.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="status" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Status do Motor 1</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-ink-900/70 p-6">
              <p className="mb-4 text-xs font-semibold tracking-wider text-ok uppercase">Funcionando localmente</p>
              <ul className="space-y-2.5 text-sm text-fg-muted">
                {DONE.map((d) => (
                  <li key={d} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-ink-900/70 p-6">
              <p className="mb-4 text-xs font-semibold tracking-wider text-warn uppercase">Próximas fases</p>
              <ul className="space-y-2.5 text-sm text-fg-muted">
                {NEXT.map((d) => (
                  <li key={d} className="flex gap-2">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-fg-subtle sm:flex-row sm:justify-between sm:px-8">
          <span>
            {platformConfig.name} {platformConfig.version}
          </span>
          <span>{platformConfig.tagline}</span>
        </div>
      </footer>
    </div>
  );
}
