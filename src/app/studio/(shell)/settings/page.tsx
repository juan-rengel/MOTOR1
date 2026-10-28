import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Notice, Panel } from "@/components/ui/misc";
import { platformConfig } from "@/config/platform";

export const metadata = { title: "Conta" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Conta" title="Conta e acesso" />
      <div className="grid max-w-3xl gap-4">
        <Panel className="p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
            <div className="space-y-2 text-sm text-fg-muted">
              <p className="font-medium text-fg">Modo local, sem autenticação</p>
              <p>
                Esta versão do {platformConfig.name} roda na sua máquina e não tem contas de usuário. Qualquer pessoa com acesso a
                este computador e ao servidor local pode editar os projetos.
              </p>
              <p>
                Não implementamos um “login” apenas no navegador porque ele não protegeria nada de verdade. A autenticação real
                (com verificação no servidor) está planejada para a FASE 9.
              </p>
            </div>
          </div>
        </Panel>
        <Notice title="Versão">
          {platformConfig.name} {platformConfig.version} · {platformConfig.engine}
        </Notice>
      </div>
    </>
  );
}
