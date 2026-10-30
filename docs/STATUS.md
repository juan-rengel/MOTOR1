# STATUS — Cinematic Web Studio (Motor 1)

Última atualização: 30/10/2026.

## Fases

| Fase | Situação | Observações |
|---|---|---|
| 0 — Diagnóstico | ✅ Concluída | Node 22, npm 10, Git; ambiente de desenvolvimento em Linux (contêiner). Projeto pensado para Windows 11 (scripts sem comandos específicos de sistema). |
| 1 — Fundação | ✅ Concluída | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript estrito, Tailwind 4, zod, Vitest, Playwright, ESLint. |
| 2 — Interface principal | ✅ Concluída | Página inicial, Studio (projetos, novo site, modelos, recursos, integrações, conta), assistente em 4 etapas. |
| 3 — Primeiro site | ✅ Concluída | Modelo "Garagem Cinematográfica" (oficina mecânica), 12 tipos de seção. |
| 4 — Motor cinematográfico | ✅ Concluída | Animações (GSAP), cena 3D do carro com câmera na rolagem, substituto, pausa fora da tela. |
| 5 — Editor | ✅ Concluída | Seções, conteúdo, identidade, movimento, cena 3D, projeto, publicação; prévia responsiva; desfazer/refazer. |
| 6 — Persistência | ✅ Concluída (local) | Arquivos JSON em `.data/` com validação, revisão e escrita atômica. |
| 7 — Novos modelos | ✅ Concluída | "Ótica Atelier" e "Coleção Editorial" (roupas/tênis); cenas de óculos, tênis, tecido e GLB próprio. |
| 8 — IA | ⏸ Aguardando decisão | Contrato e gerador de regras locais prontos. Falta escolher provedor, custos e credenciais. |
| 9 — Firebase | ⏸ Aguardando projeto | Contratos de repositório/identidade prontos. Falta criar o projeto Firebase. |
| 10 — Testes e publicação | 🟡 Parcial | Testes completos executados; requisitos de publicação documentados. Hospedagem real não implementada. |

## Plano de evolução (após o diagnóstico de 30/10/2026)

| Etapa | Situação | Observações |
|---|---|---|
| 0 — Instruções e skills do Claude Code | ✅ Concluída (30/10/2026) | `CLAUDE.md` (regras permanentes), `.claude/settings.json` (permissões: verificação liberada; instalação, `npx`, commit, push e geração de mídia sob confirmação; segredos `.env`, recursos de demonstração existentes, publicação e comandos destrutivos bloqueados) e skills `novo-modelo-segmento`, `revisao-visual`, `verificar`, `recursos-demo`. Auditoria final com 10 correções aplicadas. `.gitignore` passa a ignorar `.claude/settings.local.json`. Nenhum componente, página, modelo, teste ou recurso alterado. |
| 1A — Fim do conteúdo de outro segmento | ✅ Concluída (30/10/2026), aguardando revisão | Modelo universal **Essencial** (`universal-essential`: sem imagens e sem cena 3D, textos do segmento escolhido). O assistente oferece só os modelos dedicados ao segmento e o Essencial; o servidor recusa modelo dedicado em outro segmento (422). Pacotes de texto novos para barbearia/salão, restaurante, móveis e serviços. Os 3 modelos antigos geram exatamente o mesmo conteúdo (referência fixa) e as demonstrações ficaram idênticas pixel a pixel. Projetos antigos continuam abrindo. |
| 1B — Imagens responsivas | ⏸ Aguardando aprovação | Adiada por decisão (D3) até a revisão da 1A. |
| 2 a 8 | ⏸ Aguardando aprovação | Cada etapa começa com plano apresentado e aprovação explícita. Dados estruturados `LocalBusiness` (JSON-LD) ficam para a Etapa 6 (decisão D2). |

## Arquitetura atual

Resumo em [`ARQUITETURA.md`](ARQUITETURA.md). Pontos centrais:

- Domínio em `src/domain` (zod) — projeto como documento JSON versionado.
- Renderizador único (`src/features/site-renderer`) usado no editor, na pré-visualização e nas demonstrações.
- Motores independentes: animações (`features/animations`) e 3D (`features/scenes3d`).
- Servidor isolado em `src/server` (armazenamento, identidade, HTTP), com contratos para trocar de driver.

## Funcionalidades existentes

- Criação de projeto (dados do negócio com validação de telefone/e-mail/redes, estilo visual, modelo recomendado por segmento, revisão).
- 3 modelos dedicados + o modelo universal Essencial, 8 estilos, 12 segmentos configurados. Modelos dedicados só são oferecidos (e aceitos pelo servidor) no próprio segmento.
- Editor: reordenar/adicionar/duplicar/ocultar/remover seções (remoção com confirmação), campos gerados por definição, seletor de mídia (biblioteca, upload, URL https), botões com ação (WhatsApp, seção, link, telefone, e-mail) e alerta quando o destino falta, cores com contraste calculado, fontes, cantos, logotipo, movimento, cena 3D (cena, variação, câmera, qualidade, ambiente, cores, imagem substituta, GLB), SEO, slug, domínio desejado, exportação JSON.
- Verificações de qualidade (conteúdo demonstrativo, botões sem destino, imagens sem texto alternativo, contraste, GLB ausente, SEO).
- Sugestões de texto por regras locais (rotuladas "sem IA").
- Biblioteca de recursos com upload validado por assinatura, licença e texto alternativo.
- Cenas 3D: carro, óculos (quadrado, redondo, gatinho, aviador), tênis, tecido, GLB próprio. Imagens de demonstração geradas a partir delas.

## Testes realizados (última execução: 30/10/2026, Etapa 1A)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 problemas |
| Unitários/integração | `npm run test` | ✅ 201 testes, 9 arquivos (antes: 70 em 8) |
| Build de produção | `npm run build` | ✅ sem avisos |
| Ponta a ponta | `npm run test:e2e:full` (build + testes) | ✅ 46 testes (antes: 38) |
| Revisão visual | capturas em 390/834/1440 px (skill `revisao-visual`) | ✅ sem itens bloqueantes; ver "Problemas conhecidos" |

Comparação dos modelos antigos (Etapa 1A): referência fixa de 36 combinações (modelo × segmento × estilo, mais dados do usuário) gravada antes da mudança e idêntica depois; demonstrações de mecânica, ótica e moda idênticas pixel a pixel antes/depois nas 3 larguras (movimento reduzido, sem WebGL); arquivos dos modelos antigos e as 37 imagens/modelo 3D existentes com hash idêntico.

Na Etapa 1A, um teste ponta a ponta antigo (modelo GLB) foi ajustado com autorização: ele criava a Garagem no segmento "furniture", combinação agora recusada; passou a usar "mechanic", sem mudar o que verifica.

Os testes ponta a ponta incluem acessibilidade com axe (WCAG 2 A/AA, sem violações sérias nos 3 modelos), ausência de rolagem horizontal em 390/834/1440 px, movimento reduzido, cena 3D pronta, substituto sem WebGL, carregamento de GLB e segurança da API.

Ambiente de teste sem GPU: as cenas 3D rodam em software (SwiftShader). Por isso os testes do editor simulam navegador sem WebGL, e a cena 3D tem testes próprios.

## Problemas conhecidos

- Desempenho real (Lighthouse/Web Vitals) não medido em aparelhos com GPU.
- O aviso `THREE.Clock: This module has been deprecated` aparece no console do navegador; vem de dentro do React Three Fiber 9.8, não do código do projeto.
- Durante o desenvolvimento, após muitas alterações seguidas, o servidor `next dev` pode entrar em recarregamento contínuo da página de captura; reiniciar o `npm run dev` resolve.
- Modelos GLB com compressão Draco não são carregados (ver README).
- Sem autenticação, sem publicação real, sem IA (por decisão de fase).
- `npm run lint` acusa milhares de problemas quando existe `playwright-report/` com o visualizador de traces (gerado quando algum teste ponta a ponta falha): a configuração do ESLint não ignora `playwright-report/` nem `test-results/`. Com todos os testes passando, o lint fica limpo. Correção (incluir as pastas em `globalIgnores`) depende de aprovação.
- Modelos antigos em 834 px e 390 px: o objeto 3D (carro, óculos) sobrepõe parte do título da capa; em 834 px sem WebGL a imagem substituta da ótica aparece cortada na lateral. Já existia antes da Etapa 1A (renderização idêntica).
- Essencial: o cartão na página inicial fica sozinho na segunda linha e sem selo de segmento (`src/app/page.tsx` fora do escopo da 1A); a imagem de prévia mostra o texto da demonstração ("Prestador de serviços") também quando o segmento escolhido é outro; serviços com 4 itens deixam um cartão isolado na grade; a descrição dos serviços repete o nome do serviço ("Orçamento: … solicite um orçamento"); a seção "Sobre" sem foto fica com bastante espaço vazio.
- Loja de móveis deixou de poder usar a cena 3D da Garagem (modelo de outro segmento). A cena de modelo GLB próprio continua existindo; um modelo dedicado de móveis é previsto para a Etapa 4.

## Próxima tarefa concreta

1. Revisão da Etapa 1A pelo responsável (e autorização de commit).
2. Plano da **Etapa 1B** (imagens responsivas), já apresentado, aguardando aprovação.
3. Depois: Etapa 2 (design system), conforme o plano de evolução.

Continuam dependendo de decisões do responsável: FASE 8 (provedor de IA, custos) e FASE 9 (projeto Firebase).
