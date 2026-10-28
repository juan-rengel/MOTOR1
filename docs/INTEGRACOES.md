# Integrações futuras

Nenhum serviço pago ou conta externa é usado nesta fase. Esta página descreve **onde** e **como** cada integração entra, e o que precisa ser decidido antes.

## FASE 8 — Inteligência artificial (textos)

### Estado atual
- Contrato: `src/features/content/types.ts` (`ContentGenerator`, `ContentRequest`, `ContentSuggestion`).
- Provedor ativo: `LocalRulesContentGenerator` — monta textos por regras a partir dos dados do negócio. **Não é IA**, não tem custo, e a interface informa isso em cada sugestão.
- Seleção do provedor: `src/server/content/index.ts`, pela variável `CWS_CONTENT_PROVIDER`.
- Rota: `POST /api/content/generate` (validação zod, limite de tamanho, proteção de origem).

### Para integrar um provedor (ex.: Anthropic Claude)
1. **Decidir**: provedor, modelo, tarefas (título, SEO, serviços, sobre…), limite mensal de gasto e de chamadas por projeto.
2. **Custos**: provedores cobram por tokens de entrada e saída. Uma sugestão de título/subtítulo usa poucas centenas de tokens; estime o volume (usuários × gerações/mês) antes de ativar e defina um teto.
3. **Implementar** uma classe `ContentGenerator` em `src/server/content/` (somente servidor), lendo a chave de `process.env` (ex.: `ANTHROPIC_API_KEY` em `.env.local`). Nunca use `NEXT_PUBLIC_` para chaves.
4. **Validar a resposta** com zod (formato de `ContentVariant`), aplicar timeout (ex.: 20 s), tratar erros de limite (HTTP 429) e não registrar dados pessoais nos logs.
5. **Controle de custo**: contador por usuário/projeto e limite diário; recusar com mensagem clara quando atingido.
6. **Registrar** o provedor em `getContentGenerator()` e manter `local-rules` como alternativa quando a IA estiver indisponível.
7. **Rótulo**: `info.kind = "ai"` faz a interface indicar que o texto foi gerado por IA.

Não coloque sua chave no chat nem no código: crie-a no painel do provedor e grave em `.env.local`.

## FASE 9 — Firebase (autenticação e dados na nuvem)

### Avaliação
O Firebase atende às necessidades listadas:

| Necessidade | Serviço |
|---|---|
| Autenticação e usuários | Firebase Authentication |
| Projetos e configurações | Cloud Firestore (um documento por projeto, como hoje no JSON) |
| Recursos (imagens, vídeos, GLB) | Cloud Storage for Firebase |
| Sites publicados | Firebase Hosting ou outra hospedagem (decisão da FASE 10) |

Custos: há cota gratuita (plano Spark), mas Storage e alguns recursos exigem o plano Blaze (pago por uso) dependendo do volume. Avalie antes de ativar.

### Passos quando você criar o projeto Firebase
1. Criar o projeto no console do Firebase e um app Web; copiar a configuração pública para `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
2. Criar uma conta de serviço e guardar o JSON **somente** em variável de servidor (`FIREBASE_SERVICE_ACCOUNT_JSON`), nunca no Git.
3. Implementar `FirestoreProjectRepository` seguindo `ProjectRepository` (`src/server/storage/project-repository.ts`), incluindo a verificação de `revision` em transação.
4. Trocar `getCurrentOwner()` (`src/server/auth/current-owner.ts`) por verificação de cookie de sessão no servidor (Firebase Admin `verifySessionCookie`).
5. Implementar o armazenamento de uploads no Storage mantendo a validação por assinatura (`checkUpload`) no servidor.
6. Escrever **regras de segurança**: cada usuário lê/escreve apenas seus projetos e recursos; uploads apenas nos formatos e tamanhos permitidos.
7. Selecionar o driver em `src/server/storage/index.ts` conforme as variáveis presentes.

As rotas já recebem `ownerId` e o repositório já filtra por proprietário, então o controle de acesso se encaixa sem reescrever as telas.

## FASE 10 — Publicação

Decisões pendentes: onde hospedar cada site (subdomínio da plataforma vs. domínio do cliente), como emitir certificados, como servir recursos (CDN), e como versionar publicações. O projeto já guarda `publishing.status`, `slug` e `customDomain`; o painel "Publicar" mostra o checklist e permite exportar o projeto em JSON. Nenhuma publicação deve ser feita sem autorização explícita.
