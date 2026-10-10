/**
 * Teste de ponta a ponta (Fase 10) — percorre o appRouter real contra o
 * banco local: projeto com 2 objetivos, titular, cônjuge, filho menor,
 * imóveis urbano e rural, sociedades LTDA e offshore, ativo, certidões
 * positiva/somente física/pendente, alertas, trava de gravame e gate de
 * conclusão. Limpa todos os dados no final.
 *
 * Uso: pnpm exec tsx scripts/e2e-full-project.ts
 */
import "dotenv/config";
import { Client } from "pg";
import { appRouter } from "../server/routers";
import { requireDatabase } from "../server/features/_shared/database";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { isCpfValido } from "../shared/validation/cpf";
import { isCnpjValido } from "../shared/validation/cnpj";

const CPF_TITULAR = "529.982.247-25";
const CPF_CONJUGE = "111.444.777-35";
const CPF_FILHO = "12345678909";
const CNPJ_LTDA = "11.222.333/0001-81";

let passed = 0;
let failed = 0;

function ok(label: string) {
  passed += 1;
  console.log(`  ok  ${label}`);
}
function ko(label: string, detail: string) {
  failed += 1;
  console.log(`FAIL  ${label}\n      -> ${detail}`);
}
function assert(cond: unknown, label: string, detail = "") {
  if (cond) ok(label);
  else ko(label, detail || "condição falsa");
}
function messageOf(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as { cause?: unknown }).cause;
    const causeMsg =
      cause instanceof Error ? ` | causa: ${cause.message}` : "";
    return `${error.message}${causeMsg}`;
  }
  return String(error);
}
async function expectError(
  run: () => Promise<unknown>,
  label: string,
  contains: string
) {
  try {
    await run();
    ko(label, "esperava erro e a operação passou");
  } catch (error) {
    const message = messageOf(error);
    if (message.toLowerCase().includes(contains.toLowerCase())) {
      ok(`${label} [${message.slice(0, 90)}]`);
    } else {
      ko(label, `mensagem não contém «${contains}» — veio: ${message}`);
    }
  }
}

async function main() {
  // --- dados de teste válidos no núcleo da Fase 1 -------------------------
  assert(isCpfValido(CPF_TITULAR), "CPF de teste do titular é válido no núcleo");
  assert(isCnpjValido(CNPJ_LTDA), "CNPJ de teste da LTDA é válido no núcleo");

  const db = await requireDatabase();
  if (!db) throw new Error("Banco indisponível.");

  const dbClient = new Client({ connectionString: process.env.DATABASE_URL });
  await dbClient.connect();

  // Usuário SOCIO real (TEAM_ROLES não inclui ADMIN).
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.role, "SOCIO"))
    .limit(1);
  const socio = userRows[0];
  if (!socio) throw new Error("Nenhum usuário SOCIO no banco (rode o seed).");
  console.log(`Usuário: ${socio.email} (${socio.role})\n`);

  const caller = appRouter.createCaller({
    req: {} as never,
    res: {} as never,
    user: socio,
  });

  let familyId = "";
  try {
    // --- 1. projeto com 2 objetivos --------------------------------------
    const created = await caller.families.create({
      name: "E2E - Projeto Completo",
      objectives: ["PROTECAO_PATRIMONIAL", "GOVERNANCA_FAMILIAR_OU_SOCIETARIA"],
    });
    familyId = created.familyId;
    assert(Boolean(familyId), "projeto criado com 2 objetivos");

    const family = await caller.families.get({ familyId });
    assert(
      Array.isArray(family?.objectives) && family.objectives.length === 2,
      "família.get devolve os 2 objetivos"
    );

    // --- 2. família: titular, cônjuge e filho menor -----------------------
    const titular = await caller.people.create({
      familyId,
      fullName: "Titular E2E da Silva",
      email: "titular.e2e@example.com",
      phone: "11987654321",
      taxId: CPF_TITULAR,
      birthDate: "1980-05-20",
      vinculo: "TITULAR",
      civilStatus: "CASADO",
      maritalRegime: "CPB",
      spouseName: "Conjuge E2E da Silva",
      addressSameAsPrimary: true,
    });
    assert(Boolean(titular.personId), "titular criado");

    const conjuge = await caller.people.create({
      familyId,
      fullName: "Conjuge E2E da Silva",
      email: "conjuge.e2e@example.com",
      phone: "11912345678",
      taxId: CPF_CONJUGE,
      birthDate: "1982-08-15",
      vinculo: "CONJUGE",
      civilStatus: "CASADO",
      maritalRegime: "CPB",
      spouseName: "Titular E2E da Silva",
      addressSameAsPrimary: true,
    });
    assert(Boolean(conjuge.personId), "cônjuge criado");

    const filho = await caller.people.create({
      familyId,
      fullName: "Filho Menor E2E da Silva",
      taxId: CPF_FILHO,
      birthDate: "2015-06-01",
      vinculo: "FILHO",
      parentPersonId: titular.personId,
      addressSameAsPrimary: true,
    });
    assert(Boolean(filho.personId), "filho menor criado");

    await expectError(
      () =>
        caller.people.create({
          familyId,
          fullName: "Segundo Conjuge E2E",
          taxId: "39053344705",
          birthDate: "1985-01-01",
          vinculo: "CONJUGE",
          civilStatus: "CASADO",
          maritalRegime: "CPB",
          spouseName: "Titular E2E da Silva",
          addressSameAsPrimary: true,
        }),
      "cônjuge único (segundo cônjuge recusado)",
      "njuge"
    );
    await expectError(
      () =>
        caller.people.create({
          familyId,
          fullName: "Menor Casado E2E",
          taxId: "93541134780",
          birthDate: "2016-03-10",
          vinculo: "FILHO",
          parentPersonId: titular.personId,
          civilStatus: "CASADO",
          addressSameAsPrimary: true,
        }),
      "menor sempre solteiro (CASADO recusado)",
      "solteiro"
    );
    await expectError(
      () =>
        caller.people.create({
          familyId,
          fullName: "CPF Invalido E2E",
          taxId: "111.111.111-11",
          birthDate: "1990-01-01",
          vinculo: "FILHO",
          parentPersonId: titular.personId,
          addressSameAsPrimary: true,
        }),
      "CPF inválido recusado (núcleo Fase 1)",
      "CPF inv"
    );

    // --- 3. imóveis urbano e rural ---------------------------------------
    const urbano = await caller.properties.create({
      familyId,
      description: "Casa urbana E2E",
      kind: "URBANO",
      uf: "SP",
      propertyCity: "Sao Paulo",
      declaredValue: 900000,
      marketValue: 1000000,
    });
    assert(Boolean(urbano.propertyId), "imóvel urbano criado");

    const urbanoRow = await dbClient.query(
      `SELECT "encumbranceType" FROM properties WHERE id = $1`,
      [urbano.propertyId]
    );
    assert(
      urbanoRow.rows[0]?.encumbranceType === "PENDENTE",
      "gravame nasce PENDENTE",
      `veio: ${urbanoRow.rows[0]?.encumbranceType}`
    );

    const rural = await caller.properties.create({
      familyId,
      description: "Fazenda E2E",
      kind: "RURAL",
      uf: "SP",
      propertyCity: "Ribeirao Preto",
      ccir: "1234567890123",
      nirf: "1234567890123",
      encumbranceType: "NAO_HA",
      declaredValue: 5000000,
    });
    assert(Boolean(rural.propertyId), "imóvel rural criado (CCIR + NIRF)");

    const ownerRural = await caller.properties.addOwner({
      propertyId: rural.propertyId,
      personId: titular.personId,
      ownershipPercentage: 100,
      rightType: "PROPRIEDADE",
    });
    assert(Boolean(ownerRural.ownerId), "titularidade rural 100% registrada");

    // PENDENTE não trava movimentação (só o vermelho trava).
    const ownerUrbano = await caller.properties.addOwner({
      propertyId: urbano.propertyId,
      personId: conjuge.personId,
      ownershipPercentage: 40,
      rightType: "PROPRIEDADE",
    });
    assert(
      Boolean(ownerUrbano.ownerId),
      "gravame PENDENTE não bloqueia movimentação (só o vermelho)"
    );

    // --- 4. sociedades LTDA e offshore + 100% -----------------------------
    const ltda = await caller.companies.create({
      familyId,
      legalName: "Holding E2E Participacoes LTDA",
      taxNumber: CNPJ_LTDA,
    });
    assert(Boolean(ltda.companyId), "sociedade LTDA criada (CNPJ com DV)");

    const offshore = await caller.companies.create({
      familyId,
      legalName: "Offshore E2E Holdings Ltd",
      isOffshore: true,
    });
    assert(Boolean(offshore.companyId), "sociedade offshore criada sem CNPJ");

    await caller.companies.addStakeholder({
      companyId: ltda.companyId,
      personId: titular.personId,
      percentage: 100,
    });
    ok("participação de 100% registrada");
    await expectError(
      () =>
        caller.companies.addStakeholder({
          companyId: ltda.companyId,
          externalName: "Socio Externo E2E",
          percentage: 1,
        }),
      "soma de participações acima de 100% recusada",
      "100%"
    );
    await expectError(
      () =>
        caller.companies.create({
          familyId,
          legalName: "CNPJ Errado E2E LTDA",
          taxNumber: "12345678000100",
        }),
      "CNPJ inválido recusado (núcleo Fase 1)",
      "CNPJ inv"
    );
    await expectError(
      () =>
        caller.companies.create({
          familyId,
          legalName: "Offshore Com CNPJ E2E",
          isOffshore: true,
          taxNumber: CNPJ_LTDA,
        }),
      "offshore com CNPJ recusada",
      "offshore"
    );

    // --- 5. ativo ---------------------------------------------------------
    const ativo = await caller.assets.create({
      familyId,
      category: "INVESTIMENTOS",
      description: "CDB E2E",
      declaredValue: 50000,
      ownerPersonId: titular.personId,
    });
    assert(Boolean(ativo.assetId), "ativo criado");
    await expectError(
      () =>
        caller.assets.create({
          familyId,
          category: "INVESTIMENTOS",
          description: "Ativo Zerado E2E",
          declaredValue: 0,
          ownerPersonId: titular.personId,
        }),
      "ativo com valor 0 recusado",
      "valor declarado"
    );

    // --- 6. certidões e alertas ------------------------------------------
    const geradas = await caller.certidoes.generate({ familyId });
    assert(
      geradas.created === 0,
      "backfill familiar idempotente: membros já nascem com as 8 certidões",
      `criou ${geradas.created}`
    );

    const certidoes = await caller.certidoes.list({ familyId });
    const pick = (scope: string, subjectId: string) =>
      certidoes.find(c => c.scope === scope && c.subjectId === subjectId);

    const certTitular = pick("PESSOA", titular.personId);
    const certConjuge = pick("PESSOA", conjuge.personId);
    const certFilho = pick("PESSOA", filho.personId);
    const certLtda = pick("SOCIEDADE", ltda.companyId);
    assert(
      Boolean(certTitular && certConjuge && certFilho && certLtda),
      "certidões criadas para titular, cônjuge, filho e LTDA (offshore fica de fora)",
      `titular=${Boolean(certTitular)} conjuge=${Boolean(certConjuge)} filho=${Boolean(certFilho)} ltda=${Boolean(certLtda)} offshore=${Boolean(pick("SOCIEDADE", offshore.companyId))}`
    );

    if (certTitular)
      await caller.certidoes.updateStatus({
        certidaoId: certTitular.id,
        status: "POSITIVA",
      });
    if (certConjuge)
      await caller.certidoes.updateStatus({
        certidaoId: certConjuge.id,
        status: "POSITIVA_COM_EFEITOS_DE_NEGATIVA",
      });
    if (certFilho)
      await caller.certidoes.updateStatus({
        certidaoId: certFilho.id,
        status: "SOMENTE_FISICA",
      });
    ok("status das certidões atualizados");

    const summary = await caller.certidoes.summary({ familyId });
    const levelOf = (key: string) => summary.bySubject[key];
    assert(
      levelOf(`PESSOA:${titular.personId}`) === "VERMELHO",
      "titular POSITIVA → alerta VERMELHO",
      `veio: ${levelOf(`PESSOA:${titular.personId}`)}`
    );
    assert(
      levelOf(`PESSOA:${conjuge.personId}`) !== "VERMELHO",
      "POSITIVA_COM_EFEITOS_DE_NEGATIVA → sem alerta vermelho",
      `veio: ${levelOf(`PESSOA:${conjuge.personId}`)}`
    );
    assert(
      levelOf(`PESSOA:${filho.personId}`) === "VERMELHO",
      "SOMENTE_FISICA → alerta VERMELHO",
      `veio: ${levelOf(`PESSOA:${filho.personId}`)}`
    );
    assert(
      levelOf(`SOCIEDADE:${ltda.companyId}`) === "AMARELO",
      "certidão da LTDA pendente → alerta AMARELO",
      `veio: ${levelOf(`SOCIEDADE:${ltda.companyId}`)}`
    );
    assert(
      levelOf(`SOCIEDADE:${offshore.companyId}`) === undefined,
      "offshore sem certidão → sem alerta",
      `veio: ${levelOf(`SOCIEDADE:${offshore.companyId}`)}`
    );
    assert(
      summary.counts.vermelho >= 2 && summary.counts.amarelo >= 1,
      `contagem de alertas (vermelho=${summary.counts.vermelho}, amarelo=${summary.counts.amarelo})`
    );

    const lista = await caller.families.list();
    const daLista = lista.find(f => f.id === familyId);
    assert(
      daLista?.alerts === "VERMELHO",
      "lista de projetos anexa o alerta do projeto",
      `veio: ${daLista?.alerts}`
    );

    // --- 7. gate de conclusão --------------------------------------------
    await expectError(
      () => caller.families.updateStatus({ familyId, status: "CONCLUIDO" }),
      "gate bloqueia conclusão com gravame PENDENTE + certidão vermelha",
      "Pendente"
    );

    // Vira HIPOTECA (vermelho) → a trava de movimentação passa a valer.
    await caller.properties.update({
      propertyId: urbano.propertyId,
      description: "Casa urbana E2E",
      kind: "URBANO",
      uf: "SP",
      propertyCity: "Sao Paulo",
      declaredValue: 900000,
      marketValue: 1000000,
      encumbranceType: "HIPOTECA",
    });
    await expectError(
      () =>
        caller.properties.addOwner({
          propertyId: urbano.propertyId,
          personId: filho.personId,
          ownershipPercentage: 10,
          rightType: "PROPRIEDADE",
        }),
      "gravame vermelho (HIPOTECA) trava a titularidade",
      "gravame ativo"
    );
    await expectError(
      () =>
        caller.properties.updateOwner({
          propertyId: urbano.propertyId,
          ownerId: ownerUrbano.ownerId,
          ownershipPercentage: 60,
        }),
      "gravame vermelho trava a edição da titularidade",
      "gravame ativo"
    );

    // Gravame urbano deixa de ser PENDENTE → restam só as certidões vermelhas.
    await caller.properties.update({
      propertyId: urbano.propertyId,
      description: "Casa urbana E2E",
      kind: "URBANO",
      uf: "SP",
      propertyCity: "Sao Paulo",
      declaredValue: 900000,
      marketValue: 1000000,
      encumbranceType: "NAO_HA",
    });
    await expectError(
      () => caller.families.updateStatus({ familyId, status: "CONCLUIDO" }),
      "gate bloqueia conclusão com certidão vermelha sem justificativa",
      "CND Federal"
    );

    const concluido = await caller.families.updateStatus({
      familyId,
      status: "CONCLUIDO",
      justification: "Certidão positiva avaliada pela sócia — risco aceito.",
    });
    assert(
      concluido.status === "CONCLUIDO",
      "conclusão liberada com justificativa registrada"
    );
    const depois = await caller.families.get({ familyId });
    assert(
      depois?.status === "CONCLUIDO",
      "família.get reflete o status CONCLUIDO",
      `veio: ${depois?.status}`
    );

    // Checklist final (aceite da Fase 10).
    console.log("\nChecklist de aceite:");
    console.log("  [x] Nenhum CPF/CNPJ inválido é aceito");
    console.log("  [x] Nenhuma soma de participação passa de 100%");
    console.log("  [x] Cônjuge único e menor sempre solteiro");
    console.log("  [x] Gravame nasce Pendente; só o vermelho trava");
    console.log("  [x] Alertas refletem certidões positivas/somente físicas");
    console.log("  [x] Projeto não conclui com gravame pendente");
  } finally {
    // --- limpeza (o schema não tem FKs — apaga na ordem das dependências) --
    if (familyId) {
      const cleanup = [
        `DELETE FROM "documentVersions" WHERE "documentId" IN (SELECT id FROM documents WHERE "familyId" = $1)`,
        `DELETE FROM "documents" WHERE "familyId" = $1`,
        `DELETE FROM "certidoes" WHERE "familyId" = $1`,
        `DELETE FROM "propertyOwners" WHERE "propertyId" IN (SELECT id FROM properties WHERE "familyId" = $1)`,
        `DELETE FROM "properties" WHERE "familyId" = $1`,
        `DELETE FROM "companyStakeholders" WHERE "companyId" IN (SELECT id FROM companies WHERE "familyId" = $1)`,
        `DELETE FROM "companyDetails" WHERE "companyId" IN (SELECT id FROM companies WHERE "familyId" = $1)`,
        `DELETE FROM "companies" WHERE "familyId" = $1`,
        `DELETE FROM "otherAssets" WHERE "familyId" = $1`,
        `DELETE FROM "people" WHERE "familyId" = $1`,
        `DELETE FROM "projectObjectives" WHERE "projectId" IN (SELECT id FROM projects WHERE "familyId" = $1)`,
        `DELETE FROM "projects" WHERE "familyId" = $1`,
        `DELETE FROM "familyAccess" WHERE "familyId" = $1`,
        `DELETE FROM "firstAccessLinks" WHERE "familyId" = $1`,
        `DELETE FROM "lwrReports" WHERE "familyId" = $1`,
        `DELETE FROM "financialProposals" WHERE "familyId" = $1`,
        `DELETE FROM "portalLinks" WHERE "familyId" = $1`,
        `DELETE FROM "auditLogs" WHERE "familyId" = $1`,
        `DELETE FROM "families" WHERE id = $1`,
      ];
      for (const sql of cleanup) {
        try {
          await dbClient.query(sql, [familyId]);
        } catch (error) {
          ko(`limpeza: ${sql.slice(0, 40)}`, messageOf(error));
        }
      }
      console.log("\nDados do E2E removidos do banco.");
    }
    await dbClient.end();
  }

  console.log(`\nResultado: ${passed} ok, ${failed} falha(s).`);
  if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error("E2E falhou:", messageOf(error));
  process.exit(1);
});
