#!/usr/bin/env tsx
/**
 * Design Token Regression Check
 *
 * Falha se encontrar:
 * 1. Paleta Tailwind de cor direta (bg-red-500, text-blue-600, etc.) em features/pages/components (exceto ui/)
 * 2. Valores hex hardcoded fora de index.css
 * 3. Uso de .dark ou dark: fora de components/ui/
 * 4. filter: brightness/invert no BrandMark
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const ROOT = "client/src";
const ALLOWED_UI_DIR = join("client", "src", "components", "ui");
const ALLOWED_CSS = join("client", "src", "index.css");

// Paleta Tailwind real (não tokens semânticos shadcn)
const TAILWIND_PALETTE = [
  "red", "amber", "emerald", "green", "lime", "yellow", "orange",
  "rose", "pink", "fuchsia", "purple", "violet", "indigo", "blue",
  "sky", "cyan", "teal", "slate", "gray", "zinc", "neutral", "stone",
  "warm", "cool"
];

const TAILWIND_COLOR_PATTERN = new RegExp(
  `(bg|text|border|ring|fill|stroke)-(${TAILWIND_PALETTE.join("|")})-(50|100|200|300|400|500|600|700|800|900|950)`,
  "g"
);

// Hex values (3, 4, 6, 8 dígitos)
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

// Dark mode patterns
const DARK_PATTERNS = [
  /\bdark:/g,
  /\.\bdark\b/g,
  /classList\.add\(["']dark["']\)/g,
  /classList\.remove\(["']dark["']\)/g,
  /switchable\s*[:=]\s*true/g,
];

// BrandMark filter anti-pattern
const BRANDMARK_FILTER_PATTERN = /filter\s*:\s*["']?brightness\(0\)\s+invert\(1\)["']?/g;

function getFiles(dir: string, exts: string[] = [".tsx", ".ts", ".css"]): string[] {
  const files: string[] = [];
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (!entry.startsWith(".") && entry !== "node_modules") walk(full);
      } else if (exts.includes(extname(full))) {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

function isAllowedUiFile(file: string): boolean {
  const normalizedFile = file.replace(/\\/g, sep);
  const normalizedAllowed = ALLOWED_UI_DIR.replace(/\\/g, sep);
  return normalizedFile.startsWith(normalizedAllowed);
}

function isAllowedCssFile(file: string): boolean {
  const normalizedFile = file.replace(/\\/g, sep);
  const normalizedAllowed = ALLOWED_CSS.replace(/\\/g, sep);
  return normalizedFile === normalizedAllowed;
}

function checkFile(file: string, content: string): string[] {
  const errors: string[] = [];
  const rel = relative(process.cwd(), file);

  // Skip ui folder entirely - it's the shadcn base with dark mode variants
  if (isAllowedUiFile(file)) {
    return errors;
  }

  // 1. Tailwind palette colors
  const paletteMatches = content.match(TAILWIND_COLOR_PATTERN);
  if (paletteMatches) {
    for (const m of paletteMatches) {
      errors.push(`${rel}: Tailwind palette class "${m}" não permitida — usar tokens semânticos (ex: text-lucathi-navy, bg-status-success-bg)`);
    }
  }

  // 2. Hex values (skip index.css where tokens are defined)
  if (!isAllowedCssFile(file)) {
    const hexMatches = content.match(HEX_PATTERN);
    if (hexMatches) {
      for (const h of hexMatches) {
        // Ignorar em comentários
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.includes(h) && !line.trimStart().startsWith("//") && !line.includes("/*")) {
            errors.push(`${rel}: Hex value "${h}" hardcoded — usar token CSS`);
            break;
          }
        }
      }
    }
  }

  // 3. Dark mode (skip ThemeContext which manages the disabled dark mode)
  if (!file.includes("ThemeContext")) {
    for (const pattern of DARK_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        for (const m of matches) {
          errors.push(`${rel}: Dark mode pattern "${m}" não permitida (tema escuro desabilitado)`);
        }
      }
    }
  }

  // 4. BrandMark filter
  if (file.includes("BrandMark")) {
    const filterMatches = content.match(BRANDMARK_FILTER_PATTERN);
    if (filterMatches) {
      for (const m of filterMatches) {
        errors.push(`${rel}: BrandMark usa filter invert — usar variant="negative" com arquivo separado`);
      }
    }
  }

  return errors;
}

function main() {
  console.log("🔍 Verificando design tokens...\n");

  const files = getFiles(ROOT);
  let totalErrors = 0;

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const errors = checkFile(file, content);
    for (const err of errors) {
      console.error(`❌ ${err}`);
      totalErrors++;
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Falha: ${totalErrors} violação(ões) de design tokens encontrada(s).`);
    process.exit(1);
  } else {
    console.log("✅ Todas as verificações de design tokens passaram.");
    process.exit(0);
  }
}

main();