# MOTOR1 — Cinematic Web Studio (instruções permanentes)

@AGENTS.md

Plataforma para criar sites comerciais cinematográficos para pequenos e médios negócios, com modelos específicos por segmento, editor visual, cenas 3D e animações. Este repositório é o **Motor 1** (construtor de sites). O Motor 2 (móveis em ambientes reais) está fora do escopo.

O responsável pelo projeto escreve em português do Brasil e desenvolve no **Windows 11**. Responda, documente e escreva textos de interface em pt-BR.

## Regras de trabalho (obrigatórias)

1. **Planejar antes de alterar.** Antes de qualquer modificação de qualquer arquivo do projeto (código, testes, documentação, configuração, mídia), apresente o plano (o que muda, por que, arquivos afetados, riscos, como será verificado) e **aguarde aprovação explícita**. Execute somente a etapa aprovada e somente os arquivos do plano; não avance para a seguinte sem nova aprovação.
2. **Preservar o que existe.** Não remova funcionalidades nem quebre projetos salvos. Não altere modelos existentes (`src/features/templates/*`) nem suas imagens e modelos 3D (`public/assets/demo/*`) **sem plano aprovado**. Mudanças no formato do projeto exigem migração em `src/domain/migrations.ts` e teste.
3. **Dependências.** Não instale, remova ou atualize pacotes e não altere `package.json`/`package-lock.json` sem autorização explícita. Prefira o que o projeto já tem.
4. **Comandos destrutivos** (`rm -rf`, `git reset --hard`, `git clean`, `git push --force`, apagar `.data/`, reescrever histórico publicado): explique o risco e peça autorização antes. Vários deles estão **bloqueados** em `.claude/settings.json` e continuam bloqueados mesmo com autorização: quando autorizados, o responsável os executa manualmente no próprio terminal. Não tente contornar um bloqueio com comandos equivalentes.
5. **Nada vai para a internet sem autorização explícita:** publicação, deploy, `git push`, envio de arquivos a serviços externos.
6. **Custos.** Não contrate serviços, não faça compras e não consuma créditos pagos (IA, bancos de imagem, hospedagem) sem autorização.
7. **Segredos.** Nunca peça chaves no chat, nunca as coloque no código do navegador (`NEXT_PUBLIC_` só para valores públicos) nem em arquivos versionados. `.env.example` contém apenas nomes de variáveis. Chaves ficam em `.env.local` (ignorado pelo Git).
8. **Fidelidade de conteúdo.** Não invente avaliações, depoimentos, certificações, prêmios, números de clientes, resultados comerciais, preços, telefones, endereços ou e-mails. Conteúdo de exemplo deve ser marcado como demonstrativo (`flags.demoContent`) e o editor deve lembrar de substituí-lo.
9. **Imagens e mídia.** Use apenas recursos com origem e licença verificadas e registradas em `docs/RECURSOS.md` (ver skill `recursos-demo`). Sem hotlink de imagens de terceiros.
10. **Honestidade funcional.** Não diga que um formulário envia dados a um servidor se a integração não existir. Nada é enviado sem ação explícita do visitante (WhatsApp/e-mail apenas abrem o aplicativo).
11. **Segurança.** Não implemente login baseado só em dados do navegador. Valide entradas no servidor (zod). Não renderize HTML do usuário (`dangerouslySetInnerHTML` só para o script fixo de movimento). Não configure Firebase e Supabase ao mesmo tempo por padrão.
12. **Testes reais.** Não declare um teste aprovado sem executá-lo e ler o resultado. Se algo não puder ser executado, diga isso claramente.
13. **Status.** A atualização de `docs/STATUS.md` (fases, testes executados com data, problemas conhecidos, próxima tarefa) faz parte do plano aprovado de cada etapa: liste-a no plano e só a faça quando aprovada.

## Comandos

| Objetivo | Comando |
|---|---|
| Servidor de desenvolvimento (http://127.0.0.1:3000) | `npm run dev` |
| Tipos | `npm run typecheck` |
| Lint | `npm run lint` |
| Testes unitários/integração (Vitest) | `npm run test` |
| Tipos + lint + unitários | `npm run check` |
| Build de produção | `npm run build` |
| Ponta a ponta contra o build (porta 3100, dados em `.data-test`) | `npm run test:e2e` (exige `npm run build` antes) ou `npm run test:e2e:full` |
| Imagens de demonstração a partir das cenas 3D (com `npm run dev` rodando; só com plano aprovado e sempre com ids) | `npm run assets:demo -- <id> <id>` |
| Modelo GLB demonstrativo (sobrescreve `chair.glb`; só com plano aprovado) | `npm run assets:model` |

`npm run assets:demo` **sem ids** regenera e sobrescreve todas as imagens dos modelos existentes: está bloqueado em `.claude/settings.json`. Ver skill `recursos-demo`.

Os scripts não usam comandos específicos de sistema operacional; mantenha assim (devem funcionar no PowerShell do Windows).

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript estrito (`noUncheckedIndexedAccess`) · Tailwind 4 (`@theme`) · zod 4 · three + @react-three/fiber + drei · GSAP + ScrollTrigger (`@gsap/react`) · lucide-react · fontes `@fontsource-variable` · Vitest + Testing Library · Playwright + axe.

Next 16 difere do que você conhece: leia o guia em `node_modules/next/dist/docs/` antes de usar APIs do framework. Pontos já adotados no projeto: `params` é Promise; `PageProps`/`LayoutProps` são tipos globais gerados por `next typegen`; I/O não cacheado fica dentro de `<Suspense>` com `await connection()`.

## Arquitetura (resumo — detalhes em `docs/ARQUITETURA.md`)

| Camada | Local |
|---|---|
| Domínio (schemas zod = fonte única de tipos; projeto como JSON versionado) | `src/domain` |
| Configuração (12 segmentos, 8 estilos, fontes, rótulos) | `src/config` |
| Modelos por segmento | `src/features/templates` (registro em `registry.ts`) |
| Textos por segmento (regras locais, sem IA) | `src/features/content` |
| Renderizador único (seções, cabeçalho, rodapé) | `src/features/site-renderer` |
| Motor de animações | `src/features/animations` |
| Motor 3D (cenas sob demanda, substituto sem WebGL) | `src/features/scenes3d` |
| Editor (reducer, prévia em iframe via `postMessage` validado) | `src/features/editor` |
| Servidor (repositório, uploads, identidade, HTTP) | `src/server`, `src/app/api` |
| Studio (administração) | `src/app/studio` — tokens `ink-*`/`cyan-*` em `src/app/globals.css` |
| Sites gerados | `src/app/(sites)` — tokens `site-*` vindos do tema do projeto |

Studio e sites gerados têm identidades visuais separadas; nenhum site herda o visual do Studio.

## Padrões de código

- Tipos vêm de `z.infer` dos schemas; não duplique tipos à mão.
- Siga o estilo do arquivo vizinho (nomes, densidade de comentários, idioma dos comentários em pt-BR).
- Valores do navegador (WebGL, movimento reduzido, nível do aparelho) via `useSyncExternalStore`; nada de `Date.now()`/`Math.random()` durante a renderização.
- Animações GSAP: `useGSAP`, `toggleActions: PLAY_ONCE` (não `once: true`), respeitar `prefers-reduced-motion` e o nível de movimento do projeto.
- 3D: carregar sob demanda, pausar fora da tela, ter imagem substituta e liberar recursos de GPU ao desmontar.
- Acessibilidade: textos alternativos, contraste AA (verificado em `src/lib/color.ts`), foco visível, navegação por teclado.
- Responsividade: sem rolagem horizontal em 390, 834 e 1440 px.

## Skills do projeto

| Skill | Quando usar |
|---|---|
| `novo-modelo-segmento` | Criar um modelo exclusivo para um segmento |
| `revisao-visual` | Revisar a aparência de modelos/páginas em 390/834/1440 px |
| `verificar` | Rodar a verificação completa e relatar resultados |
| `recursos-demo` | Gerar, adquirir ou registrar imagens, vídeos e modelos 3D |

## Documentação

`README.md` (uso), `docs/STATUS.md` (estado e próxima tarefa), `docs/ARQUITETURA.md`, `docs/SEGURANCA.md`, `docs/INTEGRACOES.md` (IA, Firebase, publicação), `docs/RECURSOS.md` (origem e licença de recursos).
