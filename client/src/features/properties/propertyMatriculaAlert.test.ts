/**
 * @description "!" do imóvel reflete a entrega da matrícula (não certidões).
 * @see client/src/features/properties/propertyMatriculaAlert.ts
 */
import { describe, expect, it } from "vitest";
import { matriculaAlert } from "./propertyMatriculaAlert";

const doc = (status: string, category = "Matrícula atualizada", entityId = "im1") => ({
  entityType: "IMOVEL",
  entityId,
  category,
  status,
});

describe("matriculaAlert", () => {
  it("alerta amarelo quando a matrícula está pendente", () => {
    const result = matriculaAlert([doc("PENDENTE")], "im1");
    expect(result.level).toBe("AMARELO");
    expect(result.reasons[0]).toContain("não entregue");
  });

  it("alerta amarelo quando a matrícula foi rejeitada", () => {
    const result = matriculaAlert([doc("REJEITADO")], "im1");
    expect(result.level).toBe("AMARELO");
    expect(result.reasons[0]).toContain("rejeitada");
  });

  it.each(["RECEBIDO_EM_ANALISE", "VALIDADO", "DISPENSADO", "NAO_POSSUI"])(
    "sem alerta quando o status é %s",
    status => {
      expect(matriculaAlert([doc(status)], "im1").level).toBe("NENHUM");
    }
  );

  it("sem alerta quando não há requisito gerado para o imóvel", () => {
    expect(matriculaAlert([], "im1").level).toBe("NENHUM");
    expect(matriculaAlert([doc("PENDENTE", "Matrícula atualizada", "im2")], "im1").level).toBe("NENHUM");
  });

  it("ignora IPTU/ITR e usa a escritura quando não há matrícula", () => {
    expect(matriculaAlert([doc("PENDENTE", "IPTU")], "im1").level).toBe("NENHUM");
    const result = matriculaAlert(
      [doc("PENDENTE", "Escritura ou contrato de compra e venda")],
      "im1"
    );
    expect(result.level).toBe("AMARELO");
  });
});
