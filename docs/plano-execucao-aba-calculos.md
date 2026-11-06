# 📊 Plano de Execução — Aba ‘Cálculos’ do Patrimônio

Este documento estabelece o plano detalhado e modular de implementação da nova aba **‘Cálculos’** na Área de Trabalho da Família (`/familias/:familyId`), atendendo integralmente às regras de consolidação patrimonial familiar (visão dos Patriarcas), patrimônio individual por membro, consolidação societária com valor de imóveis, motor tributário comparativo de imóveis (14 métricas) e quadro de totais por proprietário.

O desenvolvimento observa rigorosamente as premissas da metodologia **STE-DEV** (componentes estritamente modulares com menos de 100 linhas, separação de funções de domínio puras sem efeitos colaterais e tipagem estrita).

---

## 🏛️ 1. Arquitetura da Solução e Estrutura de Arquivos

Para garantir manutenibilidade e prevenir refatorações, a solução é desacoplada em:
1. **Domínio Matemático e Tributário Puro (`shared/domain/`):** Funções determinísticas puras e testáveis sem dependência de banco de dados ou React.
2. **Camada de Orquestração / Hook (`client/src/features/calculations/hooks/`):** Hook customizado que cruza dados de pessoas, imóveis, sociedades e ativos.
3. **Componentes Visuais Especializados (`client/src/features/calculations/components/`):** Componentes pequenos (< 100 linhas cada) para cada seção da aba.
4. **Ponto de Entrada da Aba (`client/src/features/calculations/CalculationsTab.tsx`):** Orquestrador principal da aba acoplado ao `TabsContent`.

### Estrutura dos Arquivos a Criar:

```text
c:/apps/LWOS/
├── shared/
│   └── domain/
│       ├── property-tax-engine.ts           # Motor das 14 fórmulas fiscais e comparativos de imóveis
│       ├── family-wealth-calculator.ts      # Regras de agregação dos Patriarcas e por membro
│       └── __tests__/
│           ├── property-tax-engine.spec.ts  # Testes unitários com 100% de cobertura das fórmulas
│           └── family-wealth-calculator.spec.ts # Testes de rateio e filtros de patriarcas
├── client/
│   └── src/
│       └── features/
│           ├── calculations/
│           │   ├── CalculationsTab.tsx              # Componente container da aba (< 100 linhas)
│           │   ├── types.ts                         # Interfaces e tipos canônicos da aba
│           │   ├── hooks/
│           │   │   └── useCalculationsData.ts       # Hook de agregação e resolução de dependências
│           │   └── components/
│           │       ├── FamilyWealthOverviewCard.tsx # Patrimônio dos Patriarcas + Breakdown
│           │       ├── FamilyWealthPieChart.tsx     # Gráfico de pizza (Recharts / ChartContainer)
│           │       ├── MemberWealthTable.tsx        # Tabela de patrimônio individual por membro
│           │       ├── PropertyTaxComparisonTable.tsx # Tabela dos imóveis com as 14 métricas
│           │       ├── PropertyOwnerTotalsTable.tsx # Quadro "Totais por Proprietário"
│           │       └── PropertyTaxBadge.tsx         # Badge visual da recomendação "Melhor Vender"
│           └── families/
│               └── FamilyWorkspacePage.tsx          # Adição da aba "Cálculos" na barra de abas
```

---

## 📐 2. Detalhamento das Regras e Fórmulas

### 2.1. Patrimônio Total Familiar (Visão dos Patriarcas)
- **Definição de Patriarcas:** Membros cujo vínculo familiar em `people` seja `vinculo === "TITULAR" || vinculo === "CONJUGE"` (ou `isPrimaryContact === true`).
- **Exclusão:** Bens de filhos, netos, bisnetos e terceiros são **excluídos** deste cálculo.
- **Proporcionalidade:** Para cada ativo em que um dos patriarcas figure como titular/sócio, soma-se estritamente sua cota-parte:
  $$\text{Imóveis Patriarcas} = \sum (\text{marketValue} \times \frac{\%_{\text{Patriarca}}}{100})$$
  $$\text{Sociedades Patriarcas} = \sum (\text{Valor Mercado Sociedade} \times \frac{\%_{\text{Patriarca}}}{100})$$
  $$\text{Demais Ativos Patriarcas} = \sum \text{declaredValue (se ownerPersonId for Patriarca)}$$
  $$\text{Patrimônio Total Familiar} = \text{Imóveis Patriarcas} + \text{Sociedades Patriarcas} + \text{Demais Ativos Patriarcas}$$
- **Gráfico de Pizza:** Exibe a proporção relativa (%) e valores nominais (R$) das 3 categorias (Imóveis, Sociedades e Demais Ativos).

### 2.2. Patrimônio Total por Membro da Família
- Lista todos os membros cadastrados na aba Família (`people`), na mesma ordem de exibição.
- Para cada membro $M$:
  $$\text{Total}(M) = \text{Imóveis}(M) + \text{Sociedades}(M) + \text{Demais Ativos}(M)$$

### 2.3. Sociedades — Integração do Valor dos Imóveis
- Para cada sociedade cadastrada:
  1. $\text{Valor dos Imóveis da PJ} = \sum (\text{marketValue do Imóvel} \times \frac{\%_{\text{Sociedade no Imóvel}}}{100})$
  2. $\text{Balanço Apurado} = \text{Caixa} + \text{Estoque} + \text{Créditos} + \text{Investimentos} + \text{Imobilizado} + \text{Lucros} - \text{Passivos Trabalhistas} - \text{Passivos Fiscais} - \text{Financiamentos}$
  3. $\text{Valor de Mercado da Sociedade} = \text{Balanço Apurado} + \text{Valor dos Imóveis da PJ}$
  4. Participação do membro = $\text{Valor de Mercado da Sociedade} \times \frac{\%_{\text{Sócio}}}{100}$

### 2.4. Motor de Cálculos de Imóveis (14 Métricas)

| # | Métrica | Expressão Matemática | Regra de Negócio / Casos de Borda |
|---|---|---|---|
| **1** | **ITBI** | $\text{marketValue} \times \frac{\text{itbiRate}}{100}$ | Alíquota cadastrada no imóvel (ex: 2%, 3%). Se vazia, assume 0. |
| **2** | **Laudêmio / Aforamento** | $\text{hasLaudemio} ? \text{marketValue} \times \frac{\text{laudemioRate}}{100} : 0$ | Se `hasLaudemio` for falso ou alíquota nula, valor é 0. |
| **3** | **Custo Integralização** | $\text{ITBI} + \text{emolumentsValue} + \text{Laudêmio}$ | Soma direta dos 3 desembolsos de transferência. |
| **4** | **IRPJ/CSLL Venda** | $0,0673 \times \text{marketValue}$ | 6,73% sobre o valor de mercado (venda na PJ no Presumido). |
| **5** | **Dif. IR Venda PJxPF** | $\text{IRPJ/CSLL Venda} - \text{irGcapValue}$ | Positivo: PJ paga mais. Negativo: PJ paga menos. |
| **6** | **Melhor Vender** | Se $\text{marketValue} == 0 \lor \text{irGcapValue} == 0 \lor \text{Dif} == 0 \implies \text{"PENDENTE"}$<br>Se $\text{Dif} > 0 \implies \text{"VENDER PF"}$<br>Se $\text{Dif} < 0 \implies \text{"VENDER PJ"}$ | Rótulo textual da recomendação tributária de desinvestimento. |
| **7** | **IRPF Locação (mês)** | Aplicável se `utility === 'LOCACAO_ARRENDAMENTO'`. Tabela Progressiva:<br>• $\le 2.428,80 \implies 0$<br>• $2.428,81 \text{ a } 2.826,65 \implies 7,5\% \times \text{rent} - 182,16$<br>• $2.826,66 \text{ a } 3.751,05 \implies 15,0\% \times \text{rent} - 394,16$<br>• $3.751,06 \text{ a } 4.664,68 \implies 22,5\% \times \text{rent} - 675,49$<br>• $> 4.664,68 \implies 27,5\% \times \text{rent} - 908,73$ | Se a utilidade não for Locação/Arrendamento, resultado é 0. |
| **8** | **IBS/CBS Locação PF (mês)** | Se disparar gatilho $\implies 0,084 \times \text{rentValue}$<br>Caso contrário $\implies 0$ | **Regra do Gatilho da Reforma:**<br>i) $> 3$ imóveis locados na PF e receita total $> R\$ 240.000/\text{ano}$; OU<br>ii) $1$ imóvel locado com receita $> R\$ 288.000/\text{ano}$. |
| **9** | **Total Locação PF (ano)** | $[(\text{IRPF Locação}) + (\text{IBS/CBS Locação PF})] \times 12$ | Custo fiscal anual do aluguel na Pessoa Física. |
| **10** | **IRPJ/CSLL Locação (ano)** | $(\text{rentValue} \times 0,1133) \times 12$ | Carga de 11,33% sobre o faturamento de aluguel na PJ. |
| **11** | **IBS/CBS Locação PJ (ano)** | $(\text{rentValue} \times 0,084) \times 12$ | 8,4% sobre a receita de locação na PJ. |
| **12** | **Total Locação PJ (ano)** | $\text{IRPJ/CSLL Locação} + \text{IBS/CBS Locação PJ}$ | Equivale a $(\text{rentValue} \times 0,1973) \times 12$. |
| **13** | **Economia Locação PJ (ano)** | $\text{Total Locação PF} - \text{Total Locação PJ}$ | Economia fiscal líquida anual obtida pela PJ. |
| **14** | **Payback (Ano)** | Se $\text{Economia} \le 0 \implies 0$<br>Se $\text{Economia} > 0 \implies \frac{\text{Custo Integralização}}{\text{Economia Locação PJ (ano)}}$ | Anos necessários para recuperar o custo de integralização. |

### 2.5. Quadro "Totais por Proprietário"
Tabela dinâmica onde cada linha representa um membro cadastrado da família (`people`), com 4 colunas somadas considerando todos os imóveis em que a pessoa consta como titular:
1. **Valor IRPF:** $\sum (\text{irpfBalanceValue} \times \frac{\%}{100})$
2. **Valor de Mercado:** $\sum (\text{marketValue} \times \frac{\%}{100})$
3. **Valor Locação (mensal):** $\sum (\text{rentValue} \times \frac{\%}{100})$
4. **Custo Integralização:** $\sum (\text{Custo Integralização do Imóvel} \times \frac{\%}{100})$

---

## 🛠️ 3. Fases de Execução Passo a Passo

### Fase 1: Camada de Domínio Puro e Testes Automatizados (TDD)
- **Arquivos:**
  - `shared/domain/property-tax-engine.ts`
  - `shared/domain/family-wealth-calculator.ts`
  - `shared/domain/__tests__/property-tax-engine.spec.ts`
  - `shared/domain/__tests__/family-wealth-calculator.spec.ts`
- **Atividades:**
  1. Implementar todas as 14 funções matemáticas no motor tributário puro.
  2. Implementar função de verificação do gatilho do IBS/CBS PF baseada no portfólio de imóveis da família.
  3. Implementar agregador do patrimônio dos Patriarcas (com filtro estrito de vínculos) e por membro.
  4. Criar suite de testes unitários com Vitest validando:
     - Todas as 5 faixas da tabela progressiva do IRPF mensal.
     - Condições do gatilho do IBS/CBS PF (> 3 imóveis e > 240k, 1 imóvel > 288k, casos isentos).
     - Diferença de IR e recomendações (`PENDENTE`, `VENDER PF`, `VENDER PJ`).
     - Payback com economia positiva, zerada e negativa.
     - Ponderação de titulares em cotas parciais (ex: 50% titular, 50% cônjuge).

### Fase 2: Hook de Agregação e Tipagem
- **Arquivos:**
  - `client/src/features/calculations/types.ts`
  - `client/src/features/calculations/hooks/useCalculationsData.ts`
- **Atividades:**
  1. Definir tipos canônicos para os resultados consolidados, linhas de imóveis e totais por proprietário.
  2. Criar hook que consome as queries existentes (`properties.list`, `companies.list`, `people.list`, `assets.list`) e alimenta as funções de cálculo puras.

### Fase 3: Componentes Modulares de Interface (< 100 linhas cada)
- **Arquivos:**
  - `client/src/features/calculations/components/FamilyWealthOverviewCard.tsx`: Card principal destacando o total familiar dos Patriarcas e métricas resumidas por categoria.
  - `client/src/features/calculations/components/FamilyWealthPieChart.tsx`: Gráfico de pizza utilizando Recharts / Shadcn `ChartContainer` com tooltip formatado em R$ e legendas com cores institucionais do Lucathi.
  - `client/src/features/calculations/components/MemberWealthTable.tsx`: Tabela com o patrimônio consolidado de cada membro da família.
  - `client/src/features/calculations/components/PropertyTaxComparisonTable.tsx`: Tabela com scroll horizontal contendo os 14 indicadores tributários por imóvel.
  - `client/src/features/calculations/components/PropertyOwnerTotalsTable.tsx`: Tabela do quadro "Totais por Proprietário" com as 4 colunas somadas.
  - `client/src/features/calculations/components/PropertyTaxBadge.tsx`: Badge visual com cores semânticas para a recomendação "Melhor Vender" (verde, azul, cinza).
  - `client/src/features/calculations/CalculationsTab.tsx`: Componente integrador da aba com layout limpo em seções bem delimitadas.

### Fase 4: Integração na Navegação de Abas
- **Arquivo:** [`client/src/features/families/FamilyWorkspacePage.tsx`](file:///c:/apps/LWOS/client/src/features/families/FamilyWorkspacePage.tsx)
- **Atividades:**
  1. Adicionar o `TabsTrigger` para o valor `calculos` com o rótulo **"Cálculos"** e ícone representativo (`Calculator` ou `CircleDollarSign` do `lucide-react`).
  2. Posicionar o gatilho estrategicamente logo após a aba `"patrimonio"`.
  3. Adicionar o respectivo `TabsContent value="calculos"` renderizando `<CalculationsTab familyId={familyId} />`.

### Fase 5: Exposição do "Valor Imóveis" nos Cards de Sociedades
- **Arquivo:** [`client/src/features/companies/CompanyPanel.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyPanel.tsx)
- **Atividades:**
  1. Incluir no card da sociedade na listagem a linha visual:
     `Valor Imóveis: R$ xxx (x imóveis)` aproveitando os dados que o endpoint `companies.list` já retorna via `propertyValue` e `propertyCount`.
  2. Exibir o `Valor de Mercado da Sociedade` consolidado no card.

---

## 🛡️ 4. Matriz de Verificação e Gates de Qualidade

Antes da conclusão da implementação, o projeto passará pelos seguintes comandos de auditoria e regressão:

1. **Testes Unitários:**
   ```powershell
   pnpm test
   ```
   Validação dos testes unitários de todas as novas fórmulas e da suite de testes existente.
2. **Cobertura de Código:**
   ```powershell
   pnpm test:coverage
   ```
   Garantir atendimento aos gates de qualidade do projeto (linhas $\ge 81\%$, branches $\ge 92\%$, funções $\ge 80\%$).
3. **Checagem de Tipagem TypeScript:**
   ```powershell
   pnpm check
   ```
   Zero erros em `tsc --noEmit`.
4. **Build de Produção:**
   ```powershell
   pnpm build
   ```
   Verificação de empacotamento completo do cliente Vite e do servidor Express/esbuild.

---

## 📌 5. Conclusão

O plano cobre integralmente a demanda especificada sem gaps conceituais, respeita o schema de dados existente no banco de dados do LWOS e estabelece uma arquitetura limpa, escalável e de fácil manutenção.

