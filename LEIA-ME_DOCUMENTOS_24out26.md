# LWOS — Entrega: Documentos e Certidões (24/10/2026)

Origem: `Considerações_Documentos_LWOS_24out26.docx`. Os caminhos do zip são relativos à raiz do projeto: copie por cima, mantendo as pastas. Sem migration e sem dependência nova. Typecheck (`tsc --noEmit`) passou; os testes **não** foram executados.

## O que mudou, por item do documento

| # | Item | Solução | Arquivos |
|---|------|---------|----------|
| 1 | Subtítulo "Organizada por…" | Removido o parágrafo inteiro do cabeçalho | `DocumentPanel.tsx` |
| 2 | Documentos × Certidões | Seções separadas: *Família (Pessoas)* / *Família (Pessoas) · Certidões* e *Sociedades & Holdings* / *… · Certidões*; em cada uma continua o clique no membro para abrir a lista. Certidão de casamento permanece em **Documentos** | `groupDocuments.ts`, `DocumentPanel.tsx` |
| 3 | "Dispensar" não funcionava | Causa: o botão só alternava um estado e a tela de justificativa nunca era desenhada. Agora abre campo de justificativa + "Confirmar dispensa" / "Cancelar" (Enter confirma, Esc cancela) | `DocumentActions.tsx` |
| 4 | Offshore | Removidos "Testamento local da jurisdição", "Cláusulas sucessórias" e "Conferência de IRPF/Declaração ao Banco Central" | `document-requirements.ts` |
| 5 | Ativos sem documentos | `computeAssetCategories()` retorna `[]`; a reconciliação deixou de ignorar lista vazia e remove pendências antigas sem arquivo; seção "Ativos" some da matriz e da Visão Unificada quando vazia | `document-requirements.ts`, `UnifiedRequirementsMap.tsx` |
| 6 | "!" do imóvel | Agora reflete a entrega da matrícula (ou escritura/contrato quando não há matrícula): amarelo se pendente/rejeitada; sem alerta se enviada, validada, dispensada ou "Não possui". Não usa mais certidões do titular | `propertyMatriculaAlert.ts`, `PropertyRow.tsx`, `AlertIndicator.tsx` (rótulo acessível neutro) |
| 7 | "Não possui" pendente na Visão Unificada | Nova definição única de "resolvido" (validado, dispensado ou não possui) em `shared/domain/document-status.ts`, usada na matriz, na Visão Unificada e na timeline. A Visão Unificada passa a mostrar o status "Não possui" e o nome do dono nas certidões | `document-status.ts`, `UnifiedRequirementsMap.tsx`, `groupDocuments.ts`, `family-timeline-repository.ts` |
| 8 | Erro no upload | Ver abaixo | `advisory-lock.ts`, `document-upload.ts`, `DocumentActions.tsx` |

### Item 8 — erro no upload (causa provável, não confirmada)
- `withAdvisoryLock` lia o resultado do lock como array. O `drizzle-orm/node-postgres` devolve `QueryResult` (`{ rows }`), então o lock nunca era considerado obtido e o upload lançava "Operação concorrente em andamento", que o tRPC mostra como **"Erro interno"**. Corrigido para aceitar os dois formatos (vale também para primeiro acesso, LWR e percentual de sócios).
- Arquivo acima de 5 MB também virava "Erro interno"; agora volta a mensagem "Arquivo inválido ou maior que 5 MB."
- O seletor de arquivo agora só oferece os tipos aceitos pelo servidor: PDF, JPG, PNG, WebP e XLSX.
- Se o erro persistir, a mensagem real está no log do servidor (`trpc.internal_error`).

## Depois de aplicar
1. Abra o projeto e clique em **Gerar requisitos**. Isso remove as pendências antigas de Ativos e as 3 categorias offshore (somente PENDENTE sem arquivo; itens já marcados "Não possui", dispensados ou com arquivo permanecem — como os dados são de teste, pode excluí-los).
2. Teste o upload de um PDF pequeno.

## Complemento (25/10/2026) — alertas de certidão
- Certidão cujo documento foi **dispensado** ou marcado **"Não possui"** deixa de gerar alerta (!) em Pessoas/Sociedades, na contagem do resumo e no nível da lista de projetos. Implementado em `project-alerts-repository.ts` (sem migration; o status da certidão em si não muda). Ao dispensar, o resumo de alertas é recarregado na tela (`useDocumentActions.ts`).
- Gravame **Pendente** continua bloqueando a conclusão do projeto, sem possibilidade de justificativa (comportamento já coberto por teste). A regra "só o vermelho trava" vale para a movimentação do imóvel, não para a conclusão do projeto.

## Testes (terminal do VS Code, na raiz do projeto)
```powershell
# Somente o que foi alterado
pnpm exec vitest run shared/domain/document-status server/_shared/advisory-lock server/features/documents server/features/alerts server/features/families server/features/assets client/src/features/documents client/src/features/properties

# Suíte completa e typecheck
pnpm test
pnpm check
```
Testes novos/ajustados: `document-status.test.ts`, `propertyMatriculaAlert.test.ts`, `advisory-lock.test.ts`, `document-requirements.test.ts`, `groupDocuments.test.ts`, `project-alerts-repository.test.ts`.
