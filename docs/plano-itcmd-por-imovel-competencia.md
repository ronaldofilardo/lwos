# ⚖️ Plano de Execução — ITCMD por Imóvel & Mapa de Competência Fiscal Estadual

Este documento detalha a reformulação do cálculo do **ITCMD (Imposto sobre Transmissão Causa Mortis e Doação)** no Lucathi Wealth OS, alinhando a plataforma estritamente ao mandamento constitucional do **Artigo 155, § 1º da Constituição Federal de 1988**.

---

## 🏛️ 1. Fundamentação Jurídica & Regra de Negócio

A tributação do ITCMD no Brasil não admite uma alíquota única sobre o patrimônio global quando os bens estão em estados distintos:

1. **Bens Imóveis (Art. 155, § 1º, I da CF):**
   - A competência tributária pertence ao **Estado de situação do imóvel** (`property.uf`).
   - Um imóvel no Rio de Janeiro recolhe para a SEFAZ-RJ (alíquotas progressivas de 4% a 8% em UFIR-RJ).
   - Uma fazenda no Mato Grosso recolhe para a SEFAZ-MT (tabela em UPF-MT).
   - Um apartamento em São Paulo recolhe para a SEFAZ-SP (4% fixo).
2. **Sociedades (Holdings), Dinheiro e Demais Ativos (Art. 155, § 1º, II da CF):**
   - A competência tributária pertence ao **Estado onde tiver domicílio o doador/patriarca** (`patriarchUf`).
   - As cotas da holding familiar e os investimentos líquidos recolhem no domicílio fiscal da família.
3. **Pluralidade de Imóveis no Mesmo Estado:**
   - Se a família possui mais de um imóvel na mesma UF (ex: dois imóveis no RJ), o Fisco estadual soma as bases de cálculo daqueles imóveis para enquadramento nas faixas progressivas do estado.

---

## 📐 2. Engenharia do Cálculo (Domain Engine)

### 2.1. Cálculo Individual por Imóvel
Para cada imóvel $i$:
$$\text{UF}_i = \text{property.uf} \lor \text{property.registryUf} \lor \text{patriarchUf}$$
$$\text{ITCMD Individual}_i = \text{calculateItcmdForUf}(\text{marketValue}_i, \text{brackets}(\text{UF}_i))$$

### 2.2. Consolidação por Estado Credor (Competência Multi-SEFAZ)
1. **Agrupamento de Imóveis por UF:**
   Para cada UF onde a família possui imóveis:
   $$\text{Base Imóveis}(\text{UF}) = \sum_{i \in \text{UF}} \text{marketValue}_i$$
   $$\text{ITCMD Imóveis}(\text{UF}) = \text{calculateItcmdForUf}(\text{Base Imóveis}(\text{UF}), \text{brackets}(\text{UF}))$$

2. **Agrupamento de Móveis e Sociedades:**
   Na UF de domicílio dos patriarcas (`patriarchUf`):
   $$\text{Base Móveis} = \text{Sociedades dos Patriarcas} + \text{Demais Ativos dos Patriarcas}$$
   $$\text{ITCMD Móveis} = \text{calculateItcmdForUf}(\text{Base Móveis}, \text{brackets}(\text{patriarchUf}))$$

3. **Total Consolidado da Família:**
   $$\text{ITCMD Total Familiar} = \sum_{\text{todas as UFs}} \text{ITCMD Imóveis}(\text{UF}) + \text{ITCMD Móveis}$$
   $$\text{Alíquota Efetiva Global} = \frac{\text{ITCMD Total Familiar}}{\text{Patrimônio Total dos Patriarcas}} \times 100$$

---

## 🖥️ 3. Experiência de Usuário (UX/UI na Aba Cálculos)

### Ponto A: Tabela de Imóveis (Ficha Tributária)
- No modal de detalhe do imóvel ([`PropertyTaxDetailModal.tsx`](file:///c:/apps/LWOS/client/src/features/calculations/components/PropertyTaxDetailModal.tsx)), adicionar o bloco de **Sucessão / ITCMD do Imóvel**:
  - Exibe a UF de situação do bem (`property.uf`).
  - ITCMD individual daquele imóvel específico.
  - Alíquota efetiva estadual aplicada àquele bem.

### Ponto B: Card Executivo de Diagnóstico Sucessório ([`ItcmdSuccessionCard.tsx`](file:///c:/apps/LWOS/client/src/features/calculations/components/ItcmdSuccessionCard.tsx))
Reformulado para exibir o **Mapa de Competência Fiscal**:
1. **KPIs Superiores (Visão Consolidada):**
   - Patrimônio Sucessório Total (R$)
   - Custo Sucessório Real Total (Soma das SEFAZ) (R$)
   - Alíquota Efetiva Média Global (%)
2. **Tabela por Estado Credor (Breakdown Multi-SEFAZ):**
   - Linhas claras por estado:
     - **Estado (UF)** (ex: `SP`, `RJ`, `MT`)
     - **Escopo do Tributo** (ex: *"Imóveis em SP + Sociedades (Domicílio)"*, *"Apto Barra (RJ)"*)
     - **Base Tributável na UF** (R$)
     - **Alíquota Média da UF** (%)
     - **Imposto Devido ao Estado** (R$)

---

## 🏗️ 4. Estrutura Modular dos Arquivos (STE-DEV)

```text
shared/domain/
  ├── itcmd-engine.ts                  # Adição de computeMultiStateSuccessionTax (< 95 linhas)
  └── itcmd-engine.test.ts             # Teste de família multi-estado (SP + RJ + MT)

client/src/features/calculations/
  ├── types.ts                         # Novas tipagens StateCompetenceSummary e MultiStateItcmdResult
  ├── hooks/
  │   └── useCalculationsData.ts       # Orquestra os cálculos agrupados por UF do imóvel e do domicílio
  └── components/
      ├── ItcmdSuccessionCard.tsx      # Card executivo consolidado com seletor de domicílio (< 95 linhas)
      ├── ItcmdCompetenceTable.tsx     # Tabela de rateio por Estado Credor (SEFAZ) (< 80 linhas)
      └── PropertyTaxDetailModal.tsx   # Inclusão do ITCMD na ficha do imóvel
```

---

## 📋 5. Fases de Execução

- **Fase 1:** Ampliar `shared/domain/itcmd-engine.ts` com a função `computeMultiStateSuccessionTax`:
  - Recebe lista de imóveis `{ uf: string, value: number }` e ativos móveis `{ uf: string, value: number }`.
  - Calcula a incidência por estado e agrega os resultados.
  - Cobertura de testes unitários em `itcmd-engine.test.ts`.
- **Fase 2:** Atualizar `useCalculationsData.ts` para computar a distribuição multi-estado da família ativa.
- **Fase 3:** Criar componente `ItcmdCompetenceTable.tsx` exibindo a tabela por estado credor.
- **Fase 4:** Atualizar `ItcmdSuccessionCard.tsx` para apresentar a visão multi-SEFAZ.
- **Fase 5:** Exibir o ITCMD individual no modal `PropertyTaxDetailModal.tsx`.
- **Fase 6:** Validação com `pnpm check`, `npx vitest run` e `pnpm build`.

