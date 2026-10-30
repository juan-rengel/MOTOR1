---
name: verificar
description: Verificação completa do MOTOR1 — tipos, lint, testes unitários, build de produção e testes ponta a ponta (Playwright + axe) — com relatório fiel do que passou, falhou ou não pôde ser executado. Use antes de concluir qualquer etapa, antes de commits e sempre que pedirem para testar ou validar o projeto.
---

# Verificar o MOTOR1

Regra central: **nunca declare aprovado o que não foi executado.** Cada linha do relatório vem da saída real do comando.

## Pré-condições

- `node_modules` presente. Se não estiver, **não instale por conta própria**: informe e peça autorização para `npm install` (ou `npm ci`).
- Node ≥ 20.9 (`node --version`).
- Para os testes ponta a ponta: navegador do Playwright disponível.
  - No Windows (máquina do responsável), a primeira execução exige `npx playwright install chromium`, que **baixa** o navegador (download grande). É uma instalação: peça autorização antes.
  - Em ambientes de nuvem com Chromium pré-instalado, não rode `playwright install`.
- **`npx` só com dependências instaladas.** Sem `node_modules`, `npx <pacote>` baixa o pacote da internet — isso é instalar sem autorização. Prefira os scripts `npm run …`, que usam apenas o que já está instalado; `npx` pede confirmação em `.claude/settings.json`.

## Sequência (pare e relate na primeira falha que impeça as seguintes)

| # | Comando | O que confere | Aprovação |
|---|---|---|---|
| 1 | `npm run typecheck` | Tipos (inclui `next typegen`) | saída sem erros |
| 2 | `npm run lint` | ESLint (inclui regras de hooks do React) | 0 problemas |
| 3 | `npm run test` | Vitest: domínio, repositório, modelos, editor | todos passam; anote o total |
| 4 | `npm run build` | Build de produção | conclui sem erros; anote avisos |
| 5 | `npm run test:e2e` | Playwright contra o build na porta 3100, dados isolados em `.data-test` | todos passam; anote o total |

Atalhos: `npm run check` = 1 + 2 + 3. `npm run test:e2e:full` = 4 + 5.

Observações:
- A porta 3100 precisa estar livre para o passo 5. Não encerre processos de outras pessoas; se a porta estiver ocupada, informe.
- Sem GPU, as cenas 3D rodam em software (SwiftShader) e os testes de 3D são lentos; isso é esperado.
- Não altere testes para fazê-los passar. Se um teste estiver errado, explique por quê e proponha a correção no plano.
- Falhas intermitentes: rode o teste isolado novamente (`npm run test:e2e -- -g "<nome>"`) e relate as duas execuções.

## Verificações complementares (quando a mudança tocar nestes pontos)

- **Segurança/API**: os testes `tests/e2e/api.spec.ts` cobrem origem cruzada, validação e uploads; para mudanças em `src/server` ou `src/app/api`, use também a skill `security-review`.
- **Visual**: mudanças em componentes, tema, modelos ou cenas → skill `revisao-visual`.
- **Segredos**: `git diff --cached` não pode conter chaves, tokens, `.env` (exceto `.env.example` sem valores) nem dados de `.data/`.
- **Escopo**: `git status` deve mostrar apenas arquivos do plano aprovado.

## Relatório (formato)

```
Verificação — <data>
| Etapa | Comando | Resultado |
| Tipos | npm run typecheck | ✅ sem erros |
| Lint | npm run lint | ✅ 0 problemas |
| Unitários | npm run test | ✅ N testes, M arquivos |
| Build | npm run build | ✅ (avisos: …) |
| Ponta a ponta | npm run test:e2e | ❌ 1 falha: <nome> — <motivo> |
Não executado: <item> — <motivo>
```

Ao concluir uma etapa, a tabela vai para "Testes realizados" em `docs/STATUS.md`, com a data — **somente se a atualização do STATUS fizer parte do plano aprovado**. Caso contrário, apresente a tabela no relatório e aguarde.
