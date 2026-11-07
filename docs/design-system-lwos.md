# Lucathi Wealth OS — Design System

Este documento descreve os tokens, componentes e padrões visuais do Lucathi Wealth OS, alinhados ao brandbook da Lucathi Consult.

---

## 1. Tokens de Cor

### Cores da Marca (Brand Colors)
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-lucathi-canvas` | `#FBFBF8` | Fundo principal (`body`) |
| `--color-lucathi-deep` | `#00243E` | Azul marinho profundo — hover do botão primário, cards de destaque |
| `--color-lucathi-navy` | `#003663` | Azul marinho — cor primária (`--primary`), títulos, ícones principais |
| `--color-lucathi-ink` | `#2A3036` | Grafite — texto principal (`--foreground`) |
| `--color-lucathi-gray` | `#60666B` | Cinza médio — textos secundários, `--muted-foreground` |
| `--color-lucathi-line` | `#E4E6E4` | Linha/divisória — `--border`, `--input` |
| `--color-lucathi-mist` | `#F2F5F5` | Cinza claro — `--muted`, `--secondary`, `--accent`, fundos sutis |

### Cores de Estado (Status Colors)
*O brandbook não define cores de estado; mantemos vermelho, âmbar e verde em tons dessaturados.*

| Token | Fundo | Texto | Borda | Uso |
|-------|-------|-------|-------|-----|
| `--color-status-success-*` | `#E8F5E9` | `#2E7D32` | `#A5D6A7` | Validado, Concluído, Negativa |
| `--color-status-warning-*` | `#FFF8E1` | `#F57F17` | `#FFECB3` | Pendente, Em análise, Em revisão, Alerta amarelo |
| `--color-status-danger-*` | `#FDECEA` | `#C62828` | `#EF9A9A` | Rejeitado, Vencido, Positiva, Alerta vermelho, Erro |
| `--color-status-info-*` | `#E3F2FD` | `#1565C0` | `#90CAF9` | Em andamento, Aguardando docs, Positiva c/ efeitos |
| `--color-status-neutral-*` | `#F2F5F5` | `#60666B` | `#E4E6E4` | Dispensado, Não possui, Cancelado |

### Cores de Gráfico (Chart Colors)
Escala azul/cinza para gráficos (Recharts):

| Token | Valor |
|-------|-------|
| `--chart-1` | `#00243E` (lucathi-deep) |
| `--chart-2` | `#003663` (lucathi-navy) |
| `--chart-3` | `#5B7F9B` |
| `--chart-4` | `#B3C2CC` |
| `--chart-5` | `#60666B` (lucathi-gray) |

---

## 2. Tipografia

| Papel | Fonte | Pesos Carregados | Classe CSS |
|-------|-------|------------------|------------|
| Títulos (h1, h2, display) | Cormorant Garamond | 500, 600, 700 | `.font-display` (weight 600) |
| Subtítulos, rótulos, labels | Montserrat | 500, 600 | `.font-subtitle` |
| Corpo, UI, textos longos | Inter | 400, 500, 600, 700 | `.font-sans` (padrão) |

**Regras:**
- `h1`, `h2` → Cormorant Garamond 600 (semibold)
- Rótulos `uppercase tracking-*` → Montserrat 500 (`.font-subtitle`)
- Texto corrido → Inter Regular/Medium
- **Não usar** `font-bold` em texto corrido; usar `font-medium` ou `font-semibold`
- **Sentence case** na interface; caixa alta só no brandbook (marketing)

---

## 3. Logo e BrandMark

### Arquivos (em `client/public/`)
| Arquivo | Descrição | Dimensões |
|---------|-----------|-----------|
| `lucathi-logo.png` | Logo principal azul (lockup horizontal) | ≥ 750 px largura (ideal) |
| `lucathi-logo-mark.png` | Escudo azul isolado (favicon, apple-touch-icon) | 180×180 (apple-touch-icon) |
| `lucathi-logo-white.png` | Versão negativa branca (para fundos `lucathi-deep`) | Mesmo tamanho do principal |
| `apple-touch-icon.png` | Cópia do escudo para iOS | 180×180 |

### Componente `BrandMark`
```tsx
type BrandMarkProps = {
  compact?: boolean;           // h-7 vs h-9
  variant?: "primary" | "negative";  // usa arquivo correspondente
};
```

- **Nunca** usar `filter: brightness(0) invert(1)` — cada variante tem seu arquivo.
- `variant="negative"` **apenas** sobre fundo `lucathi-deep` (`#00243E`).
- Área de proteção = altura da letra "L" (implementada como `pl-[1.2em]` no componente).
- Tamanhos: `compact` → `h-7` (sidebar), padrão → `h-9` (header, login).

---

## 4. Botões

### Botão Primário (Padrão)
- **Fundo**: `--primary` (`#003663` / `lucathi-navy`)
- **Hover**: `lucathi-deep` (`#00243E`)
- **Texto**: branco
- **Classe**: `<Button>` (variante `default`)

### Botões Manuais (Removidos)
- ❌ `bg-lucathi-deep hover:bg-lucathi-navy` → usar `<Button>`
- ❌ `bg-lucathi-navy hover:bg-lucathi-dark` (token inexistente) → usar `<Button>` ou `hover:bg-lucathi-deep`

---

## 5. Raios e Sombras (Border Radius & Shadows)

| Escala | Valor | Uso |
|--------|-------|-----|
| `--radius-sm` | `calc(var(--radius) - 4px)` | Inputs pequenos, badges |
| `--radius-md` | `calc(var(--radius) - 2px)` | Inputs padrão |
| `--radius` / `--radius-lg` | `0.65rem` (10.4px) | Cards padrão, botões |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Cards grandes, modais |
| Heróis / Login | `28px` (`rounded-[28px]`) | Cards de destaque, tela de login |

**Sombras:**
- Cards padrão: `shadow-sm`
- Login / cards de destaque: `shadow-xl` → reduzir para `shadow-sm` (conforme Fase 5)
- Modais: `shadow-2xl`

---

## 6. Componentes de Estado

### StatusBadge
Fonte única de verdade para estados de documento/certidão.
```tsx
<StatusBadge status="VALIDADO" />     // success
<StatusBadge status="REJEITADO" />    // danger
<StatusBadge status="PENDENTE" />     // warning
<StatusBadge status="DISPENSADO" />   // neutral
```

### PropertyTaxBadge
Para recomendação tributária (métrica 6):
- `VENDER_PF` → success (verde)
- `VENDER_PJ` → info (azul)
- `PENDENTE` → warning (âmbar)

### PaybackBadge
- ≤ 3 anos → success
- 3–7 anos → info
- > 7 anos → warning

---

## 7. Ícones de Estado

| Estado | Ícone | Cor | Regra |
|--------|-------|-----|-------|
| Sucesso | `CheckCircle` | `text-status-success-text` | Sempre com texto |
| Alerta | `TriangleAlert` | `text-status-warning-text` | Sempre com texto |
| Erro | `AlertCircle` / `CircleAlert` | `text-status-danger-text` | Sempre com texto |
| Info | `CircleDashed` / `Loader2` | `text-status-info-text` | Sempre com texto |
| Neutro | `Ban` / `EyeOff` | `text-status-neutral-text` | Sempre com texto |

**Nunca** usar ícone colorido como única pista visual — sempre acompanhar de texto.

---

## 8. Layout e Espaçamento

- **Container**: max-width 1280px, padding responsivo (16px mobile, 24px tablet, 32px desktop)
- **Grid base**: 4px (Tailwind spacing scale)
- **Cards**: `rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm`
- **Seções**: `space-y-6` ou `space-y-8` entre blocos principais

---

## 9. Tema Escuro (Dark Mode)

**Desabilitado.** O brandbook não prevê tema escuro.
- Bloco `.dark` removido do `index.css`
- `ThemeContext` não expõe `toggleTheme` nem `switchable`
- `class="dark"` nunca adicionado ao `<html>`

---

## 10. Prevenção de Regressão (CI)

Script `scripts/check-design-tokens.ts` (executado no CI):

```bash
# Falha se encontrar:
# - Paleta Tailwind de cor direta (bg-red-500, text-blue-600, etc.) fora de components/ui/
# - Valores hex hardcoded fora de index.css
# - Uso de .dark ou dark:
```

```json
// package.json
"check:design": "tsx scripts/check-design-tokens.ts"
```

---

## 11. Checklist de Aceite Visual

| Tela | Verificação |
|------|-------------|
| Login | Logo legível, botão primário navy, fundo `lucathi-canvas` |
| `/interesse` | Logo, botão primário, sucesso em status tokens |
| Home | Títulos Cormorant 600, rótulos Montserrat, métricas |
| Família / Workspace | Sidebar logo, navegação, cards com tokens |
| Documentos | StatusBadge com tokens, sem cores Tailwind diretas |
| Cálculos / ITCD | Gráficos com `var(--chart-n)`, badges semânticos |
| Portal do Cliente | Logo negativo no header, cards brand |
| 404 | Canvas brand, botão primário, sem slate/gradiente |

---

## 12. Pendências do Brandbook (para alinhar com designer)

1. **Cor do escudo e tagline**: brandbook diz `#2A3036` (grafite), desenho é azul-marinho → confirmar `#00243E`.
2. **Fonte do corpo**: PDF usa Montserrat, texto diz Inter → confirmar Inter.
3. **Lockup horizontal**: brandbook só mostra verticais → aprovar horizontal para sidebar/header.
4. **Arquivos SVG**: pedir SVG do logo principal, escudo isolado e versão negativa branca (≥ 750 px).

---

*Última atualização: Nov 7, 2026 — Fase 0 a 5 concluídas.*