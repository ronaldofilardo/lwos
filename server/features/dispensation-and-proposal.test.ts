import { describe, expect, it } from "vitest";
import { dispenseDocumentSchema } from "./documents/document-types";
import { propertyInputSchema } from "./properties/property-types";
import {
  acceptProposalSchema,
  counterProposalSchema,
  createProposalSchema,
  reviewCounterProposalSchema,
} from "./proposals/proposal-types";
import { createAssetSchema } from "./assets/assets-types";

describe("Regras de Negócio e Validações Jurídicas (LWOS)", () => {
  describe("Dispensa Documental Formalizada", () => {
    it("deve rejeitar dispensa com justificativa vazia ou menor que 3 caracteres", () => {
      const result = dispenseDocumentSchema.safeParse({
        documentId: "doc-123",
        reason: "  ",
      });
      expect(result.success).toBe(false);
    });

    it("deve aceitar dispensa com justificativa jurídica/prática válida", () => {
      const result = dispenseDocumentSchema.safeParse({
        documentId: "doc-123",
        reason: "Empresa inativa sem faturamento há mais de 5 anos; balanço dispensado por ata.",
        requestedBy: "usr-analista-1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toContain("Empresa inativa");
      }
    });
  });

  describe("Imóveis sem Matrícula (Construção / Posse)", () => {
    it("deve exigir documento alternativo e justificativa quando hasRegistration for false", () => {
      const invalid = propertyInputSchema.safeParse({
        familyId: "fam-1",
        description: "Apartamento na Planta Edifício Horizon",
        propertyCity: "São Paulo",
        hasRegistration: false,
      });
      expect(invalid.success).toBe(false);
    });

    it("deve aceitar imóvel sem matrícula se informada Escritura Pública e justificativa", () => {
      const valid = propertyInputSchema.safeParse({
        familyId: "fam-1",
        description: "Apartamento na Planta Edifício Horizon",
        propertyCity: "São Paulo",
        hasRegistration: false,
        alternativeDocType: "ESCRITURA_PUBLICA",
        noRegistrationReason: "Empreendimento em fase de habite-se; matrícula individualizada em trâmite no 4º RGI.",
      });
      expect(valid.success).toBe(true);
    });

    it("deve aceitar imóvel sem matrícula com Contrato de Compra e Venda", () => {
      const valid = propertyInputSchema.safeParse({
        familyId: "fam-1",
        description: "Lote em Condomínio Fechado",
        propertyCity: "Campinas",
        hasRegistration: false,
        alternativeDocType: "CONTRATO_COMPRA_VENDA",
        noRegistrationReason: "Loteamento em regularização registral.",
      });
      expect(valid.success).toBe(true);
    });

    it("deve aceitar imóvel normal com matrícula", () => {
      const valid = propertyInputSchema.safeParse({
        familyId: "fam-1",
        description: "Casa Residencial Morumbi",
        propertyCity: "São Paulo",
        hasRegistration: true,
        registrationNumber: "123.456",
        registryOffice: "11º Oficial de Registro de Imóveis",
      });
      expect(valid.success).toBe(true);
    });
  });

  describe("Proposta Financeira Autônoma & Contraproposta", () => {
    it("deve exigir escopo com ao menos 10 caracteres e valor positivo", () => {
      const invalid = createProposalSchema.safeParse({
        familyId: "fam-1",
        scopeDescription: "Curto",
        proposedValue: -500,
      });
      expect(invalid.success).toBe(false);

      const valid = createProposalSchema.safeParse({
        familyId: "fam-1",
        scopeDescription: "Planejamento sucessório completo, estruturação da holding e acordo de sócios.",
        proposedValue: 45000,
      });
      expect(valid.success).toBe(true);
    });

    it("deve validar aceite de proposta", () => {
      const valid = acceptProposalSchema.safeParse({
        proposalId: "prop-10",
        clientNotes: "Aceito as condições conforme reunião.",
      });
      expect(valid.success).toBe(true);
    });

    it("deve validar formulário de contraproposta com valor e justificativa", () => {
      const valid = counterProposalSchema.safeParse({
        proposalId: "prop-10",
        counterProposalValue: 38000,
        counterProposalNotes: "Solicito parcelamento em 4x sem juros e adequação do valor.",
      });
      expect(valid.success).toBe(true);
    });

    it("deve validar decisão de deliberação do Sócio", () => {
      const valid = reviewCounterProposalSchema.safeParse({
        proposalId: "prop-10",
        decision: "ACEITAR",
        notes: "Contraproposta aprovada pela diretoria.",
      });
      expect(valid.success).toBe(true);
    });
  });

  describe("Demais Ativos (Due Diligence)", () => {
    it("deve validar cadastro de investimentos, veículos e participações", () => {
      const valid = createAssetSchema.safeParse({
        familyId: "fam-1",
        category: "INVESTIMENTO",
        description: "Carteira de CDBs e Tesouro Direto - XP",
        declaredValue: 1200000,
        marketValue: 1250000,
      });
      expect(valid.success).toBe(true);
    });
  });
});
