/**
 * @description Cobre os alertas da Fase 9: nível por certidão (vermelho
 * positiva/somente física, amarelo pendente/vencida), contagem por assunto e
 * o gate de conclusão (gravame Pendente sempre bloqueia; certidão vermelha
 * bloqueia sem justificativa).
 * @see server/features/alerts/project-alerts.ts
 */
import { describe, expect, it } from "vitest";
import {
  certidaoAlertLevel,
  computeAlertCounts,
  computeConclusionBlockers,
  computeSubjectAlerts,
  maxAlertLevel,
  subjectAlertKey,
} from "./project-alerts";

const today = new Date("2026-06-15T12:00:00Z");

describe("certidaoAlertLevel", () => {
  it("marca positiva e somente física em vermelho", () => {
    expect(certidaoAlertLevel("POSITIVA", null, today)).toBe("VERMELHO");
    expect(certidaoAlertLevel("SOMENTE_FISICA", null, today)).toBe("VERMELHO");
  });

  it("marca pendente em amarelo", () => {
    expect(certidaoAlertLevel("PENDENTE", null, today)).toBe("AMARELO");
  });

  it("marca vencida em amarelo mesmo quando negativa", () => {
    expect(certidaoAlertLevel("NEGATIVA", "2026-01-01", today)).toBe(
      "AMARELO"
    );
  });

  it("não alerta negativa nem positiva com efeitos de negativa vigente", () => {
    expect(certidaoAlertLevel("NEGATIVA", "2026-12-31", today)).toBe("NENHUM");
    expect(certidaoAlertLevel("POSITIVA_COM_EFEITOS_DE_NEGATIVA", null, today)).toBe(
      "NENHUM"
    );
    expect(certidaoAlertLevel("NEGATIVA", "2026-06-15", today)).toBe("NENHUM");
  });
});

describe("computeSubjectAlerts e contagem", () => {
  it("agrupa por assunto com precedência de vermelho sobre amarelo", () => {
    const bySubject = computeSubjectAlerts(
      [
        { scope: "PESSOA", subjectId: "p1", status: "PENDENTE" },
        { scope: "PESSOA", subjectId: "p1", status: "POSITIVA" },
        { scope: "SOCIEDADE", subjectId: "s1", status: "PENDENTE" },
        { scope: "PESSOA", subjectId: "p2", status: "NEGATIVA" },
      ],
      today
    );
    expect(bySubject).toEqual({
      "PESSOA:p1": "VERMELHO",
      "SOCIEDADE:s1": "AMARELO",
    });
  });

  it("conta assuntos vermelhos e amarelos", () => {
    expect(
      computeAlertCounts(
        [
          { scope: "PESSOA", subjectId: "p1", status: "POSITIVA" },
          { scope: "PESSOA", subjectId: "p2", status: "SOMENTE_FISICA" },
          { scope: "SOCIEDADE", subjectId: "s1", status: "PENDENTE" },
          { scope: "PESSOA", subjectId: "p3", status: "NEGATIVA" },
        ],
        today
      )
    ).toEqual({ vermelho: 2, amarelo: 1 });
  });

  it("expõe a chave do assunto e o nível máximo", () => {
    expect(subjectAlertKey("PESSOA", "p1")).toBe("PESSOA:p1");
    expect(maxAlertLevel("AMARELO", "VERMELHO")).toBe("VERMELHO");
    expect(maxAlertLevel(undefined, "AMARELO")).toBe("AMARELO");
    expect(maxAlertLevel(null, undefined)).toBe("NENHUM");
  });
});

describe("computeConclusionBlockers", () => {
  const redCertidao = {
    scope: "PESSOA" as const,
    subjectId: "p1",
    type: "CND_FEDERAL",
    status: "POSITIVA",
    validUntil: null,
    subjectName: "Ana Silva",
  };

  it("bloqueia imóvel com gravame Pendente mesmo com justificativa", () => {
    const result = computeConclusionBlockers({
      certidoes: [],
      properties: [
        { id: "im1", description: "Casa de campo", encumbranceType: "PENDENTE" },
        { id: "im2", description: "Apartamento", encumbranceType: "NAO_HA" },
        { id: "im3", description: "Sítio", encumbranceType: "HIPOTECA" },
      ],
      justification: "só um teste",
      today,
    });
    expect(result.hardBlockers).toHaveLength(1);
    expect(result.hardBlockers[0]).toContain("Casa de campo");
    expect(result.hardBlockers[0]).toContain("gravame Pendente");
    expect(result.blockers).toEqual(result.hardBlockers);
  });

  it("exige justificativa para certidão em vermelho", () => {
    const semJustificativa = computeConclusionBlockers({
      certidoes: [redCertidao],
      properties: [],
      today,
    });
    expect(semJustificativa.redCertidoes).toEqual(["CND Federal de Ana Silva"]);
    expect(semJustificativa.blockers).toHaveLength(1);
    expect(semJustificativa.blockers[0]).toContain(
      "Certidão em vermelho sem justificativa registrada"
    );
    expect(semJustificativa.blockers[0]).toContain("CND Federal de Ana Silva");

    const comJustificativa = computeConclusionBlockers({
      certidoes: [redCertidao],
      properties: [],
      justification: "  certidão positiva já avaliada  ",
      today,
    });
    expect(comJustificativa.blockers).toHaveLength(0);
    expect(comJustificativa.redCertidoes).toHaveLength(1);
  });

  it("não bloqueia projeto sem gravame pendente e sem certidão vermelha", () => {
    const result = computeConclusionBlockers({
      certidoes: [
        { scope: "PESSOA", subjectId: "p1", status: "NEGATIVA", validUntil: null },
        { scope: "SOCIEDADE", subjectId: "s1", status: "PENDENTE", validUntil: null },
      ],
      properties: [{ id: "im1", description: "Casa", encumbranceType: "HIPOTECA" }],
      today,
    });
    expect(result).toEqual({
      blockers: [],
      hardBlockers: [],
      redCertidoes: [],
    });
  });
});
