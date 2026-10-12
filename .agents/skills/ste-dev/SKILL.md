---
name: ste-dev
description: >-
  Metodologia Preventiva (STE-DEV) baseada em ASD-STE100 para desenvolvimento, geração e revisão/auditoria de código por agentes de IA.
  Use sempre que for gerar novos módulos, escrever componentes, criar hooks, implementar APIs ou auditar/revisar código existente,
  garantindo código inequívoco, estritamente modular (< 100 linhas), determinístico, sem termos vagos e livre de refatorações posteriores.
---

# PREMISSAS DE PROGRAMAÇÃO — Metodologia Preventiva (STE-DEV)

**Objetivo:** Impedir que o agente codificador gere código que exija refatoração posterior.  
**Regra Fundamental:** Se o arquivo exigir refatoração, ele não deve ser gerado dessa forma. O código deve ser inequívoco, estritamente modular, determinístico e livre de termos ambíguos.

---

## 1. Filosofia ASD-STE100 Aplicada ao Código

O agente codificador **DEVE** operar sob as quatro leis do Inglês Técnico Simplificado:

1. **Unicidade Semântica (One Word, One Meaning):** Um conceito do domínio possui apenas um único nome em todo o projeto. Se a entidade chama-se `Usuario`, é proibido alternar para `Cliente`, `Conta` ou `Profile`. Se a leitura chama-se `buscar`, é proibido usar `obter`, `carregar` ou `ler`.
2. **Proibição de Termos Vagos (Approved Vocabulary Only):** É proibido nomear arquivos, tipos ou funções com termos genéricos (`handle`, `process`, `manage`, `helper`, `data`, `info`, `doAction`, `temp`). O nome **DEVE** declarar a ação exata e o alvo exato.
3. **Separação Procedimental vs. Descritiva:** Código procedimental (orquestração, efeitos, hooks) não calcula regras de negócio. Código descritivo (regras puras, utilitários, types) não executa procedimentos nem orquestra chamadas externas.
4. **Sem Efeitos Ocultos (Direct & Explicit):** O código deve ser imperativo e transparente. Nenhuma função deve alterar estado global, aceitar parâmetros implícitos ou esconder dependências.

---

## 2. Proibições Absolutas (O Agente NÃO DEVE Gerar)

- [ ] **NENHUM componente com > 100 linhas.**
- [ ] **NENHUMA lógica de API ou estado complexo dentro de componente de renderização.**
- [ ] **NENHUM arquivo de aprovação manual** (`BUILD_APPROVAL_*.md`, `TEST_APPROVAL_*.md`, `ALL_TESTS_APPROVED_*.md`) — aprovação vive no PR + CI.
- [ ] **NENHUMA duplicação de factory/config.**
- [ ] **NENHUM componente que misture formulário, histórico, preview e estado no mesmo arquivo.**
- [ ] **NENHUM `console.log` sem contexto estruturado** (usar logger com prefixos padronizados).
- [ ] **NENHUM tipo `any`** como solução padrão em mocks, parâmetros ou interfaces.
- [ ] **NENHUM arquivo de migração** `sync_*`, `fix-*`, `apply_*` ou com prefixo não-numérico padrão na raiz de migrations. Nenhuma migration $> 20\text{ KB}$ (particionar se atingir).
- [ ] **NENHUMA função sem `try/catch`** quando for assíncrona e tocar API/banco/arquivo.
- [ ] **NENHUM arquivo com complexidade ciclomática > 10** (limite máximo tolerado: 15). Se passar de 10, dividir antes da entrega; se atingir 15, refatorar imediatamente antes de entregar.
- [ ] **NENHUM nome com verbos ambíguos proibidos pelo STE:** `handleData`, `processFile`, `manageState`, `doAction`, `utils/helpers.ts`. O nome deve ser específico: `validarTamanhoArquivo`, `salvarRegistroUsuario`.
- [ ] **NENHUMA duplicidade de sinônimos no mesmo domínio:** Proibido misturar `getUser` em um arquivo e `fetchUser` ou `loadUser` em outro para a mesma operação.

---

## 3. Estrutura Obrigatória de Módulos

O agente **DEVE** estruturar o módulo antes de escrever a lógica:

```text
modulo/
├── index.ts                     # barrel (re-export público estrito / facade)
├── types.ts                     # interfaces / DB-row canônico + DTO
├── [modulo]-component.tsx       # componente principal (< 100 linhas)
├── hooks/
│   └── useModulo.ts             # estado + orquestração de API (testável isoladamente)
├── common/
│   ├── SubFormulario.tsx        # UI genérica desacoplada
│   └── SubHistorico.tsx         # UI genérica desacoplada
└── utils/
    └── formatModulo.ts          # funções puras descritivas (sem side effects)
```

Se o módulo envolve manipulação de arquivos (upload/download/delete/health):
```text
modulo/
└── _internals/
    ├── [modulo]-upload.ts
    ├── [modulo]-download.ts
    ├── [modulo]-delete.ts
    ├── [modulo]-health.ts
    ├── logger.ts
    └── errors.ts
```

---

## 4. Regras de Geração por Camada

### 4.1 Componente Principal (< 100 linhas)
O componente possui apenas papel descritivo de UI:
```tsx
// ✅ PERMITIDO: Explícito, direto, sem lógica acoplada
function MeuComponente() {
  const { estado, acao } = useModulo();
  return (
    <div>
      <SubFormulario />
      <SubHistorico />
    </div>
  );
}

// ❌ PROIBIDO: Ambiguidade de responsabilidade, mistura de camadas
function MeuComponente() {
  const [dados, setDados] = useState();
  const buscar = async () => { /* 50 linhas de fetch + parse */ };
  const validar = () => { /* 30 linhas */ };
  return (/* formulário + histórico + preview misturados */);
}
```

### 4.2 Hook (`useModulo`)
- Concentra a orquestração procedimental de estado e chamadas de API.
- Deve ser testável isoladamente sem renderização de DOM.
- **Proibido:** Importar componentes visuais de UI; consome apenas types e utils.

### 4.3 Componentes Comuns (`common/`)
- Devem ser componentes puros reutilizáveis por outros fluxos.
- **Proibido:** Referência direta ao módulo pai (sem `import { useModulo }` interno).

### 4.4 Utilitários (`utils/`)
- Funções puras descritivas (`formatCNPJ`, `extensaoFromMime`).
- **Proibido:** `useState`, `useEffect`, chamadas de API, dependências de framework ou acesso ao objeto global `window`.

### 4.5 Dicionário e Vocabulário Controlado STE (Nomenclatura Obrigatória)
O agente deve adotar exclusivamente verbos canônicos sem sinônimos:
- `buscar*` (ou `get*`): Leitura idempotente de dados existentes.
- `criar*` (ou `create*`): Instanciação ou persistência de novo registro.
- `atualizar*` (ou `update*`): Modificação de registro existente.
- `remover*` (ou `remove*`): Exclusão de registro.
- `validar*` (ou `validate*`): Retorno booleano ou lançamento de erro de validação pura.
- `formatar*` (ou `format*`): Transformação determinística de formato (string/data/moeda).
- **Termos terminantemente banidos:** `process`, `handle`, `manage`, `executeAction`, `data`, `temp`.

---

## 5. Separação DB-Row vs DTO

O agente **DEVE** criar dois conjuntos de tipos estritos, sem sobreposição de significado:

```typescript
// DB-row canônico: 1:1 com a tabela do banco (PostgreSQL)
import type { Entidade, Documento } from '@/lib/types';

// DTO de hook: modelo de visão agregado para renderização
import type { EntidadeDTO, DocumentoDTO } from '@/lib/hooks/useEntidades';
```
- Endpoint ou Repository que retorna registro puro $\rightarrow$ usar `Entidade` (DB-row).
- Hook que agrega regras calculadas para a tela $\rightarrow$ usar `EntidadeDTO`.

---

## 6. Aderência aos Princípios de Arquitetura

### 6.1 SOLID
- **S (Single Responsibility):** Cada arquivo possui apenas um propósito funcional declarado (`upload.ts` só envia; `logger.ts` só loga).
- **O (Open/Closed):** Extensibilidade por contratos (interfaces, barrels). Proibido alterar o miolo do arquivo para novos casos.
- **L (Liskov Substitution):** Subcomponentes substituíveis sem condicionais no pai (`if (tipo === 'A')`).
- **I (Interface Segregation):** Interfaces mínimas. Cada consumidor importa apenas propriedades necessárias.
- **D (Dependency Inversion):** Componentes dependem de abstrações (`useModulo`), nunca de clientes HTTP/DB diretos.

### 6.2 Clean Architecture
- **UI:** Apenas renderização declarativa. Sem `fetch`, sem lógica assíncrona, sem log manual.
- **Aplicação (Hooks):** Orquestra procedimentos e casos de uso.
- **Domínio (Utils / Internals):** Regras de negócio puras, sem frameworks externos.
- **Infraestrutura (Internals):** Clientes de banco/storage, logger, erros. Nunca importa UI.

### 6.3 Design Patterns Mandatórios
- **Factory Method:** Instanciação de clientes complexos (`storage-client-factory.ts`). Proibido `new Client` espalhado.
- **Repository:** Acesso e persistência isolados sob contrato estrito em `_internals/`.
- **Adapter:** Conversão pura DB-row $\rightarrow$ DTO em `utils/` (`converterParaDTO()`).
- **Strategy:** Algoritmos variantes em arquivos separados, sem cascatas condicionais.
- **Observer / Pub-Sub:** Callbacks tipados em `types.ts` (`onUploadComplete`).
- **Dependency Injection:** Via propriedades ou retorno de hooks.
- **Singleton (Restrito):** Configuração imutável provida por factory central.
- **Facade:** Barrel `index.ts` expondo unicamente a API pública ($\le 15$ linhas).

---

## 7. Qualidade, Testes, Storage e Erros

### Qualidade por Arquivo
- Máximo 100 linhas por componente.
- Imports absolutos `@/`.
- `try/catch` obrigatório em funções assíncronas de I/O.
- Zero `any` e zero `console.log` desestruturado.

### Testes Preventivos
- **Linha Base (Baseline):** Validar testes funcionais antes de propor alteração.
- **Proibição de Mocks Mascarados:** Mocks devem validar contratos de tipos reais.
- **Isolamento de Hooks:** Testar ciclo assíncrono sem renderizar DOM gráfico.
- `clearAllMocks` / `resetMocks` em cada ciclo.

### Storage e Arquivos
- Verbos atômicos: `upload.ts`, `download.ts`, `delete.ts`, `health.ts`.
- Ponto de entrada `storage-client.ts` como facade $\le 15$ linhas.

### Logs e Erros
- Prefixos rastreáveis e mensagens estruturadas em `logger.ts`.
- Wrappers tipados em `errors.ts`. Nunca expor stack traces ou dados sensíveis ao cliente.

---

## 8. Protocolo de Auditoria e Revisão de Código

Quando o usuário solicitar **revisão, auditoria ou análise de código existente**, atuar como Engenheiro Sênior especialista em ASD-STE100 / STE-DEV seguindo estas diretrizes:

1. **Linguagem Direta:** Declarar violações objetivamente como `[CONFORME]`, `[VIOLAÇÃO]` ou `[NÃO APLICÁVEL]`. Sem elogios ou sugestões vagas.
2. **Evidência Obrigatória:** Indicar arquivo, linha aproximada, trecho problemático e impacto na manutenção.
3. **Plano de Remediação Atômico:** Descrever a correção exata sem retrabalho futuro.

### Formato Obrigatório de Saída da Auditoria:

#### 1. Resumo Executivo de Conformidade
| Métrica | Situação Atual | Meta STE-DEV | Status |
| :--- | :--- | :--- | :--- |
| Componentes > 100 linhas | [Qtd] | 0 | [CONFORME / VIOLAÇÃO] |
| Funções com Verbos Vagos (`handle`, etc.) | [Qtd] | 0 | [CONFORME / VIOLAÇÃO] |
| Uso de `any` explícito | [Qtd] | 0 | [CONFORME / VIOLAÇÃO] |
| Chamadas async sem `try/catch` | [Qtd] | 0 | [CONFORME / VIOLAÇÃO] |
| Complexidade Ciclomática > 10 | [Arquivos] | 0 | [CONFORME / VIOLAÇÃO] |

#### 2. Inventário Detalhado de Violações
Para cada infração:
- **[ID-VIOLAÇÃO] [Critério Violado]**
  - **Arquivo / Linha:** `caminho/do/arquivo.ts:linha`
  - **Causa Raiz:** Explicação direta do problema.
  - **Trecho Atual:** Código offending.
  - **Ação Corretiva Exata:** Como dividir, renomear ou modularizar (com código ou estrutura).

#### 3. Matriz de Refatoração e Sequência de Execução
Ordem estrita:
1. Linha Base de Testes
2. Tipos e DTOs
3. Extração de Hooks / Internals
4. Componentes de UI
5. Limpeza Semântica STE

---

## 9. Regra de Ouro Final

> **Se a instrução recebida ou a linha de raciocínio atual for produzir um arquivo que precise ser refatorado depois: pare a execução imediatamente e divida o componente antes de escrever a lógica.**  
> A refatoração no destino é a prova cabal de uma falha de geração na origem. Codifique de forma atômica, modular e inequívoca desde a primeira linha.
