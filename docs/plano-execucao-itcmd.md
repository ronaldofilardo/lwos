# ⚖️ Plano de Execução — Módulo ITCMD (Setup Admin & Análise do Sócio)

Este documento estabelece o plano executivo, técnico e modular para a implementação do cálculo do **ITCMD (Imposto sobre Transmissão Causa Mortis e Doação)** no Lucathi Wealth OS.

O projeto atende a duas frentes integradas:
1. **Administração da Plataforma (`/setup`):** Gestão centralizada das políticas estaduais das 27 UFs (faixas de valor, alíquotas progressivas/fixas, imposto devido/parcela a deduzir e indexadores fiscais estaduais).
2. **Consultoria do Sócio (`/familias/:familyId` -> Aba "Cálculos"):** Seção executiva "ITCMD — Imposto sobre Transmissão", posicionada abaixo das métricas de imóveis, com carregamento inteligente da UF do patriarca e arquitetura visual compacta para controlar o crescimento vertical da aba.

A execução observa estritamente os padrões da metodologia **STE-DEV** (módulos < 100 linhas, tipagem estrita, funções de domínio puras e cobertura de testes > 92%).

---

## 🏛️ 1. Diagnóstico de UX: Como Resolver o Desafio "A Aba Cálculos já está crescendo"

A inclusão de uma nova seção robusta de ITCMD abaixo do *Comparativo Tributário de Imóveis* pode gerar sobrecarga cognitiva se despejar muitas tabelas abertas. Para mitigar o crescimento da aba e manter a elegância executiva de um escritório de *Wealth Engineering*, adotaremos a seguinte arquitetura de design:

### Padrão Adotado: Card Executivo de Duplo Estado (Compacto + Gaveta Expansível)

1. **Estado Normal (Default - Resumo de Alto Nível):**
   - Ocupa apenas um card horizontal compacto.
   - Mostra:
     - **Seletor de UF de Domicílio** (pré-selecionado com a UF do Titular/Patriarca).
     - **Patrimônio Sucessório Total (Base)** (R$).
     - **ITCMD Estimado Total** (R$).
     - **Alíquota Efetiva Ponderada** (ex: `3,85%`).
     - Botão discreto: `Simular outra UF / Ver Faixas Aplicadas ▾`.
2. **Estado Expandido (Ao clicar para aprofundar):**
   - Revela a memória de cálculo:
     - Memória de cálculo por faixa (qual parcela caiu em cada alíquota do estado).
     - Alerta de indexador (ex.: *"Convertido com base em 1.200 UFESP vigentes"*).
     - Comparativo de economia sucessória (impacto de doação em vida vs. inventário se aplicável).

Desta forma, quem abre a aba Cálculos tem o número de impacto sucessório imediatamente visível sem precisar rolar páginas extras.

---

## 📐 2. Modelagem do Domínio e Fórmulas Tributárias

### 2.1. Unidades Indexadas e Base em Reais
Vários estados brasileiros não estipulam as faixas em Reais na lei, mas em indexadores estaduais (ex.: SP usa UFESP, RJ usa UFIR-RJ, BA usa UFM, etc.). O motor converterá dinamicamente:

$$\text{Limite em R\$} = \text{Teto na Unidade Fiscal} \times \text{Valor da Unidade em R\$}$$

### 2.2. Algoritmo de Cálculo Progressivo do ITCMD
Para uma dada UF e um Patrimônio Sucessório $P$:
1. Identifica-se a tabela de faixas ordenadas daquela UF.
2. Para cada faixa $i$ com piso $L_{i-1}$, teto $L_i$, alíquota $A_i$ e imposto acumulado/parcela a deduzir $D_i$:
   - Se a UF adota o modelo de **parcela a deduzir**:
     $$\text{ITCMD} = (P \times A_i) - D_i$$
   - Se a UF adota o modelo de **fatiamento por faixas (progressão pura)**:
     $$\text{ITCMD} = \sum_{k=1}^{n} \max(0, \min(P, L_k) - L_{k-1}) \times A_k$$
   - Se a UF adota alíquota fixa (ex: 4% linear):
     $$\text{ITCMD} = P \times A$$

### 2.3. Base Sucessória da Família
- Por padrão, a base sucessória compreende o **Patrimônio Total Familiar dos Patriarcas** (Imóveis + Sociedades + Demais Ativos dos titulares já apurados pela `family-wealth-calculator.ts`).
- Permite filtro de simulação para calcular apenas sobre os bens do Titular ou sobre o conjunto do casal.

---

## 🗄️ 3. Modelo de Dados (PostgreSQL / Drizzle ORM)

### Nova Tabela: `itcmdBrackets`

```typescript
// drizzle/schema.ts
export const itcmdBrackets = pgTable(
  "itcmdBrackets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    uf: varchar("uf", { length: 2 }).notNull(),
    bracketOrder: integer("bracketOrder").notNull(),
    limitValue: decimal("limitValue", { precision: 15, scale: 2 }).notNull(),
    rate: decimal("rate", { precision: 6, scale: 4 }).notNull(),
    accumulatedTax: decimal("accumulatedTax", { precision: 15, scale: 2 }).default("0.00"),
    deductionValue: decimal("deductionValue", { precision: 15, scale: 2 }).default("0.00"),
    indexedUnitName: varchar("indexedUnitName", { length: 30 }),
    indexedUnitValue: decimal("indexedUnitValue", { precision: 10, scale: 4 }),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => [
    index("itcmd_brackets_uf_idx").on(table.uf),
  ]
);
```

### Migração Drizzle
- Será gerada como `0019_itcmd_brackets.sql` com registro correspondente no `drizzle/meta/_journal.json`.
- Acompanhará um seed com as regras iniciais vigentes para as 27 UFs.

---

## 🏗️ 4. Estrutura Modular dos Arquivos (< 100 linhas por arquivo)

```text
c:/apps/LWOS/
├── shared/domain/
│   ├── itcmd-engine.ts                  # Motor puro de cálculo por faixas e UFs (< 90 linhas)
│   ├── itcmd-types.ts                   # Interfaces, tipos canônicos e UFs (< 50 linhas)
│   └── itcmd-engine.test.ts             # Testes de regressão cobrindo UFs fixas, progressivas e indexadas
│
├── server/features/setup/
│   ├── itcmd-repository.ts              # Consultas Drizzle para listar e atualizar políticas por UF (< 85 linhas)
│   ├── itcmd-repository.test.ts         # Testes de integração do repositório
│   ├── itcmd-router.ts                  # Router tRPC 'setup' protegido por requireRole(["ADMIN", "SOCIO"]) (< 80 linhas)
│   └── itcmd-router.test.ts             # Testes de autorização e endpoints
│
├── client/src/features/setup/
│   ├── SetupPage.tsx                    # Shell da rota /setup com Tabs de navegação (< 65 linhas)
│   ├── ItcmdPanel.tsx                   # Container da aba ITCMD no Setup (< 80 linhas)
│   ├── UfSelectorBar.tsx                # Seletor/filtro visual de UFs por região (< 75 linhas)
│   ├── UfBracketTable.tsx               # Tabela interativa para gerenciar faixas da UF (< 95 linhas)
│   ├── UfBracketFormModal.tsx           # Modal para adicionar/editar faixa de alíquota (< 90 linhas)
│   └── UfUnitValueDialog.tsx            # Diálogo para atualizar o valor anual da UFESP/UFIR (< 70 linhas)
│
├── client/src/features/calculations/components/
│   ├── ItcmdSuccessionCard.tsx          # Card executivo compacto do ITCMD na aba Cálculos (< 85 linhas)
│   ├── ItcmdMemoryBreakdown.tsx         # Gaveta com memória detalhada da progressão (< 80 linhas)
│   └── ItcmdUfSimulatorSelect.tsx       # Dropdown rápido de troca de UF para simulação (< 60 linhas)
│
└── client/src/components/lucathi/
    └── navigation.ts                    # Adição do item 'Setup' com guard de permissão
```

---

## 📋 5. Fases de Execução Passo a Passo

### Fase 1: Domínio Matemático & Tipos Canônicos
- Criar `shared/domain/itcmd-types.ts` com tipos de faixas, UFs e resultado de cálculo.
- Criar `shared/domain/itcmd-engine.ts` com funções puras:
  - `calculateItcmdForUf(patrimony: number, brackets: ItcmdBracket[]): ItcmdResult`
  - `convertIndexedLimits(brackets: ItcmdBracket[], unitValue: number): ItcmdBracket[]`
- Criar suíte completa `shared/domain/itcmd-engine.test.ts` com validação matemática para estados de alíquota fixa (ex: SP, PR) e progressiva (ex: RJ, RS, MG, BA).

### Fase 2: Banco de Dados, Migração e Seed
- Adicionar a tabela `itcmdBrackets` no `drizzle/schema.ts`.
- Criar a migração `0019_itcmd_brackets.sql` e atualizar o `_journal.json`.
- Criar script ou fixture de seed para carregar a tabela básica das 27 UFs.
- Validar com `pnpm check`.

### Fase 3: Camada de Servidor (Repositório e Router tRPC)
- Criar `server/features/setup/itcmd-repository.ts` com métodos `listByUf`, `upsertUfPolicy`, `getUfPolicy`.
- Criar `server/features/setup/itcmd-router.ts` com:
  - `setup.itcmd.listUfs` (público para usuários logados da equipe)
  - `setup.itcmd.getByUf` (busca as faixas da UF)
  - `setup.itcmd.updatePolicy` (mutação protegida para `SOCIO` e `ADMIN`)
- Conectar o router em `server/routers.ts` sob o namespace `setup`.
- Escrever testes em `itcmd-router.test.ts`.

### Fase 4: Módulo Admin / Setup (`/setup`)
- Adicionar a rota `/setup` em `client/src/App.tsx`.
- Incluir o item de navegação `Setup` no menu lateral do `AppShell.tsx` condicionado a `isAdmin(user?.role)`.
- Implementar os componentes:
  - `SetupPage.tsx`
  - `ItcmdPanel.tsx`
  - `UfSelectorBar.tsx`
  - `UfBracketTable.tsx`
  - `UfBracketFormModal.tsx`

### Fase 5: Experiência do Sócio na Aba "Cálculos"
- Implementar `ItcmdSuccessionCard.tsx` no `client/src/features/calculations/components/`.
- Integrar no hook `useCalculationsData.ts` a busca da política do estado do titular e os cálculos do ITCMD sobre o patrimônio dos patriarcas.
- Inserir a nova seção ao final de `CalculationsTab.tsx`.
- Adicionar testes de renderização e interação para os novos componentes.

### Fase 6: Homologação e Verificações Finais
- `pnpm check`: Confirmar 0 erros de tipagem TypeScript.
- `npx vitest run`: Confirmar 100% de aprovação de todos os testes unitários.
- `pnpm build`: Confirmar geração dos bundles de produção sem avisos.

---

## 🎯 6. Critérios de Sucesso e Aceite

1. **Admin:** Consegue acessar `/setup`, navegar entre as 27 UFs, editar faixas, alterar valor de unidade indexada e salvar com persistência imediata.
2. **Sócio:** Ao acessar `/familias/:familyId` na aba **Cálculos**:
   - Visualiza imediatamente o card executivo "ITCMD — Imposto sobre Transmissão".
   - A UF padrão do domicílio do patriarca vem selecionada automaticamente.
   - O imposto estimado e a alíquota efetiva batem com a matemática oficial do estado.
   - O sócio pode trocar a UF dinamicamente para simular *"E se a família mudar o domicílio fiscal para outro estado?"*.
   - A página permanece enxuta, sem excesso de rolagem vertical.
3. **Qualidade de Código:** Todos os novos arquivos estritamente abaixo de 100 linhas e 100% testados.

