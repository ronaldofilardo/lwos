# 📋 Plano de Execução — Demandas Lucathi Wealth OS

Este documento formaliza o plano de execução para as demandas de refinamento de interface, reorganização de rotas e correção de comportamentos nas telas **Home (Visão Geral)**, **Sociedades** e **Área de Trabalho do Projeto**.

---

## 🧭 Fase 1: Menu Lateral & Tela Home (Visão Geral / Dashboard)

### 1.1. Menu Lateral (`navigation.ts` e `AppShell.tsx`)
* **Arquivo:** [`client/src/components/lucathi/navigation.ts`](file:///c:/apps/LWOS/client/src/components/lucathi/navigation.ts)
* **Ações:**
  1. Alterar o primeiro item da navegação:
     * Renomear de `"Visão geral"` para `"Home"`.
     * Substituir o ícone `LayoutDashboard` pelo ícone `Home` (do `lucide-react`).
     * Garantir a 1ª posição da barra lateral esquerda.
  2. Remover o item `"Patrimônio"` (`/patrimonio`) do menu lateral global (sua apuração será transferida para o escopo interno do projeto).

### 1.2. Cartões de Métricas da Home (`Home.tsx` e Backend)
* **Arquivos:**
  * [`client/src/pages/Home.tsx`](file:///c:/apps/LWOS/client/src/pages/Home.tsx)
  * [`server/features/families/family-router.ts`](file:///c:/apps/LWOS/server/features/families/family-router.ts)
* **Ações:**
  1. No card de total de famílias, alterar o nome de `"Famílias"` para `"Projetos"` (mantendo o detalhe explicativo `"Projetos patrimoniais ativos"`).
  2. Substituir os cards `"Documentos"` e `"Validações"` por um único card: **"Patrimônio sob Gestão"**.
  3. Implementar query tRPC somando o valor de mercado de todos os projetos ativos:
     $$\text{Patrimônio sob Gestão} = \sum (\text{Imóveis (valor mercado)} + \text{Sociedades (valor mercado)} + \text{Demais Ativos (valor declarado)})$$
  4. Excluir integralmente o bloco visual **"Próximo passo"** (card inferior com `"Crie uma família para iniciar o fluxo..."`).

### 1.3. Integração do Dashboard na Home
* **Arquivos:**
  * [`client/src/pages/Dashboard.tsx`](file:///c:/apps/LWOS/client/src/pages/Dashboard.tsx)
  * [`client/src/pages/Home.tsx`](file:///c:/apps/LWOS/client/src/pages/Home.tsx)
* **Ações:**
  1. Trazer a listagem de famílias/projetos do `TeamDashboard` para a tela Home no lugar do antigo bloco "Próximo passo".
  2. Excluir integralmente o bloco **"Armazenamento Local"** (`StorageList`) e qualquer modal de armazenamento local/legal da visão trazida para a Home.
  3. Excluir os cards redundantes de métricas avulsas (`"Famílias"`, `"Pessoas"`, `"Documentos"` e `"Armazenamento"`), mantendo a tela Home limpa e focada: Banner executivo + Métrica de Patrimônio sob Gestão + Tabela de Projetos com acesso rápido.

---

## 🏢 Fase 2: Módulo de Sociedades & Holdings

### 2.1. Correção do Administrador Terceiro (Bug identificado)
* **Arquivo:** [`client/src/features/companies/CompanyAdministratorSelect.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyAdministratorSelect.tsx)
* **Diagnóstico da Causa Raiz:** O select deduz o modo ativo através de `isThirdParty = !personIdValue && Boolean(thirdPartyNameValue)`. Ao selecionar "Terceiro", se o campo `thirdPartyNameValue` estiver vazio, o componente reseta o valor para `""` no re-render, impedindo que o usuário digite o nome do terceiro.
* **Ações:**
  1. Gerenciar o estado da opção selecionada para manter o campo de input aberto quando "Terceiro" for selecionado.
  2. Renomear o rótulo da opção de `"Terceiro (não-membro)"` para apenas `"Terceiro"`.

### 2.2. Destaques e Exibições no Card da Sociedade
* **Arquivo:** [`client/src/features/companies/CompanyPanel.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyPanel.tsx)
* **Ações:**
  1. **Simples Nacional:** Adicionar destaque visual em **vermelho** nítido (borda/badge) quando a empresa estiver enquadrada no Simples Nacional.
  2. **Excluir rótulo "Nacional":** Ocultar a exibição da tag `"Nacional"`, exibindo distinção textual apenas para holdings `"Offshore"`.
  3. **Capital Social e PL abaixo do CNPJ:**
     * Exibir abaixo do CNPJ: **Capital Social Total** da sociedade (conforme cadastrado na ficha de detalhes).
     * Exibir abaixo do Capital Social: **PL (Patrimônio Líquido)** com o identificador textual **PL**.
  4. **Subtítulo:** Remover o subtítulo `Nacionais e offshore, com quadro societário somando 100%.`.

### 2.3. Quadro Societário: Valores Abreviados com Tooltip
* **Arquivos:**
  * [`client/src/features/companies/StakeholderValues.tsx`](file:///c:/apps/LWOS/client/src/features/companies/StakeholderValues.tsx)
  * [`client/src/features/companies/CompanyPanel.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyPanel.tsx)
* **Ações:**
  1. Substituir a formatação por extenso pelo padrão:
     `V.C. R$xxx – V.P. R$xxx – V.M. R$xxx`
  2. Adicionar tooltip informativo ao passar o cursor sobre as siglas:
     * `V.C.` $\rightarrow$ **"Valor Contábil"**
     * `V.P.` $\rightarrow$ **"Valor Patrimonial"**
     * `V.M.` $\rightarrow$ **"Valor de Mercado"**

### 2.4. Diagnóstico e Correção da Exclusão de Empresas (Bug identificado)
* **Arquivos:**
  * [`server/features/companies/company-repository.ts`](file:///c:/apps/LWOS/server/features/companies/company-repository.ts)
  * [`client/src/features/companies/CompanyPanel.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyPanel.tsx)
* **Ações:**
  1. Revisar o fluxo em `removeCompanyRecord` para garantir que exclusões não falhem por chaves estrangeiras (`companyDetails`, `companyStakeholders`, `certidoes`).
  2. Tratar a verificação de sociedade vinculada como titular de imóvel em `propertyOwners`, exibindo aviso explicativo na interface caso o usuário tente remover uma empresa que possui imóveis em seu nome.
  3. Assegurar persistência correta e invalidação de cache após preenchimento dos detalhes da sociedade.

### 2.5. Balanço & Valor dos Imóveis na Sociedade
* **Arquivos:**
  * [`client/src/features/companies/CompanyBalanceSection.tsx`](file:///c:/apps/LWOS/client/src/features/companies/CompanyBalanceSection.tsx)
  * [`client/src/features/companies/holdingDetails.ts`](file:///c:/apps/LWOS/client/src/features/companies/holdingDetails.ts)
  * [`server/features/companies/company-details-repository.ts`](file:///c:/apps/LWOS/server/features/companies/company-details-repository.ts)
* **Ações:**
  1. Renomear o campo `"Valor estimado da empresa"` para `"Valor mercado"`.
  2. No campo **Ativos Imobilizados**, adicionar asterisco: `Ativos Imobilizados *` e incluir o texto explicativo logo abaixo: `"não lançar o valor dos imóveis"`.
  3. Adicionar campo não editável: **"Valor dos imóveis"**:
     * Consulta automática da soma de `marketValue` dos imóveis vinculados à sociedade como titular.
     * Incorporação desse valor na apuração do valor total de mercado da sociedade:
       $$\text{Valor mercado} = \text{Balanço apurado} + \text{Valor dos imóveis}$$

---

## 📐 Fase 3: Área de Trabalho do Projeto (Reorganização de Abas & Visão Unificada)

### 3.1. Reordenação das Abas do Projeto
* **Arquivo:** [`client/src/features/families/FamilyWorkspacePage.tsx`](file:///c:/apps/LWOS/client/src/features/families/FamilyWorkspacePage.tsx)
* **Nova sequência de abas:**
  1. **Due Diligence** (renomeado: remover o sufixo `(4 Pilares)`).
  2. **Documentos e Certidões** (incluir botão `"Resumo"` no cabeçalho interno da aba, abrindo a visão de resumo e status).
  3. **Patrimônio** (trazido para dentro do projeto, agregando a visão consolidada de Imóveis, Sociedades, Outros Ativos e totalização patrimonial).
  4. **LWR & Proposta Financeira**.
  5. **Portal & Governança**.

### 3.2. Limpeza da Visão Unificada Completa
* **Arquivos:**
  * [`client/src/features/families/common/UnifiedRequirementsMap.tsx`](file:///c:/apps/LWOS/client/src/features/families/common/UnifiedRequirementsMap.tsx)
  * [`client/src/features/families/common/ProcessTimeline.tsx`](file:///c:/apps/LWOS/client/src/features/families/common/ProcessTimeline.tsx)
* **Ações:**
  1. Em `UnifiedRequirementsMap.tsx`:
     * Excluir o título `"O que já existe e o que ainda falta"`.
     * Excluir a frase `"Itens concluídos aparecem de forma opaca; pendentes e rejeitados destacados para orientar o trabalho do Sócio."`.
  2. Em `ProcessTimeline.tsx`:
     * Excluir o título `"Linha do tempo do processo"`.
     * Excluir a frase `"Da origem do interesse até o momento atual da família — resumo das etapas, sem repetir a matriz documental."`.

---

## 📋 Critérios de Validação & Entrega
1. **Padrão STE-DEV:** Blocos estritamente modulares e tipados.
2. **Typecheck & Build:** Validação completa com `pnpm build` ou `tsc --noEmit`.
3. **Testes Unitários:** Execução de suítes de testes relacionadas às empresas e valuations (`vitest run`).

