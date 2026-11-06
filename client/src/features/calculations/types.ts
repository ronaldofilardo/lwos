/**
 * Tipos canônicos da aba «Cálculos»: o que a UI consome depois de cruzar
 * patrimônio, imóveis e sociedades do projeto.
 */
import type {
  MemberWealthRow,
  OwnerTotalsRow,
  WealthBreakdown,
} from "@shared/domain/family-wealth-calculator";
import type {
  PropertyTaxMetrics,
  RentalPortfolio,
} from "@shared/domain/property-tax-engine";
import type { MultiStateSuccessionResult } from "@shared/domain/itcmd-types";

export type PropertyTaxRow = PropertyTaxMetrics & {
  propertyId: string;
  description: string;
  marketValue: number;
  isRental: boolean;
  itbiRate: number | null;
  hasLaudemio: boolean;
  laudemioRate: number | null;
  emolumentsValue: number;
  irGcapValue: number;
  rentValue: number;
  uf: string;
  itcmdTax: number;
  itcmdRate: number;
};

export type CalculationsView = {
  /** Visão dos Patriarcas (titular + cônjuge). */
  patriarch: WealthBreakdown;
  /** Nomes dos membros considerados patriarcas. */
  patriarchNames: string[];
  /** Patrimônio consolidado por membro da família. */
  members: MemberWealthRow[];
  /** As 14 métricas tributárias por imóvel + ITCMD individual. */
  properties: PropertyTaxRow[];
  /** Quadro «Totais por Proprietário». */
  ownerTotals: OwnerTotalsRow[];
  /** Portfólio de locação que decide o gatilho do IBS/CBS. */
  portfolio: RentalPortfolio;
  ibsCbsTriggered: boolean;
  /** UF principal dos patriarcas (domicílio fiscal). */
  patriarchUf: string;
  /** Mapa de competência do ITCMD multi-SEFAZ (Art. 155 da CF). */
  multiStateItcmd: MultiStateSuccessionResult;
};
