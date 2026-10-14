export type BrasilApiQsaItem = {
  identificador_de_socio?: number | null;
  nome_socio?: string | null;
  cnpj_cpf_do_socio?: string | null;
  codigo_qualificacao_socio?: number | null;
  qualificacao_socio?: string | null;
  data_entrada_sociedade?: string | null;
  codigo_pais?: number | null;
  pais?: string | null;
  cpf_representante_legal?: string | null;
  nome_representante_legal?: string | null;
  codigo_qualificacao_representante_legal?: number | null;
  qualificacao_representante_legal?: string | null;
  faixa_etaria?: string | null;
};

export type BrasilApiCnaeSecundario = {
  codigo?: number | null;
  descricao?: string | null;
};

export type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  situacao_cadastral?: number | string | null;
  descricao_situacao_cadastral?: string | null;
  data_situacao_cadastral?: string | null;
  codigo_natureza_juridica?: number | null;
  natureza_juridica?: string | null;
  data_inicio_atividade?: string | null;
  cnae_fiscal?: number | null;
  cnae_fiscal_descricao?: string | null;
  cnaes_secundarios?: BrasilApiCnaeSecundario[] | null;
  descricao_tipo_de_logradouro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cep?: number | string | null;
  uf?: string | null;
  codigo_municipio?: number | null;
  municipio?: string | null;
  ddd_telefone_1?: string | null;
  ddd_telefone_2?: string | null;
  capital_social?: number | null;
  porte?: string | null;
  opcao_pelo_simples?: boolean | null;
  data_opcao_pelo_simples?: string | null;
  opcao_pelo_mei?: boolean | null;
  qsa?: BrasilApiQsaItem[] | null;
};
