import { describe, expect, it } from "vitest";
import {
  isExamplePlaceholder,
  propertyFieldCopy,
  propertyOwnerFieldCopy,
  SELECT_PLACEHOLDER,
} from "./propertyFieldCopy";

const allCopy = {
  ...propertyFieldCopy,
  ...propertyOwnerFieldCopy,
};

describe("propertyFieldCopy (item 5.4 / 5.8)", () => {
  it("todo campo tem label visível e placeholder não vazios", () => {
    for (const [key, copy] of Object.entries(allCopy)) {
      expect(copy.label.trim(), `label de ${key}`).not.toBe("");
      expect(copy.placeholder.trim(), `placeholder de ${key}`).not.toBe("");
    }
  });

  it("o placeholder nunca repete o nome do campo", () => {
    for (const [key, copy] of Object.entries(allCopy)) {
      expect(copy.placeholder, `placeholder de ${key}`).not.toBe(copy.label);
    }
  });

  it("o placeholder é sempre exemplo, data ou «Selecione»", () => {
    for (const [key, copy] of Object.entries(allCopy)) {
      expect(
        isExamplePlaceholder(copy.placeholder),
        `placeholder de ${key}: ${copy.placeholder}`
      ).toBe(true);
    }
  });

  it("não deixa «obrigatório» nos textos do imóvel (inscrição é só necessária)", () => {
    expect(propertyFieldCopy.inscricaoImobiliaria.label).toBe(
      "Inscrição imobiliária"
    );
    expect(propertyFieldCopy.inscricaoImobiliaria.placeholder).not.toMatch(
      /obrigat/i
    );
  });

  it("segue a tabela do plano (amostra de rótulos e exemplos)", () => {
    expect(propertyFieldCopy.description).toEqual({
      label: "Descrição do imóvel",
      placeholder: "Ex.: Apartamento Jardins, Rua Augusta 100",
    });
    expect(propertyFieldCopy.uf).toEqual({
      label: "Estado",
      placeholder: "Selecione",
    });
    expect(propertyFieldCopy.registryOfficeNumber.placeholder).toBe(
      "Selecione (1 a 55)"
    );
    expect(propertyFieldCopy.acquisitionDate.placeholder).toBe("dd/mm/aaaa");
    expect(propertyFieldCopy.declaredValue.label).toBe("Valor do IRPF/Balanço");
    expect(propertyFieldCopy.itbiRate.placeholder).toBe("Ex.: 3%");
    expect(propertyFieldCopy.laudemioRate.placeholder).toBe("Ex.: 2,5%");
    expect(propertyFieldCopy.rentValue.label).toBe(
      "Valor aluguel/arrendamento"
    );
    expect(propertyFieldCopy.encumbranceType.label).toBe("Gravames/Restrições");
    expect(propertyFieldCopy.encumbranceNote.placeholder).toBe(
      "Ex.: Hipoteca em favor do Banco X"
    );
    expect(propertyFieldCopy.notes.placeholder).toBe(
      "Ex.: Informações adicionais"
    );
  });

  it("isExamplePlaceholder rejeita nomes de campo", () => {
    expect(isExamplePlaceholder("Cidade do imóvel")).toBe(false);
    expect(isExamplePlaceholder(SELECT_PLACEHOLDER)).toBe(true);
  });
});
