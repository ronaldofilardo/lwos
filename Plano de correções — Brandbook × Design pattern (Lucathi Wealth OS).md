# Plano de correções — Brandbook × Design pattern (Lucathi Wealth OS)

Nov 7, 2026 · @Ron Filla

## Objetivo e escopo

Este plano alinha o código do Lucathi Wealth OS (projeto bkpLWOS) ao brandbook em seis etapas, da Fase 0 à Fase 5. Começa pelo logo, que hoje fica quase invisível em fundo claro, e pelos tokens de cor, que fazem os botões saírem em azul genérico.

- Só muda a camada visual: tokens, assets, classes e tipografia. Nenhuma regra de negócio, rota ou API.
- Cada fase vira um PR separado e pode ser revertida sozinha.
- As Fases 1 e 2 são independentes e podem andar em paralelo. A Fase 3 vem depois da 2. A Fase 4 depende das decisões da Fase 0.
- Esforço estimado: Fase 1 pequeno (depende dos arquivos do logo), Fase 2 pequeno, Fase 3 médio, Fase 4 grande (cerca de 270 ocorrências de cor), Fase 5 pequeno.

## Fase 0: decisões antes de executar

Seis pontos dependem de você ou do designer; a Fase 4 e parte da Fase 1 não começam sem eles.

| Decisão | Recomendação | Por quê |
| --- | --- | --- |
| Arquivos do logo | Pedir ao designer SVG (ou PNG com 750 px ou mais de largura): principal azul, escudo azul isolado e negativa branca | O PNG atual tem 249×91 px e só existe na versão clara |
| Layout do logo | Aprovar o lockup horizontal (escudo à esquerda) para sidebar e cabeçalho, ou usar o vertical do brandbook | O brandbook só mostra lockups verticais |
| Cor do escudo | Confirmar `#00243E` no contorno e na tagline | O brandbook lista `#2A3036` (grafite) nesses pontos, mas o desenho é azul-marinho |
| Cores de estado | Manter vermelho, âmbar e verde só para erro, alerta e sucesso, em tons dessaturados, e registrar a exceção | O brandbook não define cores de estado |
| Raios e sombras | Manter os cantos arredondados e documentar a escala | A geometria angular do brandbook é de marca, não de interface |
| Tema escuro | Manter desligado e remover o bloco `.dark` | O brandbook não prevê tema escuro |

## Fase 1: logo e favicon

Objetivo: o logo azul legível em todo fundo claro e a versão negativa só sobre `lucathi-deep`, sem filtro CSS.

1. Substituir em `client/public/`: `lucathi-logo.png` pela versão principal azul, `lucathi-logo-mark.png` pelo escudo azul (favicon) e adicionar `lucathi-logo-white.png` (negativa) e um `apple-touch-icon` de 180 px.
2. Apagar `assets/logo_light_horz.png`, que é cópia idêntica do logo claro atual.
3. Reescrever `components/lucathi/BrandMark.tsx`: trocar a prop `inverse` (filtro `brightness(0) invert(1)`) por `variant: "primary" | "negative"`, cada uma com seu arquivo.
4. Usar `variant="negative"` nos fundos escuros e trocar o `<img>` solto de `AuthGate.tsx` (tela de carregamento, linha \~98) pelo `BrandMark`.
5. Fixar o tamanho mínimo (hoje `h-7` e `h-9`) e reservar a área de proteção do brandbook, igual à altura da letra "L", como padding no componente.

Aceite: o texto "LUCATHI CONSULT" legível na sidebar, no login, em `/interesse`, no portal do cliente e no loading; nenhum `filter` aplicado ao logo.

## Fase 2: tokens base e cor primária

Objetivo: os componentes shadcn passam a usar a paleta da marca, e o `body` deixa de ser sobrescrito. Tudo em `client/src/index.css`.

1. Deixar uma única regra de `body` (canvas `#FBFBF8` e texto `#2A3036`). Hoje a segunda regra (`var(--background)`) vence a primeira no CSS compilado.
2. Mapear os tokens do shadcn para a marca:

| Token | Valor atual | Novo valor |
| --- | --- | --- |
| `--primary`, `--sidebar-primary` | `blue-700` / `blue-600` | `#003663` (navy) |
| `--ring`, `--sidebar-ring` | azul `oklch(0.623 0.214 259)` | navy ou `#5b7f9b` com transparência |
| `--background` | branco puro | `#FBFBF8` |
| `--foreground` | marrom quente (hue 65) | `#2A3036` |
| `--border`, `--input` | cinza com matiz roxo | `#E4E6E4` (`lucathi-line`) |
| `--muted`, `--secondary`, `--accent` | cinza neutro | `#F2F5F5` (`lucathi-mist`) |
| `--muted-foreground` | cinza com matiz roxo | `#60666B` |
| `--chart-1` a `--chart-5` | `blue-300` a `blue-800` | escala da marca (ver Fase 4) |

3. Padronizar o botão primário: o `<Button>` padrão em navy, com hover em `lucathi-deep` (`#00243E`). Trocar os botões feitos à mão com `bg-lucathi-deep` (login e `/interesse`) por `<Button>`.
4. Corrigir `hover:bg-lucathi-dark` (token inexistente) em `features/documents/DocumentPanel.tsx:535`, usando `<Button>` padrão.
5. Mover `@import "tw-animate-css"` para o topo do arquivo, junto do `@import "tailwindcss"`.
6. Remover o bloco `.dark` e o modo `switchable` do `ThemeContext`, se a decisão da Fase 0 for essa.

Aceite: `body` com fundo `rgb(251,251,248)`; `<Button>` padrão com `rgb(0,54,99)`; anel de foco dos inputs em tom da marca.

## Fase 3: tipografia

Objetivo: títulos em Cormorant Garamond Semibold/Bold, subtítulos em Montserrat Medium/Semibold e corpo em Inter Regular/Medium.

1. Títulos: os 47 usos de `font-display` herdam o peso 400, que não está carregado (só 500, 600 e 700), então saem em Medium. Definir uma regra única `font-display { font-weight: 600 }` em `@layer components`, em vez de editar 47 arquivos, e usar `font-bold` só em heróis.
2. Subtítulos: criar `--font-subtitle: "Montserrat"` no `@theme` e aplicá-la aos 72 rótulos `uppercase tracking-*` (hoje em Inter) e aos cabeçalhos de seção. A fonte já é carregada no `index.html`, mas tem 0 usos.
3. Corpo: manter Inter e revisar o `font-bold` em texto corrido, trocando por `font-medium` ou `font-semibold`.
4. Remover do link do Google Fonts os pesos que sobrarem sem uso (por exemplo Inter 700, se nada o usar).
5. Caixa alta: manter sentence case na interface, como decidido na Fase 0. A caixa alta dos títulos do brandbook fica para material de marketing.

Aceite: `h1` e `h2` renderizados em Cormorant 600; rótulos em Montserrat; revisão visual de quebras de linha, porque o Cormorant 600 ocupa mais largura.

## Fase 4: cores semânticas, hex soltos e gráficos

Objetivo: nenhuma cor de paleta Tailwind direto nos componentes. Tudo passa por tokens, e fora do azul e do cinza só os estados (erro, alerta, sucesso).

1. Criar tokens de estado no `@theme` (`--color-status-success`, `-warning`, `-danger`, `-info`, `-neutral`, cada um com fundo, texto e borda), com os valores definidos na Fase 0.
2. Migrar para eles, nesta ordem: `StatusBadge.tsx` (fonte única dos estados), `PropertyTaxBadge.tsx`, `PropertyTaxComparisonTable.tsx`, `PropertyRow.tsx`, e depois o restante dos 76 `red`, 76 `amber` e 66 `emerald`.
3. Trocar as cores sem papel de estado:

| Cor atual | Ocorrências | Substituto |
| --- | --- | --- |
| `purple` (Dispensado, Não possui) | 24 | cinza da marca: `bg-lucathi-mist`, `text-lucathi-gray`, borda `lucathi-line` |
| `sky`, `indigo`, `blue-*` | 22 | azul da marca: `lucathi-navy` e `#5b7f9b`, fundo `lucathi-mist` |
| `slate`, `gray` | 13 | `lucathi-gray`, `lucathi-line`, `lucathi-mist` |

4. Ícones: cinza ou azul por padrão. Cor de estado só em `TriangleAlert`, `AlertCircle`, `CheckCircle` e equivalentes, sempre junto de texto, nunca como única pista.
5. Gráficos: definir `--chart-1` a `--chart-5` como escala azul e cinza (`#00243E`, `#003663`, `#5b7f9b`, `#b3c2cc`, `#60666B`) e fazer `FamilyWealthPieChart.tsx` e `FamilyWealthOverviewCard.tsx` lerem `var(--chart-n)` em vez de hex fixo.
6. Refazer `pages/NotFound.tsx` com canvas e tokens `lucathi-*`, sem gradiente `slate`, sem `shadow-lg` e sem blur.

Aceite: `grep` por `(bg|text|border|ring)-(red|amber|emerald|purple|sky|indigo|slate|gray|blue)-` fora de `components/ui` e dos tokens retorna zero; nenhum hex fora do `index.css`.

## Fase 5: ajustes menores e prevenção

- Raios e sombras: documentar a escala (cards `rounded-2xl`, controles `rounded-lg`, heróis 28 px) e baixar o `shadow-xl` do login para `shadow-sm`.
- Geometria da marca: usar, de forma discreta, linhas finas azuis e faixas diagonais em heróis e telas de acesso, como o losango já presente no loading. A montanha continua só no logo.
- Documentar o padrão em `docs/design-system-lwos.md` (tokens, tipografia, uso do logo, estados) e criar `.agent-os/standards/design.md`, que o `CLAUDE.md` já referencia e não veio no zip.
- Prevenir regressão: um script de CI que falha se encontrar paleta Tailwind de cor ou hex fora do `index.css`.
- Pedir ao designer que corrija o brandbook: a cor do escudo e da tagline (`#2A3036` ou `#00243E`) e a fonte do corpo (o PDF usa Montserrat, o texto diz Inter).

## Verificação, aceite e riscos

Cada fase só fecha com testes passando e comparação visual antes e depois.

| Verificação | Como |
| --- | --- |
| Testes | `pnpm test` (vitest) e `AppShell.test.ts` verdes em cada PR |
| Telas | Screenshots antes e depois: login, `/interesse`, home, família, documentos, cálculos, portal do cliente e 404 |
| Cores | `grep` do critério da Fase 4 e checagem dos valores computados da Fase 2 |
| Contraste | Conferir AA para `#60666B` sobre `#FBFBF8` e para cada par de cores de estado |
| Logo | Conferir em fundo claro e em `lucathi-deep`, em tela larga e no celular |

| Risco | Mitigação |
| --- | --- |
| Logo novo com outra proporção quebra sidebar e cabeçalho | Fixar altura no `BrandMark` e testar nos 5 pontos de uso |
| Mudar `--primary` altera Badge, Switch, Checkbox e foco em todo o app | Fase 2 isolada em um PR, com screenshots das telas principais |
| Estados mais sóbrios ficam difíceis de distinguir | Manter ícone e texto junto da cor e validar contraste |
| Cormorant 600 alarga os títulos e quebra linhas | Revisão visual das telas com títulos longos (nome da família) |
