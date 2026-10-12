# Plano de Fases — Lucathi Wealth OS

> Origem: auditoria master (4 frentes) de 2026-10-10. Este documento é o plano de
> remediação aprovado. Fases 1 e 3 em execução; demais agendadas.

## Visão executiva

| Severidade | Qtd | Tema dominante |
|---|---|---|
| P0 | 3 | Backdoor de produção, takeover de conta, upload inoperante em produção |
| P1 | 12 | Sessão, atomicidade, isolamento latente, LGPD, migração em deploy |
| P2 | ~35 | Validação, RBAC, UX, testes, CI, observabilidade |
| P3 | ~30 | Consistência, dead code, terminologia, higiene |

## Fase 6 — Atomicidade: transactions, advisory lock ≤100%, DELETE-where, claim de token (concluída)

1. Nova `server/_shared/advisory-lock.ts`: `withAdvisoryLock(db, key, discriminator, fn)` usando `pg_try_advisory_xact_lock` — nunca bloqueia indefinidamente, falha rápido se lock indisponível.
2. `first-access-router.ts`: `setPassword` roda dentro de advisory lock por token — elimina race entre check/insert de usuário, reusa conta existente se corrida (`createUser` lança "Já existe").
3. `document-upload.ts`: `storeDocumentVersion` roda dentro de advisory lock por `documentId` — re-lê `currentVersion` dentro da transação para evitar versão duplicada em upload simultâneo.
4. `lwr-router.ts`: `create` roda dentro de advisory lock por `familyId` — `MAX(version)` + 1 atômico, sem gap numérico.
5. `company-repository.ts`: `createStakeholderRecord` / `updateStakeholderRecord` com advisory lock por `companyId` — soma de participações ≤100% garantida sob concorrência.
6. Testes atualizados: mocks de `requireDatabase` incluem `transaction` + `execute` retornando `{ acquired: true }`.
7. Migration `0015`: (nenhuma — advisory locks são em memória, sem schema).

## Fase 5 — Sessão: TTL curto + `jti` revogável; `sameSite:"lax"`; `trust proxy` (concluída)

1. Remover backdoor em `server/_core/auth.ts` (auto-provisionamento e resync de senha com `123456`).
2. Ajustar testes em `server/_core/auth.test.ts` (remover testes do bootstrap; adicionar teste negativo).
3. Corrigir takeover em `server/features/people/first-access-router.ts`: `setPassword` só cria conta nova; se a conta existir, só prossegue se for `CLIENTE` **e** já vinculada à família do link — nunca sobrescreve senha de conta de time ou de outra família.
4. Ajustar testes em `server/features/people/first-access-router.test.ts`.
5. Ato operacional (fora do código, checklist): auditar/rotacionar `JWT_SECRET`, neutralizar contas seed em produção, rebuild de `api/index.js`.

## Fase 3 — `errorFormatter` do tRPC (elimina "wall of JSON")

1. `server/_core/trpc.ts`: `errorFormatter` que, para `cause instanceof ZodError`, devolve `message` legível (primeiro issue) e `data.fields` (`path → message`); para `INTERNAL_SERVER_ERROR`, mensagem genérica + `logError`.
2. Novo `client/src/lib/trpcError.ts`: `errorMessage(e)` e `fieldError(e, field)`.
3. Substituir os 23 `toast.error(error.message)` por `toast.error(errorMessage(error))`.
4. Mensagens pt-BR nos schemas sem texto próprio (`lead-types`, `property-types`, `certidao-types`, `document-types`) e datas via `shared/validation/datas.ts`.

## Fase 2 — Matriz central de permissões (RBAC × RLS)

1. Novo `shared/domain/permissions.ts`: matriz `permissão × papel`, `hasPermission`, `ui.*` (canEdit/canReview/isTeam) derivada — cliente importa, nunca redeclara papel na mão.
2. `requirePermission(ctx, permissão)` em `server/features/access/authorization.ts`.
3. Migrar ~35 call sites de `requireRole` para `requirePermission` + `assertFamilyAccess` em toda procedure com `familyId`.
4. Fechar gaps: `documents.uploadVersion` (sem requireRole), `lwr.list` (CLIENTE lia proposta comercial), `uploadBalance` (companyId ∈ família).
5. UI derivada da matriz (`PeoplePanel`, `DocumentPanel`, `CertidaoPanel`, `PortalPanel`, `FinancialProposalPanel`, `AppShell`, `Leads`, `AuditPanel`).
6. Testes de integração `CLIENTE × família alheia` (hoje só há mocks de `requireRole`).

## Fase 4+ — Demais itens

| # | Item | Arquivos-chave |
|---|---|---|
| 4 | Storage 5 MB (S3) — uploads falham em produção | `storage.ts:96`, `document-upload.ts:36`, migration `0012` | ✅ Concluída |
| 5 | Sessão: TTL curto + `jti` revogável; `sameSite:"lax"`; `trust proxy` | `auth.ts`, `cookies.ts`, `index.ts`, `db.ts`, migration `0014` | ✅ Concluída |
| 6 | Atomicidade: transactions, advisory lock ≤100%, DELETE-where, claim de token | `first-access-router`, `document-upload`, `lwr-router`, `company-repository`, `_shared/advisory-lock.ts` | ✅ Concluída |
| 7 | Auditoria: política única, audit no 1º acesso/leads, sem `catch {}` vazio | `family-router`, `lead-router`, `first-access-router` | Pendente |
| 8 | Entrypoint único `createApp()`; parar de versionar `api/index.js` | `api.ts`, `_core/index.ts`, CI |
| 9 | Deploy: `drizzle-kit migrate` no build; `0012_snapshot.json`; CI c/ migrations+E2E+lint | `vercel.json`, `drizzle/meta/`, `ci.yml` |
| 10 | LGPD: CPF opaco em paths, cascade de exclusão, doc de retenção, máscara em listas | `family-storage-path.ts`, `person-repository.ts`, `PeoplePanel` |
| 11 | UX: `<QueryState>` em 18 painéis, drawer mobile, `AuthGate` em 2 rotas, token via fragmento | painéis, `AppShell`, `App.tsx`, `PrimeiroAcesso` |
| 12 | A11y: `PropertyFormModal`→Dialog, labels/`aria-invalid`, contraste | formulários, `Dashboard`, `Leads` |
| 13 | Higiene: remover ~70 KB mortos, deps órfãs, `@ts-nocheck`, `test/` fora do git | showcase, `form.tsx`, `package.json` |
| 14 | Perf: N+1 dashboard, paginação, `React.lazy` por rota | `family-repository`, listagens, `App.tsx` |
| 15 | Terminologia "Projeto × Família"; traduzir 404/ErrorBoundary | `navigation`, `FamilyPage`, `NotFound`, `ErrorBoundary` |

## Gate de aceite por fase

- `pnpm check` 0 erros · `pnpm test` verde · cobertura não cair (branches 92.83 vs gate 92) · `drizzle-kit check`.
- Fase 2: novos testes de integração `CLIENTE × família alheia` em cada região.
