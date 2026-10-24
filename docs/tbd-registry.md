# Registro de TBDs

| ID | Tema | Estado atual | Como o sistema deve reagir agora |
|---|---|---|---|
| TBD-01 | PostgreSQL/Neon | Portabilidade pendente | Usar o banco do scaffold sem acoplar a UI a detalhes do provider |
| TBD-02 | Scheduler e alertas automáticos | Não adotado | Calcular alertas sob demanda; não criar jobs em background |
| TBD-03 | MFA | Fora do MVP1 | Aplicar controles compensatórios de sessão e autorização |
| TBD-04 | Backup e restauração | Fase de produção | Não declarar o sistema pronto para produção externa |
| TBD-05 | Matriz completa de documentos de imóveis e sociedades | Resolvido na modelagem | Imóveis: Matrícula, IPTU ou ITR (se sem matrícula: Escritura ou Contrato C&V). Sociedades: Contrato Social/Alteração consolidada, CNPJ; se S/A: Estatuto e Atas. Dispensa formalizada pelo advogado e aprovada pelo Sócio. |
| TBD-06 | Efeitos patrimoniais dos regimes | Validado para MVP | STB sem distinção convencional/obrigatória na interface; apuração macro do patrimônio conjunto frente à sucessão aos herdeiros |
| TBD-07 | Relações sucessórias e procuradores | MVP2 | Não criar relações ou poderes automaticamente |
| TBD-08 | LWR, proposta financeira e contratação | Resolvido na modelagem | LWR gerenciado como apresentação Taylor-made (Canva/slides); Proposta financeira separada com escopo, valor, aceite e fluxo de contraproposta com análise pelo Sócio |
| TBD-09 | Cálculos tributários avançados | MVP2 | Exibir somente cálculos e parâmetros formalmente aprovados |
| TBD-10 | Tela inicial: campo de clientes aniversariantes (baixa prioridade). | Backlog | Não implementar agora; registrar apenas como demanda futura |

## Decisões fechadas e padrões adotados (atualização Fases 1–10)

| Tema | Decisão fechada | Onde vive |
|---|---|---|
| Validação de CPF/CNPJ/telefone/data/dinheiro/UF | Núcleo único em `shared/validation` (Fase 1). Nenhuma tela valida por conta própria; o servidor revalida com o mesmo núcleo. | `shared/validation/*`, `person-types.ts`, `company-types.ts` |
| Fonte da verdade | O servidor decide. O cliente só espelha (máscaras, botões desabilitados); todo erro de regra vem do servidor em pt-BR. | `server/features/**` |
| Schema enxuto (Fase 2) | `families` sem estado civil/regime (vivem em `people`); `otherAssets` sem `marketValue` (usa `declaredValue > 0`); tabela `encumbrances` removida (gravame é coluna em `properties`); categoria de ativo é enum obrigatório sem default. | `drizzle/schema.ts`, migração `20261009143825_fase2_schema_adjustments.sql` |
| Gravame do imóvel | Nasce `PENDENTE`; `NA`/`NAO_HA` = sem gravame; os demais tipos são vermelhos e travam ações de movimentação (adicionar/editar titularidade). Exclusão de titularidade não trava. Remoção exige zerar o gravame. | `property-types.ts::isEncumbranceRed`, `property-repository.ts::assertPropertyMovementAllowed` |
| Status do projeto | Vive em `projects.status` (`ATIVO`, `SUSPENSO`, `CONCLUIDO`, `CANCELADO`), com objetivos múltiplos em `projectObjectives`. | `family-repository.ts`, `family-router.ts` |
| Gate de conclusão (Fase 9) | `CONCLUIDO` exige: nenhum imóvel com gravame `PENDENTE` e nenhuma certidão em vermelho sem justificativa registrada. A justificativa vai no audit (`PROJETO_STATUS_ATUALIZADO`). | `alerts/project-alerts.ts`, `family-router.ts::updateStatus` |
| Alertas de certidão (Fase 9) | Vermelho: `POSITIVA` ou `SOMENTE_FISICA`. Amarelo: `PENDENTE` ou vencida (`validUntil` no passado). `POSITIVA_COM_EFEITOS_DE_NEGATIVA` não alerta. Cálculo só no servidor, reutilizado pelas telas e pela lista de projetos (campo `alerts`). | `alerts/project-alerts.ts`, `certidao-router.ts::summary` |
| Offshore | Não tem CNPJ nem certidões nacionais — o backfill familiar e a criação da sociedade pulam offshore. | `company-types.ts`, `certidao-repository.ts::ensureFamilyCertidoes` |
| Participações e titularidades | Soma nunca passa de 100% (com epsilon), sem duplicidade de participante. | `company-repository.ts`, `property-repository.ts` |
| Pessoas por vínculo | Titular exige e-mail+telefone e é único; cônjuge é único e nasce `CASADO`/`CPB`; menor de 18 é sempre solteiro, sem regime e sem cônjuge; casado exige regime + nome do cônjuge; neto/bisneto exigem parentesco. | `person-types.ts::collectPersonIssues`, `person-repository.ts` |
| Documentos | Um único lugar de upload por documento (modal «Detalhes» e seção mostram o mesmo status); requisitos recalculados por gatilhos (estado civil, tipo de imóvel, natureza da sociedade); dispensa formalizada e aprovada. | `documents/**` (Fase 8) |
| Auditoria | Toda mutação relevante grava `auditLogs` com `metadata` apenas `string \| number \| boolean`. | `audit/audit-repository.ts` |
| Testes | Cobertura por feature com mocks em `vi.hoisted`; gates de coverage (lines/stmts 81, branches 92, functions 80) ratchet no CI. E2E ponta a ponta em `scripts/e2e-full-project.ts`. | `**/*.test.ts`, `scripts/` |
