/**
 * @description Valida as regras da Fase 5 do propertyInputSchema: rural exige
 * CCIR/NIRF, laudemio exige alíquota, locação exige valor, ITBI 0–100, nº do
 * cartório 1–55, documento alternativo sem matrícula, e o semáforo de gravames
 * (isEncumbranceRed).
 * @see server/features/properties/property-types.ts
 */
import { describe, expect, it } from "vitest";
import {
  isEncumbranceRed,
  propertyInputSchema,
  propertyOwnerInputSchema,
  propertyOwnerUpdateSchema,
} from "./property-types";

const base = {
  familyId: "fam-1",
  description: "Casa de praia",
  propertyCity: "Paraty",
  hasRegistration: true,
  hasLaudemio: false,
  utility: "PENDENTE" as const,
  encumbranceType: "PENDENTE" as const,
};

describe("propertyInputSchema", () => {
  it("aceita imóvel urbano com inscrição, cartório e valores", () => {
    const parsed = propertyInputSchema.parse({
      ...base,
      kind: "URBANO",
      inscricaoImobiliaria: "12345",
      uf: "RJ",
      registryOfficeNumber: 12,
      registryUf: "RJ",
      registryCity: "Paraty",
      declaredValue: 500000,
      marketValue: 750000,
      venalValue: 700000,
      itbiRate: 3,
      utility: "RESIDENCIAL",
    });
    expect(parsed.itbiRate).toBe(3);
    expect(parsed.registryOfficeNumber).toBe(12);
  });

  it("recusa imóvel rural sem CCIR ou NIRF", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, kind: "RURAL" })
    ).toThrow(/CCIR e NIRF/);
    expect(() =>
      propertyInputSchema.parse({ ...base, kind: "RURAL", ccir: "123" })
    ).toThrow(/CCIR e NIRF/);
    expect(
      propertyInputSchema.parse({
        ...base,
        kind: "RURAL",
        ccir: "123",
        nirf: "456",
      }).ccir
    ).toBe("123");
  });

  it("recusa sem matrícula sem documento alternativo e justificativa", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, hasRegistration: false })
    ).toThrow(/documento alternativo/);
  });

  it("recusa nº do cartório fora de 1–55 e ITBI fora de 0–100", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, registryOfficeNumber: 0 })
    ).toThrow();
    expect(() =>
      propertyInputSchema.parse({ ...base, registryOfficeNumber: 56 })
    ).toThrow();
    expect(() =>
      propertyInputSchema.parse({ ...base, itbiRate: 101 })
    ).toThrow();
    expect(() =>
      propertyInputSchema.parse({ ...base, itbiRate: -1 })
    ).toThrow();
  });

  it("exige alíquota de laudemio quando confirmado e limpa quando não", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, hasLaudemio: true })
    ).toThrow(/alíquota/);
    const parsed = propertyInputSchema.parse({
      ...base,
      hasLaudemio: true,
      laudemioRate: 2.5,
    });
    expect(parsed.laudemioRate).toBe(2.5);
    const without = propertyInputSchema.parse({ ...base, hasLaudemio: false });
    expect(without.laudemioRate).toBeUndefined();
  });

  it("exige valor de locação para Locação/Arrendamento e ignora em outras utilidades", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, utility: "LOCACAO_ARRENDAMENTO" })
    ).toThrow(/locação/);
    const parsed = propertyInputSchema.parse({
      ...base,
      utility: "LOCACAO_ARRENDAMENTO",
      rentValue: 4500,
    });
    expect(parsed.rentValue).toBe(4500);
    const other = propertyInputSchema.parse({
      ...base,
      utility: "LAZER",
      rentValue: 4500,
    });
    expect(other.utility).toBe("LAZER");
  });

  it("aceita valores negativos? não — recusa valores negativos", () => {
    expect(() =>
      propertyInputSchema.parse({ ...base, declaredValue: -1 })
    ).toThrow();
  });

  it("gravame nasce Pendente por padrão", () => {
    const parsed = propertyInputSchema.parse(base);
    expect(parsed.encumbranceType).toBe("PENDENTE");
  });

  it("exige UF válida quando informada", () => {
    expect(() => propertyInputSchema.parse({ ...base, uf: "XX" })).toThrow();
    expect(propertyInputSchema.parse({ ...base, uf: "SP" }).uf).toBe("SP");
  });
});

describe("propertyOwnerInputSchema — pessoa ou sociedade", () => {
  it("aceita exatamente pessoa ou sociedade", () => {
    expect(
      propertyOwnerInputSchema.parse({
        propertyId: "imovel-1",
        personId: "p1",
        ownershipPercentage: 60,
        rightType: "PROPRIEDADE",
      }).personId
    ).toBe("p1");
    expect(
      propertyOwnerInputSchema.parse({
        propertyId: "imovel-1",
        companyId: "hold-1",
        ownershipPercentage: 40,
        rightType: "USUFRUTO",
      }).companyId
    ).toBe("hold-1");
  });

  it("recusa sem dono ou com dois donos", () => {
    expect(() =>
      propertyOwnerInputSchema.parse({
        propertyId: "imovel-1",
        ownershipPercentage: 50,
        rightType: "PROPRIEDADE",
      })
    ).toThrow(/exatamente um dono/);
    expect(() =>
      propertyOwnerInputSchema.parse({
        propertyId: "imovel-1",
        personId: "p1",
        companyId: "hold-1",
        ownershipPercentage: 50,
        rightType: "PROPRIEDADE",
      })
    ).toThrow(/exatamente um dono/);
  });
});

describe("propertyOwnerUpdateSchema", () => {
  it("permite atualização sem troca de dono e recusa dois donos", () => {
    expect(
      propertyOwnerUpdateSchema.parse({
        propertyId: "imovel-1",
        ownerId: "own-1",
        ownershipPercentage: 30,
      }).ownershipPercentage
    ).toBe(30);
    expect(() =>
      propertyOwnerUpdateSchema.parse({
        propertyId: "imovel-1",
        ownerId: "own-1",
        personId: "p1",
        companyId: "hold-1",
      })
    ).toThrow(/exatamente um dono/);
  });
});

describe("isEncumbranceRed — semáforo", () => {
  it("verde apenas em Não há; amarelo em Pendente e N/A; vermelho no resto", () => {
    expect(isEncumbranceRed("NAO_HA")).toBe(false);
    expect(isEncumbranceRed("PENDENTE")).toBe(false);
    expect(isEncumbranceRed("NA")).toBe(false);
    expect(isEncumbranceRed("HIPOTECA")).toBe(true);
    expect(isEncumbranceRed("PENHORA")).toBe(true);
    expect(isEncumbranceRed("OUTROS")).toBe(true);
    expect(isEncumbranceRed("ALIENACAO_FIDUCIARIA")).toBe(true);
    expect(isEncumbranceRed(null)).toBe(false);
    expect(isEncumbranceRed(undefined)).toBe(false);
  });
});
