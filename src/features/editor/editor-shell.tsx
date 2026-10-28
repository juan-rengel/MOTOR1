"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Building2,
  ExternalLink,
  Film,
  LayoutList,
  Monitor,
  Palette,
  Redo2,
  Rocket,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import type { Project } from "@/domain/project";
import { Button, buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, Notice } from "@/components/ui/misc";
import { Logo } from "@/components/studio/logo";
import { cn } from "@/lib/cn";
import { checkProject, type ProjectIssue } from "./project-checks";
import { PreviewFrame, VIEWPORTS, type Viewport } from "./preview-frame";
import { useEditor } from "./use-editor";
import { BrandPanel } from "./panels/brand-panel";
import { BusinessPanel } from "./panels/business-panel";
import { MotionPanel } from "./panels/motion-panel";
import { PublishPanel } from "./panels/publish-panel";
import { ScenePanel } from "./panels/scene-panel";
import { SectionsPanel, sectionLabel } from "./panels/sections-panel";
import { SettingsPanel } from "./panels/settings-panel";

const TABS = [
  { id: "sections", label: "Seções", icon: LayoutList },
  { id: "business", label: "Negócio", icon: Building2 },
  { id: "brand", label: "Identidade", icon: Palette },
  { id: "motion", label: "Movimento", icon: Film },
  { id: "scene", label: "Cena 3D", icon: Box },
  { id: "settings", label: "Projeto", icon: Settings2 },
  { id: "publish", label: "Publicar", icon: Rocket },
] as const;
type TabId = (typeof TABS)[number]["id"];

const VIEWPORT_ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone } as const;

function isTypingTarget(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function EditorShell({ initialProject }: { initialProject: Project }) {
  const router = useRouter();
  const { state, dispatch, dirty, save, saveStatus, setSaveStatus, reloadFromServer } = useEditor(initialProject);
  const { project, selectedSectionId } = state;
  const [tab, setTab] = useState<TabId>("sections");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [motionDisabled, setMotionDisabled] = useState(false);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [scrollRequest, setScrollRequest] = useState<{ sectionId: string; nonce: number } | null>(null);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);

  const issues = useMemo(() => checkProject(project, sectionLabel), [project]);

  function selectSection(id: string, scroll = true) {
    dispatch({ type: "select", sectionId: id });
    if (scroll) setScrollRequest((prev) => ({ sectionId: id, nonce: (prev?.nonce ?? 0) + 1 }));
  }

  function openIssue(issue: ProjectIssue) {
    setTab(issue.tab);
    if (issue.sectionId) selectSection(issue.sectionId);
    setIssuesOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        void save();
      } else if (!isTypingTarget(e.target) && key === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (!isTypingTarget(e.target) && key === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, dispatch]);

  const statusLabel =
    saveStatus.kind === "saving"
      ? "Salvando…"
      : saveStatus.kind === "error"
        ? "Erro ao salvar"
        : saveStatus.kind === "conflict"
          ? "Conflito de versão"
          : dirty
            ? "Alterações não salvas"
            : "Tudo salvo";
  const warningCount = issues.filter((i) => i.level !== "info").length;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink-950">
      {/* Barra superior */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-ink-900 px-3 sm:gap-3">
        <Link
          href="/studio"
          onClick={(e) => {
            if (dirty) {
              e.preventDefault();
              setLeaveOpen(true);
            }
          }}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-fg-muted hover:bg-ink-800 hover:text-fg"
          aria-label="Voltar aos projetos"
        >
          <ArrowLeft className="size-4" aria-hidden />
          <span className="hidden xl:inline">
            <Logo compact />
          </span>
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">{project.business.name || "Sem nome"}</p>
          <p className={cn("text-[11px]", dirty || saveStatus.kind === "error" || saveStatus.kind === "conflict" ? "text-warn" : "text-fg-subtle")} role="status" aria-live="polite">
            {statusLabel}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="ghost" aria-label="Desfazer (Ctrl+Z)" title="Desfazer (Ctrl+Z)" disabled={state.past.length === 0} onClick={() => dispatch({ type: "undo" })} icon={<Undo2 className="size-4" aria-hidden />} />
          <Button size="sm" variant="ghost" aria-label="Refazer (Ctrl+Shift+Z)" title="Refazer (Ctrl+Shift+Z)" disabled={state.future.length === 0} onClick={() => dispatch({ type: "redo" })} icon={<Redo2 className="size-4" aria-hidden />} />
          <span className="mx-1 hidden h-5 w-px bg-line md:block" aria-hidden />
          <div className="hidden items-center rounded-lg border border-line p-0.5 md:flex" role="group" aria-label="Tamanho da pré-visualização">
            {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
              const Icon = VIEWPORT_ICONS[v];
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={viewport === v}
                  aria-label={VIEWPORTS[v].label}
                  title={VIEWPORTS[v].label}
                  onClick={() => {
                    setViewport(v);
                    // A largura muda o layout do site: volta para a seção selecionada.
                    if (selectedSectionId) setTimeout(() => setScrollRequest((prev) => ({ sectionId: selectedSectionId, nonce: (prev?.nonce ?? 0) + 1 })), 600);
                  }}
                  className={cn("rounded-md p-1.5 transition-colors", viewport === v ? "bg-cyan-glow/15 text-cyan-soft" : "text-fg-subtle hover:text-fg")}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              );
            })}
          </div>
          <Button size="sm" variant="ghost" aria-pressed={!motionDisabled} onClick={() => setMotionDisabled((v) => !v)} className="hidden md:inline-flex" title="Ligar/desligar animações na pré-visualização">
            <Film className="size-4" aria-hidden /> {motionDisabled ? "Sem movimento" : "Movimento"}
          </Button>
          <div className="relative">
            <Button size="sm" variant="ghost" aria-expanded={issuesOpen} onClick={() => setIssuesOpen((v) => !v)} title="Revisão do projeto">
              <AlertTriangle className={cn("size-4", warningCount ? "text-warn" : "text-ok")} aria-hidden />
              <span className="hidden sm:inline">{warningCount ? `${warningCount} alerta(s)` : "Revisão"}</span>
            </Button>
            {issuesOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-[min(92vw,380px)] rounded-xl border border-line-strong bg-ink-850 p-3 shadow-2xl">
                <p className="mb-2 px-1 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Revisão do projeto</p>
                {issues.length === 0 ? (
                  <p className="px-1 py-2 text-sm text-ok">Nenhum problema encontrado.</p>
                ) : (
                  <ul className="scrollbar-thin max-h-80 space-y-1 overflow-y-auto">
                    {issues.map((i) => (
                      <li key={i.id}>
                        <button type="button" onClick={() => openIssue(i)} className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-ink-700">
                          <Badge tone={i.level === "error" ? "danger" : i.level === "warning" ? "warn" : "neutral"} className="mr-2">
                            {i.level === "error" ? "Erro" : i.level === "warning" ? "Alerta" : "Dica"}
                          </Badge>
                          <span className="text-fg-muted">{i.message}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <a href={`/preview/${project.id}`} target="_blank" rel="noreferrer" className={buttonClasses("ghost", "sm", "hidden lg:inline-flex")} title="Abrir a versão salva em nova aba">
            <ExternalLink className="size-4" aria-hidden /> Visualizar
          </a>
          <Button size="sm" variant="primary" onClick={() => void save()} disabled={saveStatus.kind === "saving" || (!dirty && saveStatus.kind !== "error")} icon={<Save className="size-4" aria-hidden />}>
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </div>
      </header>

      {/* Alternância no celular */}
      <div className="flex border-b border-line bg-ink-900 lg:hidden" role="tablist" aria-label="Modo">
        {(["edit", "preview"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mobileView === m} onClick={() => setMobileView(m)} className={cn("flex-1 py-2.5 text-sm", mobileView === m ? "border-b-2 border-cyan-glow text-fg" : "text-fg-muted")}>
            {m === "edit" ? "Editar" : "Visualizar"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Painel lateral */}
        <aside className={cn("flex w-full min-w-0 flex-col border-r border-line bg-ink-900/60 lg:w-[400px] lg:shrink-0", mobileView === "preview" && "hidden lg:flex")} aria-label="Painel de edição">
          <nav className="scrollbar-thin flex shrink-0 gap-1 overflow-x-auto border-b border-line px-2 py-2" role="tablist" aria-label="Áreas do editor">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={cn("flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors", tab === id ? "bg-cyan-glow/15 text-cyan-soft" : "text-fg-muted hover:bg-ink-800 hover:text-fg")}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </nav>
          <div id={`panel-${tab}`} role="tabpanel" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
            {saveStatus.kind === "error" && (
              <Notice tone="danger" className="mb-4">
                {saveStatus.message}
              </Notice>
            )}
            {frameError && (
              <Notice tone="warn" className="mb-4" title="A pré-visualização não aceitou a última alteração">
                {frameError}
              </Notice>
            )}
            {project.flags.demoContent && tab === "sections" && (
              <Notice tone="warn" className="mb-4">
                Conteúdo demonstrativo: substitua textos e imagens pelos reais do negócio antes de publicar.
              </Notice>
            )}
            {tab === "sections" && <SectionsPanel project={project} selectedId={selectedSectionId} dispatch={dispatch} onSelect={(id) => selectSection(id)} />}
            {tab === "business" && <BusinessPanel project={project} dispatch={dispatch} />}
            {tab === "brand" && <BrandPanel project={project} dispatch={dispatch} />}
            {tab === "motion" && <MotionPanel project={project} dispatch={dispatch} />}
            {tab === "scene" && (
              <ScenePanel
                project={project}
                dispatch={dispatch}
                onAddStory={() => {
                  dispatch({ type: "addSection", sectionType: "sceneStory", afterId: null });
                  setTab("sections");
                }}
              />
            )}
            {tab === "settings" && <SettingsPanel project={project} dispatch={dispatch} />}
            {tab === "publish" && <PublishPanel project={project} issues={issues} dispatch={dispatch} dirty={dirty} />}
          </div>
        </aside>

        {/* Pré-visualização */}
        <section className={cn("studio-grid min-w-0 flex-1", mobileView === "edit" && "hidden lg:block")} aria-label="Pré-visualização">
          <PreviewFrame
            project={project}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            motionDisabled={motionDisabled}
            scrollRequest={scrollRequest}
            onSelectSection={(id) => {
              selectSection(id, false);
              setTab("sections");
            }}
            onInvalid={(message) => setFrameError(message)}
          />
        </section>
      </div>

      <ConfirmDialog
        open={leaveOpen}
        title="Sair sem salvar?"
        description="Há alterações que ainda não foram salvas e serão perdidas."
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar editando"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false);
          router.push("/studio");
        }}
      />
      <ConfirmDialog
        open={saveStatus.kind === "conflict"}
        tone="primary"
        title="O projeto foi alterado em outro lugar"
        description="Outra aba ou janela salvou uma versão mais nova. Você pode recarregar a versão salva (descarta suas alterações) ou sobrescrevê-la com a sua."
        confirmLabel="Sobrescrever com a minha versão"
        cancelLabel="Recarregar versão salva"
        onConfirm={() => void save({ force: true })}
        onCancel={() => void reloadFromServer().catch(() => setSaveStatus({ kind: "error", message: "Falha ao recarregar." }))}
      />
    </div>
  );
}
