export type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
};

export type AddressLookupResult = {
  cep: string;
  street: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  source: "VIACEP" | "BRASILAPI";
};
