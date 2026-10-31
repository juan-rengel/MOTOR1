# Cinematic Web Studio — Motor 1

Plataforma para criar **sites comerciais cinematográficos** para pequenos e médios negócios: cenas 3D, animações guiadas pela rolagem, modelos especializados por segmento, editor visual com pré-visualização responsiva e foco em conversão pelo WhatsApp.

> O nome do produto fica em `src/config/platform.ts` e pode ser trocado em um só lugar.

Esta é a **primeira versão funcional**: roda localmente, sem contas externas e sem serviços pagos. Veja [Limitações conhecidas](#limitações-conhecidas) e o andamento detalhado em [`docs/STATUS.md`](docs/STATUS.md).

---

## O que já funciona

| Área | Situação |
|---|---|
| Página inicial da plataforma | ✅ |
| Painel de projetos (listar, abrir, visualizar, excluir com confirmação) | ✅ |
| Assistente "Criar novo site" (negócio → estilo → modelo → revisão) | ✅ |
| 14 segmentos configurados — no assistente, primeiro os prioritários: Oficina mecânica, Barbearia, Beleza, Loja de roupas, Loja de calçados e Loja de variedades; 3 modelos dedicados (oficina mecânica, ótica, roupas/calçados) e o modelo universal **Essencial** para os demais segmentos | ✅ |
| 8 estilos visuais (cinematográfico, luxuoso, moderno, minimalista, industrial, tecnológico, elegante, vibrante) | ✅ |
| Editor visual: seções (selecionar, reordenar, adicionar, duplicar, ocultar, remover com confirmação), textos, imagens, botões, links, cores, tipografia, logotipo | ✅ |
| Desfazer/refazer, salvar (Ctrl+S), aviso de alterações não salvas, detecção de edição concorrente | ✅ |
| Pré-visualização ao vivo em computador (1440 px), tablet (834 px) e celular (390 px) | ✅ |
| Motor de animações (revelação de textos e imagens, parallax, transições) com respeito a "reduzir movimento" | ✅ |
| Motor 3D: 5 cenas (carro, óculos, tênis, tecido, modelo GLB próprio), câmera guiada pela rolagem, imagem substituta, pausa fora da tela | ✅ |
| Biblioteca de recursos com upload validado pelo conteúdo do arquivo | ✅ |
| Botões de WhatsApp/telefone/e-mail, catálogo com pedido por produto, formulário que abre o WhatsApp | ✅ |
| Verificações de qualidade no editor (botões sem destino, imagens sem descrição, contraste) | ✅ |
| Sugestões de texto por **regras locais** (sem IA, identificadas como tal) | ✅ |
| Exportação do projeto em JSON | ✅ |
| Imagens de demonstração otimizadas (tamanhos sob medida e WebP pelo otimizador nativo do Next.js), capa com prioridade de carregamento | ✅ |
| IA real, contas de usuário, banco remoto, publicação na internet, domínios | ⏳ fases futuras |

---

## Requisitos

- **Windows 11** (também funciona em macOS e Linux)
- **Node.js 22 LTS** (mínimo 20.9) — https://nodejs.org (instalador "LTS")
- **npm** (vem com o Node.js)
- **Git** — https://git-scm.com/download/win
- Navegador moderno com WebGL (Chrome, Edge, Firefox ou Safari atuais)

Para conferir no PowerShell:

```bash
node -v
```

```bash
npm -v
```

```bash
git --version
```

## Instalação

Na pasta do projeto:

```bash
npm install
```

> Se o `npm install` falhar com `Cannot read properties of null (reading 'edgesOut')` (falha conhecida de algumas versões do npm 10), rode `npx npm@11 install`.

## Configuração

Nenhuma configuração é obrigatória. Para ajustar opções, copie o exemplo:

```bash
copy .env.example .env.local
```

(no macOS/Linux: `cp .env.example .env.local`)

| Variável | Padrão | Para que serve |
|---|---|---|
| `CWS_DATA_DIR` | `.data` | Pasta onde projetos e uploads são gravados (nesta máquina) |
| `CWS_CONTENT_PROVIDER` | `local-rules` | Gerador de textos. Hoje só existe `local-rules` (sem IA) |

As variáveis de IA e Firebase do `.env.example` estão **reservadas** para fases futuras e ainda não são lidas pelo sistema (a página Integrações avisa se encontrá-las). O `.env.local` nunca é enviado ao Git.

## Inicialização

```bash
npm run dev
```

Abra http://127.0.0.1:3000 — a página inicial leva ao Studio (`/studio`).

- O servidor escuta **apenas neste computador** (127.0.0.1) porque ainda não há login.
- Para testar no celular na mesma rede Wi-Fi existe `npm run dev:lan` — use só em redes confiáveis: qualquer pessoa na rede poderá editar os projetos.

Versão de produção local:

```bash
npm run build
```

```bash
npm run start
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (http://127.0.0.1:3000) |
| `npm run dev:lan` | Desenvolvimento acessível na rede local (sem autenticação — cuidado) |
| `npm run build` | Gera a versão de produção |
| `npm run start` | Executa a versão de produção (após o build) |
| `npm run typecheck` | Gera os tipos das rotas e verifica o TypeScript |
| `npm run lint` | ESLint (regras do Next.js e do React) |
| `npm run test` | Testes unitários e de integração (Vitest) |
| `npm run test:watch` | Testes unitários em modo observação |
| `npm run test:e2e` | Testes de navegação ponta a ponta (Playwright) — exige `npm run build` antes |
| `npm run test:e2e:full` | Build + testes ponta a ponta |
| `npm run check` | typecheck + lint + testes unitários |
| `npm run assets:demo` | Regenera as imagens de demonstração a partir das cenas 3D (exige `npm run dev` rodando) |
| `npm run assets:model` | Regenera o modelo GLB demonstrativo (cadeira) |

## Testes

```bash
npm run check
```

Testes ponta a ponta (na primeira vez, instale o navegador do Playwright):

```bash
npx playwright install chromium
```

```bash
npm run test:e2e:full
```

Os testes ponta a ponta usam a pasta `.data-test` (seus projetos em `.data` não são tocados) e cobrem: criação pelo assistente, edição com atualização ao vivo, desfazer/refazer, salvar e recarregar, reordenar/adicionar/remover seções, cores, larguras de tela, exclusão, validações, segurança da API (origem, revisão, links perigosos, uploads), acessibilidade (axe), movimento reduzido, cenas 3D, substituto sem WebGL, carregamento de GLB, imagens otimizadas, orçamento de bytes por página e regressão visual dos modelos.

Proteções contra alterações acidentais: os testes unitários conferem o hash dos arquivos protegidos (modelos, imagens de demonstração, cenas 3D) e o conteúdo gerado pelos modelos; a regressão visual (`tests/e2e/visual.spec.ts`) compara capturas com referências gravadas e **roda só no Linux** — no Windows ela é pulada com aviso, porque as fontes são renderizadas de outro jeito. Detalhes em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Estrutura do projeto

```
src/
  app/                      Rotas (Next.js App Router)
    page.tsx                Página inicial da plataforma
    studio/(shell)/         Studio: projetos, novo site, modelos, recursos, integrações, conta
    studio/projects/[id]/   Editor
    (sites)/                Páginas que exibem sites: /demo/[modelo], /preview/[id], /frame (prévia do editor)
    api/                    API: projetos, recursos, geração de conteúdo
    dev/capture/            Captura de imagens das cenas (somente em desenvolvimento)
  config/                   Plataforma, segmentos, estilos visuais, fontes
  domain/                   Tipos e validação (zod): projeto, seções, tema, cena, botões, recursos
  features/
    projects/               Painel e assistente de criação
    templates/              Modelos (mecânica, ótica, moda, Essencial) e criação de projetos
    sections/               Valores padrão de cada tipo de seção
    site-renderer/          Renderizador dos sites (seções, cabeçalho, rodapé, formulário)
    animations/             Motor de animações (GSAP + ScrollTrigger)
    scenes3d/               Motor 3D (React Three Fiber): cenas, câmera, palco, capacidades
    editor/                 Editor visual, painéis, campos, verificações, protocolo da prévia
    assets/                 Biblioteca de recursos e validação de arquivos
    content/                Contrato de geração de conteúdo + gerador de regras locais
  server/                   Somente servidor: armazenamento, identidade, utilitários HTTP
  components/               Componentes de interface do Studio
public/assets/demo/         Imagens e modelo 3D demonstrativos (gerados por este projeto)
scripts/                    Geração de imagens e do modelo demonstrativo
tests/                      Testes unitários (Vitest) e ponta a ponta (Playwright)
docs/                       Status, arquitetura, integrações, segurança e recursos
```

Detalhes técnicos em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Limitações conhecidas

- **Armazenamento local**: projetos e uploads ficam em arquivos na pasta `.data` deste computador. Não há sincronização nem backup — copie essa pasta para não perder dados.
- **Sem autenticação**: uso de um único usuário, na própria máquina. Não existe "login falso" no navegador; o login real é a FASE 9.
- **Sem publicação real**: a "pré-visualização" funciona apenas localmente. O botão "Publicar na internet" está desativado e explica o motivo. Domínio personalizado é apenas registrado no projeto.
- **Sem IA**: as sugestões de texto vêm de regras locais (gratuitas, determinísticas) e a interface informa isso.
- **Formulário de contato** não envia dados a um servidor: abre o WhatsApp (ou e-mail) do negócio para o visitante confirmar.
- **Imagens demonstrativas** são renderizações das próprias cenas 3D (não são fotos). Substitua pelas fotos reais do negócio.
- **Modelos GLB com compressão Draco** não são carregados (exigiriam baixar o decodificador de um servidor externo); usam a imagem substituta.
- **Upload de fontes, SVG e ícones próprios** ainda não é aceito (SVG é bloqueado por segurança).
- **Imagens enviadas (uploads) não são otimizadas**: chegam ao visitante no tamanho original. Só as imagens de demonstração passam pelo otimizador; a otimização segura dos uploads fica para a FASE 9 (ver [`docs/SEGURANCA.md`](docs/SEGURANCA.md)).
- **Otimizador de imagens no Windows**: usa o `sharp` que já vem com o Next.js (a versão para Windows está no `package-lock.json`), então não deve exigir instalação extra — **ainda não verificado em uma máquina Windows**. A primeira visualização de cada imagem é um pouco mais lenta enquanto ela é otimizada; depois fica em cache em `.next/cache/images`.
- **Desempenho medido apenas em navegador sem GPU** (ambiente de testes). Em aparelhos reais a cena 3D usa a placa de vídeo; a qualidade se ajusta automaticamente, mas não há medição de Lighthouse registrada.
- Sem modelos dedicados (ainda) para barbearia, beleza, loja de variedades, advocacia, odontologia, móveis, academia, restaurante, serviços e outros negócios — esses segmentos usam o modelo universal **Essencial** (textos do próprio segmento, sem imagens nem cena 3D). Modelos dedicados só podem ser usados no segmento para o qual foram desenhados.
- **Gestão de serviços pelo proprietário** (adicionar, editar, ativar/desativar e remover serviços, sem deixar cartões vazios ou espaços no site) ainda não existe — requisito registrado para uma etapa futura (ver [`docs/STATUS.md`](docs/STATUS.md)).

## Próximas etapas

1. **FASE 8 — IA**: escolher provedor, definir custos/limites e implementar `ContentGenerator` no servidor (ver [`docs/INTEGRACOES.md`](docs/INTEGRACOES.md)).
2. **FASE 9 — Firebase**: autenticação real, driver de projetos no Firestore e uploads no Storage, com regras de acesso por usuário.
3. **FASE 10 — Publicação**: hospedagem dos sites gerados, domínios e medição de desempenho (a otimização das imagens de demonstração já existe; a das imagens enviadas depende da FASE 9).
4. Modelos dedicados por segmento, na ordem de prioridade: Oficina mecânica (realista), Barbearia, Beleza, Loja de roupas, Loja de calçados e Loja de variedades; depois os demais segmentos.
5. Gestão de serviços pelo proprietário (requisito futuro registrado em [`docs/STATUS.md`](docs/STATUS.md)).

## Futuras integrações

As integrações têm pontos de extensão prontos e documentados em [`docs/INTEGRACOES.md`](docs/INTEGRACOES.md):

- **IA**: `src/features/content/types.ts` (contrato) e `src/server/content/index.ts` (seleção do provedor). Chaves somente no servidor.
- **Banco/Firebase**: `src/server/storage/project-repository.ts` (contrato) e `src/server/storage/index.ts` (seleção do driver).
- **Identidade**: `src/server/auth/current-owner.ts` (hoje sempre "local").
- **Publicação**: painel em `src/features/editor/panels/publish-panel.tsx`.

Segurança: [`docs/SEGURANCA.md`](docs/SEGURANCA.md). Recursos e licenças: [`docs/RECURSOS.md`](docs/RECURSOS.md).
