import { Suspense } from "react";
import { connection } from "next/server";
import { Bot, Database, Flame, Globe, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Badge, Panel, Skeleton } from "@/components/ui/misc";
import { getContentGenerator } from "@/server/content";
import { getDataDir, getProjectRepository } from "@/server/storage";

export const metadata = { title: "Integrações" };

function Card({ icon, title, status, tone, children }: { icon: React.ReactNode; title: string; status: string; tone: "ok" | "warn" | "neutral"; children: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink-800 text-cyan-glow">{icon}</span>
          <h2 className="font-display font-semibold">{title}</h2>
        </div>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <div className="space-y-2 text-sm text-fg-muted">{children}</div>
    </Panel>
  );
}

/** Lê o estado das integrações no servidor (variáveis de ambiente nunca são enviadas ao navegador). */
async function IntegrationStatus() {
  await connection();
  const repo = getProjectRepository();
  const { status } = getContentGenerator();
  const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const aiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card icon={<Database className="size-4" aria-hidden />} title="Armazenamento" status={repo.driver.label} tone="ok">
        <p>{repo.driver.scope}</p>
        <p>
          Pasta: <code className="break-all text-fg">{getDataDir()}</code>
        </p>
        <p className="text-xs text-fg-subtle">Faça cópias de segurança desta pasta. Ela não é enviada ao Git (.gitignore).</p>
      </Card>
      <Card icon={<Bot className="size-4" aria-hidden />} title="Geração de conteúdo" status={status.active.kind === "ai" ? "IA ativa" : "Sem IA (regras locais)"} tone={status.active.kind === "ai" ? "ok" : "neutral"}>
        <p>
          Provedor ativo: <strong className="text-fg">{status.active.label}</strong>. Sugestões são montadas por regras a partir dos
          dados do negócio, sem custo e sem serviços externos.
        </p>
        {status.warning && <p className="text-warn">{status.warning}</p>}
        {aiKeyPresent && <p className="text-warn">Uma chave de IA foi encontrada no ambiente, mas nenhum provedor de IA está implementado ainda — ela não é usada.</p>}
        <p className="text-xs text-fg-subtle">FASE 8: integrar um provedor de IA após definir requisitos, custos e limites (ver docs/INTEGRACOES.md).</p>
      </Card>
      <Card icon={<KeyRound className="size-4" aria-hidden />} title="Autenticação" status="Não implementada" tone="warn">
        <p>O Studio funciona em modo local de usuário único. Por isso o servidor escuta apenas em 127.0.0.1.</p>
        <p className="text-xs text-fg-subtle">FASE 9: login real com verificação no servidor e controle de acesso por projeto.</p>
      </Card>
      <Card icon={<Flame className="size-4" aria-hidden />} title="Firebase" status={firebaseConfigured ? "Variáveis encontradas" : "Não configurado"} tone={firebaseConfigured ? "warn" : "neutral"}>
        <p>
          {firebaseConfigured
            ? "Variáveis do Firebase foram encontradas, mas o driver Firebase ainda não foi implementado — os dados continuam locais."
            : "Nenhum projeto Firebase configurado. A camada de dados já está separada para receber esse driver."}
        </p>
      </Card>
      <Card icon={<Globe className="size-4" aria-hidden />} title="Publicação e domínios" status="Não implementada" tone="warn">
        <p>Sites podem ser pré-visualizados localmente e exportados em JSON. Hospedagem e domínios próprios ainda não existem.</p>
      </Card>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader eyebrow="Plataforma" title="Integrações" description="Estado real de cada serviço nesta instalação." />
      <Suspense fallback={<Skeleton className="h-64" />}>
        <IntegrationStatus />
      </Suspense>
    </>
  );
}
