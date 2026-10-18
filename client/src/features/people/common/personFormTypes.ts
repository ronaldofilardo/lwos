import type { Uf } from "@shared/validation";
import type { CivilStatus, MaritalRegime, Vinculo } from "@/features/families/types";

export type PersonFormSubmit = {
  fullName: string;
  email?: string;
  taxId: string;
  birthDate: string;
  phone?: string;
  exSpouseNote?: string;
  vinculo: Vinculo;
  parentPersonId?: string;
  spouseName?: string;
  civilStatus?: CivilStatus;
  maritalRegime?: MaritalRegime;
  isDependent?: boolean;
  addressSameAsPrimary?: boolean;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  uf?: Uf;
};

export type PersonSummary = {
  id: string;
  fullName: string;
  vinculo: Vinculo | null;
  birthDate?: string | null;
  isPrimaryContact?: boolean;
};
