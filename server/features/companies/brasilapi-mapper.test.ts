import { describe, expect, it } from "vitest";
import { mapBrasilApiToCompanyData } from "./brasilapi-mapper";
import type { BrasilApiCnpjResponse } from "./brasilapi-types";

describe("brasilapi-mapper", () => {
  it("mapeia empresa LTDA com Simples Nacional e administradores do QSA", () => {
    const apiData: BrasilApiCnpjResponse = {
      cnpj: "12345678000195",
      razao_social: "HOLDING FAMILIAR SILVA LTDA",
      uf: "SP",
      codigo_natureza_juridica: 2062,
      natureza_juridica: "Sociedade Empresária Limitada",
      opcao_pelo_simples: true,
      capital_social: 500000,
      cnae_fiscal_descricao: "Holdings de instituições não-financeiras",
      descricao_tipo_de_logradouro: "AVENIDA",
      logradouro: "PAULISTA",
      numero: "1000",
      complemento: "CJ 101",
      bairro: "BELA VISTA",
      municipio: "SAO PAULO",
      cep: "01310100",
      qsa: [
        {
          nome_socio: "JOAO DA SILVA",
          qualificacao_socio: "49-Sócio-Administrador",
        },
        {
          nome_socio: "MARIA DA SILVA",
          qualificacao_socio: "22-Sócio",
        },
        {
          nome_socio: "CARLOS DA SILVA",
          qualificacao_socio: "Administrador",
        },
      ],
    };

    const mapped = mapBrasilApiToCompanyData(apiData);

    expect(mapped.legalName).toBe("HOLDING FAMILIAR SILVA LTDA");
    expect(mapped.societaryType).toBe("LTDA");
    expect(mapped.taxRegime).toBe("SIMPLES_NACIONAL");
    expect(mapped.uf).toBe("SP");
    expect(mapped.capitalSocial).toBe(500000);
    expect(mapped.corporatePurpose).toBe("Holdings de instituições não-financeiras");
    expect(mapped.sede).toContain("AVENIDA PAULISTA, nº 1000, CJ 101, BELA VISTA, SAO PAULO/SP, CEP 01310100");
    expect(mapped.administrator1).toBe("JOAO DA SILVA");
    expect(mapped.administrator2).toBe("CARLOS DA SILVA");
    expect(mapped.stakeholders).toHaveLength(3);
    expect(mapped.stakeholders[0]).toEqual({ name: "JOAO DA SILVA", percentage: 0 });
  });

  it("impede Simples Nacional se tipo for SA (LC 123/2006)", () => {
    const apiData: BrasilApiCnpjResponse = {
      cnpj: "60701190000104",
      razao_social: "BANCO TESTE S.A.",
      codigo_natureza_juridica: 2054,
      natureza_juridica: "Sociedade Anônima Fechada",
      opcao_pelo_simples: true,
    };

    const mapped = mapBrasilApiToCompanyData(apiData);
    expect(mapped.societaryType).toBe("SA");
    expect(mapped.taxRegime).toBeNull();
  });
});
