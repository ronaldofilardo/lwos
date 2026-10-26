# Lucathi Wealth OS — LEIA-ME (entrega da atualização)

Pacote completo da plataforma de Due Diligence Patrimonial & Sucessória,
com a atualização de 10 fases já aplicada (validação, schema, pessoas,
imóveis, sociedades, ativos, documentos/certidões, alertas e regressão).

---

## 1. Pré-requisitos

- Node.js 22 LTS (ou 20.19+) e PNPM 10
- PostgreSQL local (`psql` no PATH) — bancos `lwos_db` (dev) e `lwos_db_test`
- Git (opcional)

## 2. Roteiro de aplicação — instalação do zero

```powershell
# 1. Extrair o zip em C:\apps\LWOS
cd C:\apps\LWOS

# 2. Dependências
pnpm install

# 3. Ambiente (NÃO commitar senha)
Copy-Item .env.local.example .env.local
notepad .env.local     # DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET, STORAGE_ROOT

# 4. Bancos
psql -U postgres -h localhost -c "CREATE DATABASE lwos_db;"
psql -U postgres -h localhost -c "CREATE DATABASE lwos_db_test;"

# 5. Migrations (18, na ordem do journal — ver seção 3)
$env:DATABASE_URL = "<url do lwos_db>"
pnpm exec drizzle-kit migrate

# 6. Usuários de demonstração (SOCIO/ANALISTA/ADMIN/CLIENTE)
psql -U postgres -d lwos_db -h localhost -f seed-dev-users.sql

# 7. Verificações
pnpm check
pnpm test

# 8. Subir
pnpm dev
```

### Atualização de uma instalação existente

Rode somente o passo 5 — o `drizzle-kit migrate` aplica apenas as migrations
pendentes.

## 3. Lista de migrations (ordem do journal)

| # | Migration | O que faz |
|---|---|---|
| 1 | `0000_easy_jazinda` | Schema base (users, families, people, documents, properties, companies, proposals, …) |
| 2 | `0001_smooth_puppet_master` | Ajuste de constraint em `users` |
| 3 | `0002_lowly_thundra` | Titular de contato (`people.isPrimaryContact`) |
| 4 | `0003_slim_mojo` | Enum `assetCategory` e ajustes de ativos |
| 5 | `0004_quiet_johnny_storm` | Enum `leadStatus` — fluxo de interessados |
| 6 | `0006_concerned_the_watchers` | Tabela `firstAccessLinks` (link de primeiro acesso) |
| 7 | `0007_fantastic_cannonball` | Unicidade do titular de contato |
| 8 | `0008_vinculo_pessoas` | Enum `vinculo` (TITULAR, CONJUGE, FILHO, NETO, BISNETO) |
| 9 | `0009_couple_shared_docs` | Documentos compartilhados do casal |
| 10 | `0010_certidoes_secoes_anexos` | Seções/anexos de certidões, escopo PESSOA/SOCIEDADE |
| 11 | `0011_company_details` | Ficha de detalhes da sociedade (holding) |
| 12 | `0012_file_blobs` | Tabela `fileBlobs` (armazenamento de arquivos) |
| 13 | `20261009143825_fase2_schema_adjustments` | Ajustes da Fase 2: `families` enxuta, gravame em `properties`, `otherAssets.marketValue` removido, checks de valores |
| 14 | `0014_plain_green_goblin` | ... |
| 15 | `0015_address_and_cep_fields` | Campos de endereço e CEP em imóveis |
| 16 | `0016_asset_offshore_categories` | Categorias de ativos offshore |
| 17 | `0017_company_administrators_and_stakeholder_cpf` | Administradores de sociedade e CPF de stakeholder |
| 18 | `0018_titular_primary_contact_default` | Titular de contato com valor padrão |

## 4. Verificações (regressão da Fase 10)

```powershell
pnpm check                        # TypeScript sem erros
pnpm test                         # todos os testes (unitários por feature)
pnpm test:coverage                # gates: lines/stmts >= 81, branches >= 92, functions >= 80
pnpm build                        # bundle do cliente + da API

# E2E de ponta a ponta (usa o banco dev e REMOVE os dados no final):
pnpm exec tsx scripts/e2e-full-project.ts

# Migrations aplicam do zero? (cria banco descartável, compara com o dev, apaga):
pnpm exec tsx scripts/check-migrations-fresh.ts
```

O E2E percorre: projeto com 2 objetivos → titular/cônjuge/filho menor →
imóvel urbano (gravame nasce `PENDENTE`) e rural (CCIR/NIRF) → titularidade →
gravame pode ser vinculado a sociedade com qualquer semáforo → LTDA (CNPJ com DV, quadro 100%) e
offshore (sem CNPJ/certidões) → ativo → certidões (POSITIVA/SOMENTE_FISICA/
pendente) → alertas vermelho/amarelo → gate de conclusão (gravame pendente e
certidão vermelha sem justificativa) → conclusão com justificativa auditada.

## 5. O que mudou — Fases 1 a 10

| Fase | Commit | Conteúdo |
|---|---|---|
| 1 | `26f4d5c` | Núcleo de validação compartilhado (CPF, CNPJ, UF, telefone, datas, dinheiro) |
| 2 | `6d06063` | Schema: `families` enxuta, enums, checks, migrations da Fase 2 |
| 3 | `00f3ee2` | Projeto com objetivos múltiplos, lista com status/titular, rótulos «Projeto» |
| 4 | `806f679` | Pessoas: validação por vínculo, endereço, edição e exclusão |
| 5 | `328e952` | Imóveis: localização, valores, gravames com semáforo e titularidade pessoa/sociedade |
| 6 | `0b97fdf` | Sociedades: CNPJ com DV, offshore, S/A vs Simples, quadro com valor investido |
| 7 | `6e28d33` | Demais ativos: categoria obrigatória sem default, valor > 0, editar/excluir com auditoria |
| 8 | `8927540` | Documentos e certidões: fonte única `computeRequirements`, reconcile com gatilhos, IRPF do titular herdado |
| 9 | `aa3be30` | Alertas por projeto, gate de conclusão e trava de gravame na titularidade |
| 10 | (este pacote) | Regressão: varredura de usos antigos, E2E ponta a ponta, migrations do zero, docs |

## 6. Padrões adotados

- **Servidor é a fonte da verdade**: toda regra (CPF/CNPJ, soma ≤ 100%,
  cônjuge único, menor sempre solteiro, gravames, gate) é validada no servidor;
  o cliente só espelha com mensagens em pt-BR vindas do erro.
- **Validações no núcleo**: nenhuma tela reimplementa CPF/CNPJ — todas usam
  `shared/validation`.
- **Auditoria em toda mutação relevante** (`auditLogs.metadata` só
  `string | number | boolean`).
- **Alertas calculados só no servidor** (`certidoes.summary`) e reutilizados
  nas telas e na lista de projetos.
- **Cobertura com gates** (81/92/80) e testes por feature.

Ver `docs/tbd-registry.md` para a tabela completa de decisões fechadas e
`docs/plano-atualizacao-lwos.md` para o plano original das fases.

## 7. Checklist de aceite final

- [x] Nenhum CPF/CNPJ inválido é aceito
- [x] Nenhum campo obrigatório é salvo vazio ou com placeholder
- [x] Nenhuma soma de participação/titularidade passa de 100%
- [x] Cônjuge único e menor sempre solteiro
- [x] Gravame nasce Pendente; sociedade pode ser vinculada com qualquer gravame
- [x] S/A não aceita Simples Nacional
- [x] Cada documento tem um único lugar de upload
- [x] Alertas vermelhos refletem certidões positivas ou somente físicas
- [x] Projeto não conclui com imóvel pendente
- [x] Todas as migrations aplicam do zero e todos os testes passam

---

## 8. Apêndice — fluxo de interessados (mantido)

O formulário público `/interesse` (link «Tenho interesse em conhecer a
Lucathi» no login) grava um lead em `server/features/leads/` (tipos,
repositório e roteador), com upload em `STORAGE_ROOT/leads/{leadId}/`.
A tela `/interessados` (SOCIO/ADMIN) aceita ou recusa o lead; ao aceitar,
cria a família e cadastra o interessado como titular (o botão «Gerar link de
primeiro acesso» passa a funcionar direto). Não há e-mail/notificação
automática por design. O proxy `/local-storage/*` libera o arquivo do lead
somente para SOCIO/ADMIN.
