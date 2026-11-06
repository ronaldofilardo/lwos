import { ItcmdBracketRule } from "./itcmd-types";

export const DEFAULT_ITCMD_BASELINE: Record<string, ItcmdBracketRule[]> = {
  // AC - Acre
  AC: [
    { uf: "AC", bracketOrder: 1, limitValue: 50000, rate: 0.0 },
    { uf: "AC", bracketOrder: 2, limitValue: 1500000, rate: 4.0 },
    { uf: "AC", bracketOrder: 3, limitValue: 2500000, rate: 5.0 },
    { uf: "AC", bracketOrder: 4, limitValue: 3500000, rate: 6.0 },
    { uf: "AC", bracketOrder: 5, limitValue: 999999999, rate: 7.0 },
  ],

  // AL - Alagoas (4% fixo)
  AL: [{ uf: "AL", bracketOrder: 1, limitValue: 999999999, rate: 4.0 }],

  // AM - Amazonas
  AM: [
    { uf: "AM", bracketOrder: 1, limitValue: 400000, rate: 0.0 },
    { uf: "AM", bracketOrder: 2, limitValue: 2000000, rate: 2.0 },
    { uf: "AM", bracketOrder: 3, limitValue: 6000000, rate: 3.0 },
    { uf: "AM", bracketOrder: 4, limitValue: 999999999, rate: 4.0 },
  ],

  // AP - Amapá (UPF = 4.6802)
  AP: [
    { uf: "AP", bracketOrder: 1, limitValue: 5000, rate: 2.0, indexedUnitName: "UPF-AP", indexedUnitValue: 4.6802 },
    { uf: "AP", bracketOrder: 2, limitValue: 50000, rate: 3.0, indexedUnitName: "UPF-AP", indexedUnitValue: 4.6802 },
    { uf: "AP", bracketOrder: 3, limitValue: 100000, rate: 4.0, indexedUnitName: "UPF-AP", indexedUnitValue: 4.6802 },
    { uf: "AP", bracketOrder: 4, limitValue: 200000, rate: 5.0, indexedUnitName: "UPF-AP", indexedUnitValue: 4.6802 },
    { uf: "AP", bracketOrder: 5, limitValue: 999999999, rate: 6.0, indexedUnitName: "UPF-AP", indexedUnitValue: 4.6802 },
  ],

  // BA - Bahia
  BA: [
    { uf: "BA", bracketOrder: 1, limitValue: 100000, rate: 0.0 },
    { uf: "BA", bracketOrder: 2, limitValue: 200000, rate: 4.0 },
    { uf: "BA", bracketOrder: 3, limitValue: 300000, rate: 6.0 },
    { uf: "BA", bracketOrder: 4, limitValue: 999999999, rate: 8.0 },
  ],

  // CE - Ceará (Ufirce = 6.02969)
  CE: [
    { uf: "CE", bracketOrder: 1, limitValue: 7000, rate: 0.0, indexedUnitName: "Ufirce", indexedUnitValue: 6.02969 },
    { uf: "CE", bracketOrder: 2, limitValue: 10000, rate: 2.0, indexedUnitName: "Ufirce", indexedUnitValue: 6.02969 },
    { uf: "CE", bracketOrder: 3, limitValue: 20000, rate: 4.0, indexedUnitName: "Ufirce", indexedUnitValue: 6.02969 },
    { uf: "CE", bracketOrder: 4, limitValue: 40000, rate: 6.0, indexedUnitName: "Ufirce", indexedUnitValue: 6.02969 },
    { uf: "CE", bracketOrder: 5, limitValue: 999999999, rate: 8.0, indexedUnitName: "Ufirce", indexedUnitValue: 6.02969 },
  ],

  // DF - Distrito Federal
  DF: [
    { uf: "DF", bracketOrder: 1, limitValue: 1578314.94, rate: 4.0 },
    { uf: "DF", bracketOrder: 2, limitValue: 3156629.87, rate: 5.0 },
    { uf: "DF", bracketOrder: 3, limitValue: 999999999, rate: 6.0 },
  ],

  // ES - Espírito Santo (4% fixo)
  ES: [{ uf: "ES", bracketOrder: 1, limitValue: 999999999, rate: 4.0 }],

  // GO - Goiás
  GO: [
    { uf: "GO", bracketOrder: 1, limitValue: 25000, rate: 2.0 },
    { uf: "GO", bracketOrder: 2, limitValue: 200000, rate: 4.0 },
    { uf: "GO", bracketOrder: 3, limitValue: 600000, rate: 6.0 },
    { uf: "GO", bracketOrder: 4, limitValue: 999999999, rate: 8.0 },
  ],

  // MA - Maranhão
  MA: [
    { uf: "MA", bracketOrder: 1, limitValue: 48576, rate: 0.0 },
    { uf: "MA", bracketOrder: 2, limitValue: 300000, rate: 3.0 },
    { uf: "MA", bracketOrder: 3, limitValue: 600000, rate: 4.0 },
    { uf: "MA", bracketOrder: 4, limitValue: 900000, rate: 5.0 },
    { uf: "MA", bracketOrder: 5, limitValue: 1200000, rate: 6.0 },
    { uf: "MA", bracketOrder: 6, limitValue: 999999999, rate: 7.0 },
  ],

  // MG - Minas Gerais (5% fixo)
  MG: [{ uf: "MG", bracketOrder: 1, limitValue: 999999999, rate: 5.0 }],

  // MS - Mato Grosso do Sul (isento até 100k, 6% acima)
  MS: [
    { uf: "MS", bracketOrder: 1, limitValue: 100000, rate: 0.0 },
    { uf: "MS", bracketOrder: 2, limitValue: 999999999, rate: 6.0 },
  ],

  // MT - Mato Grosso (UPF = 250.83 - atualização mensal)
  MT: [
    { uf: "MT", bracketOrder: 1, limitValue: 1500, rate: 0.0, indexedUnitName: "UPF-MT", indexedUnitValue: 250.83 },
    { uf: "MT", bracketOrder: 2, limitValue: 4000, rate: 2.0, indexedUnitName: "UPF-MT", indexedUnitValue: 250.83 },
    { uf: "MT", bracketOrder: 3, limitValue: 8000, rate: 4.0, indexedUnitName: "UPF-MT", indexedUnitValue: 250.83 },
    { uf: "MT", bracketOrder: 4, limitValue: 16000, rate: 6.0, indexedUnitName: "UPF-MT", indexedUnitValue: 250.83 },
    { uf: "MT", bracketOrder: 5, limitValue: 999999999, rate: 8.0, indexedUnitName: "UPF-MT", indexedUnitValue: 250.83 },
  ],

  // PA - Pará (UPF-PA = 4.8013)
  PA: [
    { uf: "PA", bracketOrder: 1, limitValue: 15000, rate: 2.0, indexedUnitName: "UPF-PA", indexedUnitValue: 4.8013 },
    { uf: "PA", bracketOrder: 2, limitValue: 50000, rate: 3.0, indexedUnitName: "UPF-PA", indexedUnitValue: 4.8013 },
    { uf: "PA", bracketOrder: 3, limitValue: 150000, rate: 4.0, indexedUnitName: "UPF-PA", indexedUnitValue: 4.8013 },
    { uf: "PA", bracketOrder: 4, limitValue: 350000, rate: 5.0, indexedUnitName: "UPF-PA", indexedUnitValue: 4.8013 },
    { uf: "PA", bracketOrder: 5, limitValue: 999999999, rate: 6.0, indexedUnitName: "UPF-PA", indexedUnitValue: 4.8013 },
  ],

  // PB - Paraíba
  PB: [
    { uf: "PB", bracketOrder: 1, limitValue: 125000, rate: 2.0 },
    { uf: "PB", bracketOrder: 2, limitValue: 400000, rate: 4.0 },
    { uf: "PB", bracketOrder: 3, limitValue: 1000000, rate: 6.0 },
    { uf: "PB", bracketOrder: 4, limitValue: 999999999, rate: 8.0 },
  ],

  // PE - Pernambuco
  PE: [
    { uf: "PE", bracketOrder: 1, limitValue: 50000, rate: 0.0 },
    { uf: "PE", bracketOrder: 2, limitValue: 317412.45, rate: 2.0 },
    { uf: "PE", bracketOrder: 3, limitValue: 476118.68, rate: 4.0 },
    { uf: "PE", bracketOrder: 4, limitValue: 634824.91, rate: 6.0 },
    { uf: "PE", bracketOrder: 5, limitValue: 999999999, rate: 8.0 },
  ],

  // PI - Piauí (UPF-PI = 4.74)
  PI: [
    { uf: "PI", bracketOrder: 1, limitValue: 10000, rate: 2.0, indexedUnitName: "UPF-PI", indexedUnitValue: 4.74 },
    { uf: "PI", bracketOrder: 2, limitValue: 150000, rate: 4.0, indexedUnitName: "UPF-PI", indexedUnitValue: 4.74 },
    { uf: "PI", bracketOrder: 3, limitValue: 999999999, rate: 6.0, indexedUnitName: "UPF-PI", indexedUnitValue: 4.74 },
  ],

  // PR - Paraná (4% fixo)
  PR: [{ uf: "PR", bracketOrder: 1, limitValue: 999999999, rate: 4.0 }],

  // RJ - Rio de Janeiro (UFIR-RJ = 4.7508)
  RJ: [
    { uf: "RJ", bracketOrder: 1, limitValue: 70000, rate: 4.0, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
    { uf: "RJ", bracketOrder: 2, limitValue: 100000, rate: 4.5, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
    { uf: "RJ", bracketOrder: 3, limitValue: 200000, rate: 5.0, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
    { uf: "RJ", bracketOrder: 4, limitValue: 300000, rate: 6.0, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
    { uf: "RJ", bracketOrder: 5, limitValue: 400000, rate: 7.0, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
    { uf: "RJ", bracketOrder: 6, limitValue: 999999999, rate: 8.0, indexedUnitName: "UFIR-RJ", indexedUnitValue: 4.7508 },
  ],

  // RN - Rio Grande do Norte
  RN: [
    { uf: "RN", bracketOrder: 1, limitValue: 500000, rate: 3.0 },
    { uf: "RN", bracketOrder: 2, limitValue: 1000000, rate: 4.0 },
    { uf: "RN", bracketOrder: 3, limitValue: 3000000, rate: 5.0 },
    { uf: "RN", bracketOrder: 4, limitValue: 999999999, rate: 6.0 },
  ],

  // RO - Rondônia (UPF = 119.14)
  RO: [
    { uf: "RO", bracketOrder: 1, limitValue: 1250, rate: 2.0, indexedUnitName: "UPF", indexedUnitValue: 119.14 },
    { uf: "RO", bracketOrder: 2, limitValue: 6170, rate: 3.0, indexedUnitName: "UPF", indexedUnitValue: 119.14 },
    { uf: "RO", bracketOrder: 3, limitValue: 999999999, rate: 4.0, indexedUnitName: "UPF", indexedUnitValue: 119.14 },
  ],

  // RR - Roraima (4% fixo)
  RR: [{ uf: "RR", bracketOrder: 1, limitValue: 999999999, rate: 4.0 }],

  // RS - Rio Grande do Sul (UPF = 27.13)
  RS: [
    { uf: "RS", bracketOrder: 1, limitValue: 2000, rate: 0.0, indexedUnitName: "UPF", indexedUnitValue: 27.13 },
    { uf: "RS", bracketOrder: 2, limitValue: 10000, rate: 3.0, indexedUnitName: "UPF", indexedUnitValue: 27.13 },
    { uf: "RS", bracketOrder: 3, limitValue: 30000, rate: 4.0, indexedUnitName: "UPF", indexedUnitValue: 27.13 },
    { uf: "RS", bracketOrder: 4, limitValue: 50000, rate: 5.0, indexedUnitName: "UPF", indexedUnitValue: 27.13 },
    { uf: "RS", bracketOrder: 5, limitValue: 999999999, rate: 6.0, indexedUnitName: "UPF", indexedUnitValue: 27.13 },
  ],

  // SC - Santa Catarina
  SC: [
    { uf: "SC", bracketOrder: 1, limitValue: 20000, rate: 1.0 },
    { uf: "SC", bracketOrder: 2, limitValue: 50000, rate: 3.0 },
    { uf: "SC", bracketOrder: 3, limitValue: 150000, rate: 5.0 },
    { uf: "SC", bracketOrder: 4, limitValue: 999999999, rate: 7.0 },
  ],

  // SE - Sergipe (UFP = 72.61 - atualização mensal)
  SE: [
    { uf: "SE", bracketOrder: 1, limitValue: 500, rate: 0.0, indexedUnitName: "UFP", indexedUnitValue: 72.61 },
    { uf: "SE", bracketOrder: 2, limitValue: 2417, rate: 3.0, indexedUnitName: "UFP", indexedUnitValue: 72.61 },
    { uf: "SE", bracketOrder: 3, limitValue: 12086, rate: 6.0, indexedUnitName: "UFP", indexedUnitValue: 72.61 },
    { uf: "SE", bracketOrder: 4, limitValue: 999999999, rate: 8.0, indexedUnitName: "UFP", indexedUnitValue: 72.61 },
  ],

  // SP - São Paulo (4% fixo)
  SP: [{ uf: "SP", bracketOrder: 1, limitValue: 999999999, rate: 4.0, indexedUnitName: "UFESP", indexedUnitValue: 35.36 }],

  // TO - Tocantins
  TO: [
    { uf: "TO", bracketOrder: 1, limitValue: 25000, rate: 0.0 },
    { uf: "TO", bracketOrder: 2, limitValue: 100000, rate: 2.0 },
    { uf: "TO", bracketOrder: 3, limitValue: 500000, rate: 4.0 },
    { uf: "TO", bracketOrder: 4, limitValue: 2000000, rate: 6.0 },
    { uf: "TO", bracketOrder: 5, limitValue: 999999999, rate: 8.0 },
  ],
};

const ALL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function getBaselineBracketsForUf(uf: string): ItcmdBracketRule[] {
  const norm = uf.trim().toUpperCase();
  if (DEFAULT_ITCMD_BASELINE[norm]) {
    return DEFAULT_ITCMD_BASELINE[norm];
  }
  return [{ uf: norm, bracketOrder: 1, limitValue: 999999999, rate: 4.0 }];
}

export function getAllBaselineBrackets(): ItcmdBracketRule[] {
  return ALL_UFS.flatMap(uf => getBaselineBracketsForUf(uf));
}
