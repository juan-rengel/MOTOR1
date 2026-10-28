# Segurança — estado atual e requisitos

## Implementado

| Tema | Como |
|---|---|
| Exposição de rede | `npm run dev` e `npm run start` escutam só em 127.0.0.1 (não há login). `dev:lan` existe, com aviso. |
| Validação no servidor | Toda gravação passa por schemas zod (`src/domain`). O navegador valida para dar retorno rápido, mas o servidor decide. |
| Limites de tamanho | Corpo JSON de projeto ≤ 1 MB; geração de conteúdo ≤ 32 KB; uploads por tipo (imagem 10 MB, vídeo 60 MB, GLB 25 MB). |
| CSRF | Rotas que alteram dados recusam requisições com `Origin` de outra origem (`rejectCrossOrigin`). |
| Links e mídia | Apenas `https`, caminhos locais, `mailto:`, `tel:` e âncoras. `javascript:`, `data:`, `//host` e travessia de diretórios são recusados (`isSafeHref`, `isSafeMediaSrc`). |
| HTML inseguro | Nenhum conteúdo do usuário é renderizado como HTML. O único `dangerouslySetInnerHTML` é o script fixo de movimento. |
| Uploads | Tipo detectado pelos bytes do arquivo (não pela extensão). SVG/HTML/executáveis recusados. Arquivos fora de `public/`, servidos com `Content-Type` fixo, `nosniff` e `CSP: default-src 'none'; sandbox`. Nomes gerados pelo servidor. |
| Identificadores | IDs de projeto/recurso validados por padrão antes de tocar no disco (sem travessia de caminho). |
| Concorrência | Gravações por projeto serializadas no processo + controle de `revision` (409 em conflito). Escrita atômica (arquivo temporário + rename). |
| Isolamento por proprietário | O repositório filtra por `ownerId` (hoje "local"); pronto para usuários reais. |
| Cabeçalhos | `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `Referrer-Policy`, `Permissions-Policy`. |
| Prévia do editor | `postMessage` com verificação de origem/fonte e validação zod em ambos os lados. |
| Segredos | `.env*` no `.gitignore` (exceto `.env.example`, sem valores). Nenhuma chave é lida no navegador. |
| Logs | Erros internos registram apenas a mensagem, sem dados do projeto ou do visitante. |
| WhatsApp | Links só com números válidos informados pelo usuário; nada é enviado sem a ação do visitante. |
| Rota de captura | `/dev/capture` responde 404 fora do desenvolvimento (verificado em teste). |

## Pendente (antes de qualquer uso público)

1. **Autenticação real** com sessão verificada no servidor (FASE 9) e controle de acesso por projeto.
2. **Content-Security-Policy completa** para as páginas (exige nonces para os scripts do Next.js).
3. **Limitação de taxa** (rate limiting) nas rotas de API e de upload.
4. **Varredura de malware** dos uploads, se forem aceitos de terceiros.
5. **Regras de segurança** do Firestore/Storage (ou equivalente) escritas e testadas.
6. **Backups** e política de retenção dos dados.
7. Revisão de privacidade (LGPD) para dados de visitantes, caso formulários passem a gravar dados no servidor.
