# Lucathi Wealth OS — Design Standards

Este arquivo é referenciado pelo `CLAUDE.md` e define os padrões obrigatórios para agentes de IA trabalhando no código visual do Lucathi Wealth OS.

---

## Regras Obrigatórias

### 1. Cores
- **NUNCA** usar paleta Tailwind direta em componentes: `bg-blue-600`, `text-red-500`, `border-gray-300`, etc.
- **SEMPRE** usar tokens CSS definidos em `client/src/index.css`:
  - Cores da marca: `lucathi-canvas`, `lucathi-deep`, `lucathi-navy`, `lucathi-ink`, `lucathi-gray`, `lucathi-line`, `lucathi-mist`
  - Cores de estado: `status-success-*`, `status-warning-*`, `status-danger-*`, `status-info-*`, `status-neutral-*`
  - Gráficos: `var(--chart-1)` a `var(--chart-5)`
- **NUNCA** hardcoded hex values fora do `index.css`

### 2. Tipografia
- Títulos (`h1`, `h2`, `.font-display`) → **Cormorant Garamond 600**
- Rótulos, labels, `uppercase tracking-*` → **Montserrat 500** (`.font-subtitle`)
- Corpo → **Inter** (padrão)
- **Não usar** `font-bold` em texto corrido → usar `font-medium` ou `font-semibold`
- **Sentence case** na interface

### 3. Logo
- Usar componente `BrandMark` com `variant: "primary" | "negative"`
- **Nunca** usar `filter: brightness(0) invert(1)`
- `variant="negative"` **apenas** sobre fundo `lucathi-deep`
- Tamanhos: `compact` (h-7) ou padrão (h-9)

### 4. Botões
- Botão primário → `<Button>` (variante `default`)
- Hover → `lucathi-deep` (`#00243E`)
- **Não criar** botões manuais com `bg-lucathi-deep` ou `bg-lucathi-navy`

### 5. Raios
- Cards → `rounded-2xl` (16px)
- Controles → `rounded-lg` / `rounded-md`
- Heróis/Login → `rounded-[28px]` (28px)
- **Não usar** `rounded-xl` ou `rounded-full` exceto em badges/pills

### 6. Sombras
- Cards padrão → `shadow-sm`
- Login/Destaque → `shadow-sm` (era `shadow-xl`, reduzido)
- Modais → `shadow-2xl`

### 7. Tema Escuro
- **Desabilitado** — não adicionar suporte a dark mode
- Não usar `.dark` nem `dark:` variants

### 8. Ícones de Estado
- Sempre acompanhados de texto
- Cores via tokens de estado (`text-status-*`)
- Nunca usar cor como única pista visual

### 9. Gráficos (Recharts)
- Cores via `var(--chart-n)` no `ChartConfig` e `Cell.fill`
- Não hardcoded hex

---

## Verificação Automática (CI)

O script `scripts/check-design-tokens.ts` valida:
1. Nenhuma classe Tailwind de cor (`bg-*-*`, `text-*-*`, `border-*-*`, `ring-*-*`) fora de `components/ui/`
2. Nenhum hex value (`#...`) fora de `client/src/index.css`
3. Nenhum uso de `.dark` ou `dark:`
4. `BrandMark` sempre sem `filter`

```bash
pnpm check:design
```

---

## Arquivos de Referência

- Tokens: `client/src/index.css`
- Logo: `client/src/components/lucathi/BrandMark.tsx`
- Status: `client/src/components/lucathi/StatusBadge.tsx`
- Documentação completa: `docs/design-system-lwos.md`

---

*Agentes devem consultar este arquivo antes de qualquer mudança visual.*