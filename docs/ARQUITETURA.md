# Arquitetura — Motor 1

## Visão geral

```
Navegador                                   Servidor (Next.js)                     Disco local
─────────                                   ──────────────────                     ───────────
Studio (React, client)  ──fetch JSON──►  /api/projects, /api/assets  ──►  Repositório ──► .data/projects/*.json
   │                                      /api/content/generate             (interface)    .data/uploads/*
   │ postMessage (zod)                          │
   ▼                                            ▼
iframe /frame  ── SiteRenderer ◄── mesmo componente ── /preview/[id], /demo/[modelo] (SSR)
                     │
                     ├─ seções (registro tipo → componente)
                     ├─ motor de animações (GSAP + ScrollTrigger)
                     └─ motor 3D (React Three Fiber, carregado sob demanda)
```

Duas experiências separadas:

- **Studio** (administração): visual escuro com ciano, tokens `ink-*`, `cyan-*` em `src/app/globals.css`.
- **Sites gerados**: tokens `site-*` alimentados pelo tema de cada projeto (`theme-vars.ts`). Nenhum site herda o visual do Studio.

## Decisões técnicas

| Decisão | Motivo |
|---|---|
| Next.js 16 (App Router) com Cache Components | Padrão atual do framework. Páginas com dados locais usam `<Suspense>` + `connection()` para nunca congelar dados no build. |
| Zod como fonte única de tipos | Os mesmos schemas validam no navegador (feedback imediato) e no servidor (decisão final). Tipos TypeScript são inferidos deles. |
| Projeto = documento JSON validado | Estrutura previsível e extensível; facilita migrar para Firestore (documento por projeto). `schemaVersion` + `domain/migrations.ts` para evoluções. |
| Persistência atrás de interface (`ProjectRepository`) | Troca de driver (arquivos → Firebase) sem tocar em rotas ou componentes. |
| Controle de revisão (`revision`) | Evita que duas abas sobrescrevam uma à outra (HTTP 409 + diálogo no editor). |
| Prévia do editor em `iframe` | Media queries reais por largura de dispositivo, isolamento de CSS/rolagem, mesmo renderizador da versão final. Comunicação por `postMessage` com verificação de origem e validação zod. |
| Editor por reducer (sem manipular DOM) | Estado previsível, desfazer/refazer, agrupamento de digitação. |
| Campos declarativos por seção (`section-fields.ts`) | O painel de propriedades é gerado; novos campos não exigem componentes novos. |
| GSAP + ScrollTrigger (via `@gsap/react`) | Animações de rolagem robustas; limpeza automática com `useGSAP`. |
| React Three Fiber + drei, só onde há 3D | three.js é carregado sob demanda (`lazy`) apenas quando a seção "História 3D" se aproxima da tela. |
| Cenas procedurais | Sem dependência de modelos externos ou URLs que podem sair do ar; as imagens de demonstração são geradas a partir das cenas. |
| Ambiente de luz com Lightformers | Reflexos de estúdio sem baixar arquivos HDR externos. |
| Fontes via `@fontsource` | Servidas pelo próprio projeto; sem chamadas a serviços de fontes. |
| Otimizador de imagens nativo do Next só para `/assets/demo` | Tamanhos sob medida e WebP sem dependência nova. Uploads ficam fora até a Fase 9 (ver "Imagens"). |

## Dados

`src/domain/project.ts`:

- `business` — dados do negócio (nome, segmento, contatos, redes, objetivo).
- `theme` — cores, fontes, cantos, caixa dos títulos, granulação.
- `motion` — nível (nenhum/sutil/equilibrado/cinematográfico) e efeitos.
- `scene` — cena 3D, movimento de câmera, qualidade, cores, imagem substituta, modelo GLB, variação.
- `sections[]` — união discriminada de 12 tipos de seção (`src/domain/sections.ts`).
- `seo`, `publishing` (status, slug, domínio desejado), `flags.demoContent`.
- `ownerId`, `revision`, `createdAt`, `updatedAt`, `schemaVersion`.

Separação conceitual para a evolução SaaS: plataforma (Studio) · proprietário (`ownerId`) · projeto · conteúdo (`sections`) · modelo (`templateId`) · recursos (biblioteca) · publicação (`publishing`) · site público (renderizador).

## Seções

| Tipo | Uso |
|---|---|
| `hero` | Capa com imagem, vídeo ou gradiente |
| `sceneStory` | Abertura 3D: cena fixa + capítulos que rolam por cima |
| `services` | Serviços em grade ou lista |
| `catalog` | Produtos com filtros e pedido pelo WhatsApp |
| `gallery` | Grade, mosaico ou faixa, com visualizador ampliado |
| `editorial` | Blocos imagem/texto alternados (lookbook) |
| `about` | História e destaques |
| `steps` | Etapas com linha de progresso na rolagem |
| `marquee` | Faixa de palavras em movimento |
| `cta` | Chamada para ação |
| `faq` | Acordeão nativo |
| `contact` | Contatos + formulário que abre WhatsApp/e-mail |

Para criar um tipo novo: schema em `domain/sections.ts` → padrão em `features/sections/create-section.ts` → componente em `features/site-renderer/sections/` + registro em `section-registry.tsx` → campos em `features/editor/section-fields.ts`.

## Modelos

`src/features/templates/*.ts` implementam `TemplateDefinition`: segmentos, estilo padrão, ajustes de tema por estilo, cena 3D, seções iniciais (usando os dados do negócio quando informados) e um negócio fictício para a demonstração. Registro em `registry.ts`.

Há dois tipos de modelo (`kind`):

- **dedicado** (padrão): traz textos, imagens e cena 3D do próprio segmento e **só pode ser usado nos segmentos de `segments`**. O assistente oferece apenas os dedicados ao segmento escolhido, e o servidor recusa outras combinações (`isTemplateCompatible`, verificado em `createProjectFromTemplate`; resposta 422).
- **universal**: base neutra aceita em qualquer segmento. O **Essencial** (`universal-essential`) usa só os textos do segmento escolhido e os dados do negócio, sem imagens e sem cena 3D. É o recomendado para segmentos sem modelo dedicado e aparece como "Base neutra" nos demais.

Projetos criados antes dessa regra continuam abrindo e editando normalmente: a verificação vale apenas na criação.

| Modelo | Segmentos | Cena | Estrutura |
|---|---|---|---|
| Garagem Cinematográfica | Oficina mecânica | Carro | História 3D, faixa, serviços, processo, estrutura, sobre, dúvidas, orçamento, contato |
| Ótica Atelier | Ótica | Óculos (4 formatos) | História 3D, catálogo de armações, editorial de atendimento, passo a passo, sobre, dúvidas, chamada, contato |
| Coleção Editorial | Roupas e tênis | Tecido (roupas) ou tênis | História 3D, faixa, catálogo com pedido, lookbook, galeria, como comprar, dúvidas, chamada, contato |
| Essencial (universal) | Todos (recomendado para os segmentos sem modelo dedicado) | Nenhuma | Capa em degradê, serviços, como funciona, sobre, dúvidas, chamada, contato |

## Imagens (Etapa 1B)

Todas as imagens dos sites passam por `SiteImage` (`features/site-renderer/primitives/site-image.tsx`), que mantém proporção reservada, carregamento sob demanda, substituto quando a imagem falta ou falha e o atributo `data-reveal-media` usado pelas animações.

| Origem da imagem | Como é entregue |
|---|---|
| Demonstração (`/assets/demo/...`) | Componente de imagem do Next (`next/image`, `fill`) → otimizador nativo: `srcset` com várias larguras, **WebP com qualidade 75**. Configuração em `next.config.ts` (`images.localPatterns` só com `/assets/demo/**` e sem query string; `qualities: [75]`; `formats: ["image/webp"]`). |
| Upload (`/api/assets/<id>/file`) | `<img>` direto da rota do arquivo, **sem otimização** (como antes). O arquivo original é preservado. |
| URL externa (`https://...`) | `<img>` direto, nunca pelo otimizador. |

**Por que os uploads não são otimizados nesta etapa:** o otimizador guarda em cache cada versão gerada (`.next/cache/images`) e continuou servindo a versão otimizada depois que o arquivo foi excluído (verificado: original 404, versão otimizada 200 do cache), além de responder com cache público. Para não expor imagens excluídas, a otimização segura dos uploads será reavaliada na **Fase 9**, junto com o armazenamento em nuvem (invalidação na exclusão, cache privado, autenticação).

**Prioridade:** imagens marcadas com `priority` (capa `hero` e imagem substituta da cena 3D) recebem `loading="eager"` e `fetchpriority="high"`; as demais carregam sob demanda (`loading="lazy"`).

**`sizes` por seção** (largura ocupada na tela, para o navegador escolher o tamanho certo):

| Uso | `sizes` |
|---|---|
| Capa, imagem substituta da cena (padrão) | `100vw` |
| Sobre | `(min-width: 768px) 50vw, 100vw` |
| Editorial | `(min-width: 768px) 60vw, 100vw` |
| Catálogo | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` |
| Chamada para ação (fundo) | `(min-width: 1280px) 1240px, 100vw` |
| Galeria | conforme o layout: grade como o catálogo; mosaico pela fração de colunas de cada posição; faixa `(min-width: 640px) 420px, 78vw` |

Fora do escopo: logotipo do cabeçalho, imagem ampliada da galeria e imagens do Studio/página inicial continuam com `<img>` simples.

## Testes de proteção e regressão (Etapa 1B)

| Teste | O que garante |
|---|---|
| `tests/unit/protected-files.test.ts` + `tests/fixtures/protected-files.sha256.json` | 82 arquivos protegidos (modelos, recursos de demonstração, cenas 3D, domínio, scripts, dependências, regras) com hash fixo; pastas protegidas sem arquivos novos. Texto comparado com quebras de linha normalizadas (funciona no Windows). |
| Referências fixas (`src/features/templates/__snapshots__/`) | O que os 3 modelos dedicados (36 combinações) e o Essencial (96 combinações) geram não muda. |
| `tests/e2e/visual.spec.ts` | Capturas de página inteira dos 4 modelos em 390, 834 e 1440 px (movimento reduzido, sem WebGL), comparadas com `visual.spec.ts-snapshots/` (8,02 MB): zero pixels acima de 1% de diferença de cor. Nos 3 modelos antigos, o conteúdo das imagens é mascarado na própria camada (`visual-mask.css`) — tamanho, posição e tudo o que fica por cima continuam comparados; o Essencial é comparado sem máscara. A granulação de filme é ocultada só na captura (`visual-no-grain.css`) e verificada à parte. Roda só no Linux (no Windows é pulado com aviso). |
| `tests/e2e/images.spec.ts` | Capa com prioridade alta, `srcset` e WebP; imagens fora da capa sob demanda; versão menor no celular; uploads e URLs externas fora do otimizador; substituto quando a imagem falha; arquivo enviado idêntico e exclusão funcionando. |
| `tests/e2e/budget.spec.ts` | Orçamento de bytes por demonstração (celular 390 px a 3×, sem WebGL, página inteira). |

Atualizar referências visuais, hashes protegidos, referências fixas ou limites do orçamento só como passo de um plano aprovado.

## Motor de animações (`features/animations`)

- `tokens.ts`: durações, curvas, perfis por nível de movimento.
- `motion-context.tsx`: combina configuração do projeto, `prefers-reduced-motion` e capacidade do aparelho (`device.ts`), via `useSyncExternalStore` (sem divergência de hidratação).
- `Reveal`, `SplitText`, `ImageReveal`, `Parallax`: componentes reutilizáveis; quando o movimento está desligado, o conteúdo aparece normalmente.
- Páginas renderizadas no servidor recebem um script mínimo (`site-motion-script.ts`) que esconde elementos animáveis antes da primeira pintura, com salvaguarda de 3,5 s caso o JavaScript falhe.
- Gatilhos usam `toggleActions: "play none none none"` em vez de `once: true` (este último quebrava o `ScrollTrigger.refresh()` ao abrir a página já rolada para uma âncora).

## Motor 3D (`features/scenes3d`)

- `registry.ts`: cenas, momentos de câmera, variações; `lazy-scenes.ts`: componentes carregados sob demanda.
- `scene-host.tsx`: imagem substituta imediata, carregamento ao se aproximar da tela, pausa fora da tela (`frameloop="never"`), detecção de WebGL, aparelhos fracos com botão "Ver em 3D", captura de erros.
- `scene-canvas.tsx`: tom ACES, resolução limitada por nível, `AdaptiveDpr` com monitor de desempenho.
- `shared/camera-rig.tsx`: câmera cinematográfica em coordenadas esféricas, amortecida, com deslocamento de lente para enquadrar ao lado do texto e ajuste automático em telas verticais.
- `shared/sculpt.ts`: extrusão de perfil + subdivisão + deformação + solda de vértices (carro e tênis).
- `shared/product-stage.tsx`, `shared/studio-environment.tsx`: palco, luzes, ambiente, oclusão.
- Recursos de GPU criados fora do JSX são liberados ao desmontar (`dispose`).

## Pré-visualização do editor

`features/editor/frame-protocol.ts` define as mensagens:

- pai → iframe: `cws:render` (projeto completo, seção selecionada, movimento), `cws:scroll-to`.
- iframe → pai: `cws:ready`, `cws:select` (clique numa seção), `cws:invalid`.

Ambos os lados conferem `event.origin` e `event.source` e validam com zod.
