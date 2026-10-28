# STATUS — Cinematic Web Studio (Motor 1)

Última atualização: 28/10/2026.

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

## Arquitetura atual

Resumo em [`ARQUITETURA.md`](ARQUITETURA.md). Pontos centrais:

- Domínio em `src/domain` (zod) — projeto como documento JSON versionado.
- Renderizador único (`src/features/site-renderer`) usado no editor, na pré-visualização e nas demonstrações.
- Motores independentes: animações (`features/animations`) e 3D (`features/scenes3d`).
- Servidor isolado em `src/server` (armazenamento, identidade, HTTP), com contratos para trocar de driver.

## Funcionalidades existentes

- Criação de projeto (dados do negócio com validação de telefone/e-mail/redes, estilo visual, modelo recomendado por segmento, revisão).
- 3 modelos completos, 8 estilos, 12 segmentos configurados.
- Editor: reordenar/adicionar/duplicar/ocultar/remover seções (remoção com confirmação), campos gerados por definição, seletor de mídia (biblioteca, upload, URL https), botões com ação (WhatsApp, seção, link, telefone, e-mail) e alerta quando o destino falta, cores com contraste calculado, fontes, cantos, logotipo, movimento, cena 3D (cena, variação, câmera, qualidade, ambiente, cores, imagem substituta, GLB), SEO, slug, domínio desejado, exportação JSON.
- Verificações de qualidade (conteúdo demonstrativo, botões sem destino, imagens sem texto alternativo, contraste, GLB ausente, SEO).
- Sugestões de texto por regras locais (rotuladas "sem IA").
- Biblioteca de recursos com upload validado por assinatura, licença e texto alternativo.
- Cenas 3D: carro, óculos (quadrado, redondo, gatinho, aviador), tênis, tecido, GLB próprio. Imagens de demonstração geradas a partir delas.

## Testes realizados (última execução: 28/10/2026)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 problemas |
| Unitários/integração | `npm run test` | ✅ 70 testes, 8 arquivos |
| Build de produção | `npm run build` | ✅ sem avisos |
| Ponta a ponta | `npm run test:e2e` (contra o build) | ✅ 38 testes |

Os testes ponta a ponta incluem acessibilidade com axe (WCAG 2 A/AA, sem violações sérias nos 3 modelos), ausência de rolagem horizontal em 390/834/1440 px, movimento reduzido, cena 3D pronta, substituto sem WebGL, carregamento de GLB e segurança da API.

Ambiente de teste sem GPU: as cenas 3D rodam em software (SwiftShader). Por isso os testes do editor simulam navegador sem WebGL, e a cena 3D tem testes próprios.

## Problemas conhecidos

- Desempenho real (Lighthouse/Web Vitals) não medido em aparelhos com GPU.
- O aviso `THREE.Clock: This module has been deprecated` aparece no console do navegador; vem de dentro do React Three Fiber 9.8, não do código do projeto.
- Durante o desenvolvimento, após muitas alterações seguidas, o servidor `next dev` pode entrar em recarregamento contínuo da página de captura; reiniciar o `npm run dev` resolve.
- Modelos GLB com compressão Draco não são carregados (ver README).
- Sem autenticação, sem publicação real, sem IA (por decisão de fase).

## Próxima tarefa concreta

Definir com o responsável:

1. **FASE 8**: provedor de IA, tarefas, teto de custo mensal → implementar `ContentGenerator` no servidor (`src/server/content`).
2. **FASE 9**: criar o projeto Firebase → implementar `FirestoreProjectRepository`, sessão no servidor em `getCurrentOwner()` e regras de segurança.

Sem essas decisões, a próxima melhoria independente é um **quarto modelo** (advocacia ou clínica odontológica) e a medição de desempenho em aparelhos reais.
