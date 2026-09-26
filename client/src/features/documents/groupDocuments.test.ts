/**
 * @description Agrupa a matriz documental por membro do caso (pessoa, família,
 * imóvel ou sociedade) para a aba Visão Unificada e Matriz Documental.
 * @see client/src/features/documents/DocumentPanel.tsx
 */
import { describe, expect, it } from "vitest";
import {
  buildDocumentSections,
  groupDocumentsByMember,
  type DocumentRow,
} from "./groupDocuments";

const doc = (
  partial: Partial<DocumentRow> &
    Pick<DocumentRow, "id" | "entityType" | "entityId">
): DocumentRow => ({
  familyId: "f1",
  category: "CPF/RG ou CNH",
  status: "PENDENTE",
  currentVersion: 0,
  rejectionReason: null,
  dispensationReason: null,
  dispensedAt: null,
  validUntil: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  ...partial,
});

describe("groupDocumentsByMember", () => {
  it("agrupa documentos da mesma pessoa em um bloco com nome e vínculo", () => {
    const groups = groupDocumentsByMember(
      [
        doc({
          id: "d1",
          entityType: "PESSOA",
          entityId: "p1",
          category: "IRPF",
        }),
        doc({
          id: "d2",
          entityType: "PESSOA",
          entityId: "p1",
          category: "CPF/RG ou CNH",
        }),
        doc({
          id: "d3",
          entityType: "PESSOA",
          entityId: "p2",
          category: "IRPF",
        }),
      ],
      {
        familyName: "Família Silva",
        people: [
          { id: "p1", fullName: "Ana Silva", vinculo: "TITULAR" },
          { id: "p2", fullName: "Bruno Silva", vinculo: "FILHO" },
        ],
        properties: [],
        companies: [],
      }
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].title).toBe("Ana Silva");
    expect(groups[0].subtitle).toBe("Titular");
    expect(groups[0].documents).toHaveLength(2);
    expect(groups[1].title).toBe("Bruno Silva");
    expect(groups[1].subtitle).toBe("Filho(a)");
  });

  it("ordena titular antes de filhos e netos", () => {
    const groups = groupDocumentsByMember(
      [
        doc({
          id: "d1",
          entityType: "PESSOA",
          entityId: "neto",
          category: "IRPF",
        }),
        doc({
          id: "d2",
          entityType: "PESSOA",
          entityId: "filho",
          category: "IRPF",
        }),
        doc({
          id: "d3",
          entityType: "PESSOA",
          entityId: "titular",
          category: "IRPF",
        }),
      ],
      {
        familyName: null,
        people: [
          {
            id: "neto",
            fullName: "Neto",
            vinculo: "NETO",
            parentPersonId: "filho",
          },
          { id: "filho", fullName: "Filho", vinculo: "FILHO" },
          { id: "titular", fullName: "Titular", vinculo: "TITULAR" },
        ],
        properties: [],
        companies: [],
      }
    );

    expect(groups.map(g => g.title)).toEqual(["Titular", "Filho", "Neto"]);
    expect(groups[2].subtitle).toBe("Neto(a) · filho(a) de Filho");
  });

  it("resolve imóveis e sociedades e mantém família no topo", () => {
    const groups = groupDocumentsByMember(
      [
        doc({
          id: "d1",
          entityType: "IMOVEL",
          entityId: "im1",
          category: "Matrícula",
        }),
        doc({
          id: "d2",
          entityType: "SOCIEDADE",
          entityId: "soc1",
          category: "Contrato social",
        }),
        doc({
          id: "d3",
          entityType: "FAMILIA",
          entityId: "f1",
          category: "Comprovante de endereço",
        }),
      ],
      {
        familyName: "Família Costa",
        people: [],
        properties: [{ id: "im1", description: "Apto Jardins" }],
        companies: [{ id: "soc1", legalName: "Costa Holding" }],
      }
    );

    expect(groups.map(g => g.title)).toEqual([
      "Família Costa",
      "Apto Jardins",
      "Costa Holding",
    ]);
    expect(groups[0].subtitle).toBe("Requisitos gerais do caso");
  });

  it("resolve ativos e usa o nome do ativo como título", () => {
    const groups = groupDocumentsByMember(
      [
        doc({
          id: "d1",
          entityType: "ATIVO",
          entityId: "a1",
          category: "Comprovação de titularidade",
        }),
      ],
      {
        familyName: null,
        people: [],
        properties: [],
        companies: [],
        assets: [{ id: "a1", description: "Cota de fundo XYZ" }],
      }
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Cota de fundo XYZ");
    expect(groups[0].entityType).toBe("ATIVO");
  });
});

describe("buildDocumentSections", () => {
  const ctx = {
    familyName: "Família Costa",
    people: [{ id: "p1", fullName: "Ana Costa", vinculo: "TITULAR" as const }],
    properties: [{ id: "im1", description: "Apto Jardins" }],
    companies: [{ id: "soc1", legalName: "Costa Holding" }],
    assets: [{ id: "at1", description: "Ações Itaú" }],
  };

  it("organiza as 4 seções na ordem Familiares, Imóveis, Sociedades e Ativos", () => {
    const groups = groupDocumentsByMember(
      [
        doc({ id: "d1", entityType: "FAMILIA", entityId: "f1" }),
        doc({ id: "d2", entityType: "PESSOA", entityId: "p1" }),
        doc({ id: "d3", entityType: "IMOVEL", entityId: "im1" }),
        doc({ id: "d4", entityType: "SOCIEDADE", entityId: "soc1" }),
        doc({ id: "d5", entityType: "ATIVO", entityId: "at1" }),
      ],
      ctx
    );

    const sections = buildDocumentSections(groups);

    expect(sections.map(section => section.key)).toEqual([
      "FAMILIARES",
      "IMOVEL",
      "SOCIEDADE",
      "ATIVO",
    ]);
    expect(sections[0].title).toBe("Familiares");
    expect(sections[0].groups.map(group => group.title)).toEqual([
      "Família Costa",
      "Ana Costa",
    ]);
    expect(sections[1].groups).toHaveLength(1);
    expect(sections[3].groups[0].title).toBe("Ações Itaú");
  });

  it("omite seções vazias", () => {
    const groups = groupDocumentsByMember(
      [doc({ id: "d1", entityType: "PESSOA", entityId: "p1" })],
      ctx
    );

    const sections = buildDocumentSections(groups);

    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe("FAMILIARES");
  });
});
