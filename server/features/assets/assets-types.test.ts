/**
 * @description Validação zod dos ativos: categoria obrigatória sem default,
 * valor declarado > 0, responsável e descrição mínima de 2 caracteres.
 * @see server/features/assets/assets-types.ts
 */
import { describe, expect, it } from "vitest";
import { createAssetSchema, updateAssetSchema } from "./assets-types";

const base = {
  familyId: "fam-1",
  category: "INVESTIMENTOS" as const,
  description: "Conta XP Investimentos",
  declaredValue: 150000,
  ownerPersonId: "p1",
};

describe("createAssetSchema", () => {
  it("aceita ativo completo", () => {
    const parsed = createAssetSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it("exige categoria — sem default de \"Outros\"/\"Investimentos\"", () => {
    const { category: _category, ...withoutCategory } = base;
    const parsed = createAssetSchema.safeParse(withoutCategory);
    expect(parsed.success).toBe(false);
  });

  it("recusa valor declarado zero ou negativo", () => {
    expect(createAssetSchema.safeParse({ ...base, declaredValue: 0 }).success).toBe(false);
    expect(createAssetSchema.safeParse({ ...base, declaredValue: -10 }).success).toBe(false);
  });

  it("recusa valor acima do teto de numeric(15,2) (13 inteiros)", () => {
    expect(
      createAssetSchema.safeParse({ ...base, declaredValue: 9_999_999_999_999.99 }).success
    ).toBe(true);
    expect(
      createAssetSchema.safeParse({ ...base, declaredValue: 10_000_000_000_000 }).success
    ).toBe(false);
    expect(
      createAssetSchema.safeParse({ ...base, declaredValue: Number.POSITIVE_INFINITY }).success
    ).toBe(false);
  });

  it("aceita as categorias offshore", () => {
    for (const category of ["CONTA_CORRENTE_OFFSHORE", "INVESTIMENTOS_OFFSHORE"]) {
      expect(createAssetSchema.safeParse({ ...base, category }).success).toBe(true);
    }
  });

  it("observações aceitam até 8000 caracteres", () => {
    expect(createAssetSchema.safeParse({ ...base, notes: "x".repeat(8000) }).success).toBe(true);
    expect(createAssetSchema.safeParse({ ...base, notes: "x".repeat(8001) }).success).toBe(false);
  });

  it("exige responsável (ownerPersonId)", () => {
    const { ownerPersonId: _owner, ...withoutOwner } = base;
    expect(createAssetSchema.safeParse(withoutOwner).success).toBe(false);
  });

  it("exige descrição mínima de 2 caracteres", () => {
    expect(createAssetSchema.safeParse({ ...base, description: "A" }).success).toBe(false);
    expect(createAssetSchema.safeParse({ ...base, description: "AB" }).success).toBe(true);
  });

  it("aceita qualquer uma das 8 categorias da Fase 2", () => {
    const categories = [
      "ATIVOS_AGRO",
      "CONTA_CORRENTE",
      "CREDITO",
      "DINHEIRO_ESPECIE",
      "INVESTIMENTOS",
      "OUTROS",
      "SEMOVENTES",
      "VEICULO_EMBARCACAO_AERONAVE",
    ] as const;
    for (const category of categories) {
      expect(createAssetSchema.safeParse({ ...base, category }).success).toBe(true);
    }
  });
});

describe("updateAssetSchema", () => {
  it("exige assetId e os mesmos campos do create", () => {
    const parsed = updateAssetSchema.safeParse({ ...base, assetId: "ativo-1" });
    expect(parsed.success).toBe(true);
    expect(updateAssetSchema.safeParse(base).success).toBe(false);
  });

  it("herda as regras de valor e responsável", () => {
    expect(
      updateAssetSchema.safeParse({ ...base, assetId: "a1", declaredValue: 0 }).success
    ).toBe(false);
    const { ownerPersonId: _owner, ...withoutOwner } = base;
    expect(
      updateAssetSchema.safeParse({ ...withoutOwner, assetId: "a1" }).success
    ).toBe(false);
  });
});
