# POLÍTICA DE TESTES — LWOS

> Base de conhecimento: `C:\apps\QWork\docs\testing`  
> Documento movido para o projeto atual: `C:\apps\LWOS\docs\testing\POLITICA-TESTES-LWOS.md`  
> Nenhum arquivo existente do LWOS foi alterado. Apenas documento de referência criado.

---

## 1. CONTEXTO DO PROJETO (LWOS)

| Item | Valor |
|---|---|
| Nome | `lucathi-wealth-os` (LWOS) |
| Stack | TypeScript, React, Vite, tRPC, Drizzle ORM, PostgreSQL (`pg`), Tailwind CSS |
| Runner de testes | **Vitest** (único configurado — `vitest.config.ts`) |
| Ambiente de teste | `node` |
| Alias (`vitest.config.ts`) | `@` → `client/src` · `@shared` → `shared` · `@assets` → `attached_assets` |
| Scripts (`package.json`) | `pnpm test` (= `vitest run`) · `pnpm check` (= `tsc --noEmit`) |
| Include atual | `server/**/*.test.ts`, `server/**/*.spec.ts`, `shared/**/*.test.ts` |

### Testes existentes no projeto (referência)
- `server/auth.logout.test.ts`
- `server/features/access/authorization.test.ts`
- `server/features/documents/document-review.test.ts`
- `server/features/documents/document-types.test.ts`
- `server/features/families/family-types.test.ts`
- `shared/domain/roles.test.ts`

---

## 2. ESTRUTURA E LOCALIZAÇÃO DOS TESTES

**Base**: `ARCHITECTURE.md` + `INDEX.md` (QWork docs/testing)

- Manter testes próximos ao código testado (**co-location**).
- Não é obrigatório criar `__tests__/` centralizado; respeitar a estrutura atual do LWOS (`server/features/<dominio>/` e `shared/domain/`).

### Convenção de nomenclatura
- `*.test.ts` — teste padrão (unitário / integração leve)
- `*.spec.ts` — especificação alternativa
- `*.integration.test.ts` — fluxo multi-step (quando necessário)

---

## 3. PADRÃO AAA E DESCRIÇÕES (Português)

**Base**: `ARCHITECTURE.md` (QWork docs/testing)

Todas as descrições em Português:

```typescript
describe("auth.logout", () => {
  it("deve limpar o cookie de sessão e reportar sucesso", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

Em testes complexos, marcar com comentários explícitos:

```typescript
// Arrange: preparar contexto e mocks
// Act: executar a ação sendo testada
// Assert: verificar resultado esperado
```

---

## 4. POLÍTICA DE MOCKS

**Base**: `MOCKS_POLICY.md` (QWork docs/testing) — Seções 1-4 e 5

### Quando mockar
- APIs externas (`fetch`) quando o foco é a lógica interna, não a rede.
- Router / navegação (`wouter`, `next/navigation`) em testes de componentes.
- Módulos de DB (`drizzle` / `pg`) em testes de unidade / integração leve.
- APIs do navegador (`matchMedia`, `ResizeObserver`) quando componentes as utilizam.

### Quando NÃO mockar
- Quando o objetivo é validar o contrato real com o banco (integração com DB).
- Quando o mock ocultaria um bug real na dependência.

### Padrões obrigatórios
- Usar `mockImplementationOnce` para controle preciso (não apenas `mockResolvedValueOnce`).
- Limpar mocks entre testes:
  ```typescript
  beforeEach(() => {
    vi.clearAllMocks(); // equivalente Vitest
  });
  ```
- Mockar APIs do navegador quando usadas por componentes.
- Documentar casos complexos com comentários no arquivo de teste.

### Processo de correção de mocks (6 etapas — `MOCKS_POLICY.md`)
1. Identificar a falha (`testNamePattern` / `testPathPattern`)
2. Analisar contexto do teste
3. Diagnosticar mocks (verificar chamadas, conflitos, reset)
4. Corrigir mocks (`fetch`, `router`, APIs do navegador, renderização para efeitos)
5. Ajustar expectativas (seletores robustos, propriedades completas)
6. Validar correção (teste específico + relacionados + cobertura)

---

## 5. QUALIDADE DE TESTES — 10 CARACTERÍSTICAS

**Base**: `MOCKS_POLICY.md` — Seção 5 (Padrões de Qualidade) + `QUALITY-POLICY.md`

Score de referência: **0-100**.  
Meta mínima aceitável: **≥ 70/100**.

| # | Característica | Pontos | Regra obrigatória |
|---|---|---|---|
| 1 | JSDoc completo no topo do arquivo | +20 | Todo `.test.ts` deve iniciar com `/** ... */` contendo `@description`, `@see`, cobertura |
| 2 | Imports de tipos explícitos | +15 | Separar `import type` dos valores (`import`) |
| 3 | `beforeEach` com limpeza | +15 | `beforeEach(() => vi.clearAllMocks())` em todo `describe` que usa mocks |
| 4 | Comentários AAA | +10 | Marcar `Arrange`, `Act`, `Assert` em testes complexos |
| 5 | Mocks fortemente tipados | +10 | Preferir `vi.mocked()` ou tipagem explícita de mocks |
| 6 | Sem `console.log` | +10 | Remover todos antes do commit; apenas debug temporário permitido |
| 7 | Assertions com mensagens | +10 | Incluir mensagens descritivas quando útil |
| 8 | Documentação de casos de borda | +5 | Comentar cenários limites (lista vazia, valores nulos) |
| 9 | `TODO` com contexto | +3 | Se usar `@ts-ignore` / `@ts-nocheck`, documentar motivo e referência de issue |
| 10 | Setup em `beforeEach` | +2 | Configurações repetitivas centralizadas no `beforeEach` |

### Checklist por arquivo (base `MOCKS_POLICY.md` — Checklist de Qualidade)

- [ ] JSDoc completo no topo
- [ ] Imports separados (`type` vs valores)
- [ ] Mocks declarados e limpos (`beforeEach` com `vi.clearAllMocks()`)
- [ ] Estrutura `describe` / `it` organizada
- [ ] Comentários AAA nos cenários complexos
- [ ] Nome descritivo: `deve X quando Y` ou `NÃO deve X quando Z`
- [ ] Sem `console.log` de produção
- [ ] Sem `@ts-nocheck` injustificado
- [ ] Assertivas com mensagens quando útil
- [ ] Cleanup (`afterAll` / `afterEach`) para dados de teste, se aplicável

---

## 6. METAS DE COBERTURA (Referência — `ARCHITECTURE.md`)

**Base**: `ARCHITECTURE.md` (Coverage Targets — QWork docs/testing)

| Categoria | Meta | Justificativa |
|---|---|---|
| Global | 80% | Meta do projeto |
| Rotas API críticas (`auth`, `documents`, `access`) | 90%+ | Segurança e integridade |
| Componentes críticos (formulários, modais, dashboard) | 80%+ | Experiência do usuário |
| Branches / Functions / Lines | 50% | Stepping stone — aumentar gradualmente |

> Nota: `vitest.config.ts` atual do LWOS **não ativa cobertura**. Se necessário, adicionar `test: { coverage: { ... } }` no arquivo de configuração (não realizado neste documento — apenas referência).

---

## 7. SEGURANÇA E ISOLAMENTO (`ARCHITECTURE.md` — Seção Segurança)

- **Nunca** expor `DATABASE_URL` real no ambiente de teste.
- Se o LWOS utilizar banco de testes (`TEST_DATABASE_URL` ou equivalente), garantir isolamento completo do ambiente de produção.
- Cada teste deve limpar seus dados ou usar transações; **nunca** compartilhar estado entre `describe`.
- Garantir determinismo: `clearMocks: true` ou `vi.clearAllMocks()` obrigatório.

---

## 8. EXECUÇÃO E CI/CD (`ARCHITECTURE.md` — Pipeline Recomendado)

Ordem recomendada (referência para pipeline futuro — sem alteração no `package.json` atual):

1. `pnpm check` (`tsc --noEmit`)
2. `pnpm test` (`vitest run` — todos os testes configurados)
3. Cobertura (quando ativada na configuração)
4. Auditoria / validação (se implementada via scripts de referência)

Comandos de referência já disponíveis:
```bash
pnpm test          # vitest run
pnpm check         # tsc --noEmit
```

---

## 9. FERRAMENTAS DE APOIO (Referência — `MOCKS_POLICY.md` + `ARCHITECTURE.md`)

### Scripts de análise (base QWork)
- `scripts/analyze-test-quality.cjs` — análise automática de qualidade (score 0-100)
- `scripts/validate-mock-policy.cjs` — validador de conformidade com política de mocks

### Utilitários de mock (exemplos de referência)
```typescript
// Mock consistente de fetch
export const mockFetchResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});
```

### Documentação relacionada (QWork docs/testing)
- `MOCKS_POLICY_EXAMPLE.test.tsx` — exemplo prático de aplicação da política
- `TOP10-CHARACTERISTICS.md` — guia detalhado das 10 características
- `QUICK-REFERENCE.md` — referência rápida (60 segundos)
- `SANITIZATION-GUIDE.md` — processo de sanitização de testes
- `INVENTORY.md` — inventário completo de testes

---

## 10. OBSERVAÇÕES FINAIS

- Este documento é uma **política de referência** derivada exclusivamente de `C:\apps\QWork\docs\testing`.
- **Nenhum arquivo existente do LWOS foi alterado**, incluindo `vitest.config.ts`, `package.json`, `tsconfig.json` ou testes existentes.
- A aplicação prática desta política (ex.: ativar cobertura, criar novos testes seguindo o padrão, executar análise de qualidade) requer decisão explícita do usuário.
- Se futuramente forem adicionados testes de regressão com compatibilidade Jest, consultar o shim de referência (`__tests__/config/jest-globals-vitest-shim.ts`) sem conflitar com a configuração atual de Vitest.

---

**Última atualização (base QWork docs/testing)**: 31 de janeiro de 2026  
**Documento criado para LWOS**: `C:\apps\LWOS\docs\testing\POLITICA-TESTES-LWOS.md`
