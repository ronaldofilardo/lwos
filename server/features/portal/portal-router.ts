import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { documents, families, lwrReports, portalLinks, projects } from "../../../drizzle/schema";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import { getDocumentRecord } from "../documents/document-repository";
import { storeDocumentVersion } from "../documents/document-upload";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getActivePortalLink(token: string) {
  const db = await requireDatabase();
  const result = await db.select().from(portalLinks).where(and(
    eq(portalLinks.tokenHash, hashToken(token)),
    isNull(portalLinks.revokedAt),
    gt(portalLinks.expiresAt, new Date()),
  )).limit(1);
  return result[0] ?? null;
}

export const portalRouter = router({
  createLink: protectedProcedure.input(z.object({ familyId: z.string(), origin: z.string().url() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const token = randomBytes(24).toString("base64url");
    const db = await requireDatabase();
    const linkId = createId();
    await db.insert(portalLinks).values({
      id: linkId, familyId: input.familyId, tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdBy: String(user.id),
    });
    await recordAudit({ action: "LINK_PORTAL_GERADO", entityType: "FAMILIA", entityId: input.familyId, actorUserId: user.id, familyId: input.familyId });
    return { id: linkId, url: `${input.origin}/portal/${token}`, expiresInDays: 7 };
  }),
  listLinks: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    return db.select({ id: portalLinks.id, expiresAt: portalLinks.expiresAt, revokedAt: portalLinks.revokedAt, createdAt: portalLinks.createdAt }).from(portalLinks).where(eq(portalLinks.familyId, input.familyId)).orderBy(desc(portalLinks.createdAt));
  }),
  revokeLink: protectedProcedure.input(z.object({ linkId: z.string() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]); const db = await requireDatabase();
    const [link] = await db.select().from(portalLinks).where(eq(portalLinks.id, input.linkId)).limit(1);
    if (!link) throw new Error("Link não encontrado.");
    await db.update(portalLinks).set({ revokedAt: new Date() }).where(eq(portalLinks.id, input.linkId));
    await recordAudit({ action: "LINK_PORTAL_REVOGADO", entityType: "FAMILIA", entityId: link.familyId, actorUserId: user.id, familyId: link.familyId });
    return { success: true };
  }),
  status: publicProcedure.input(z.object({ token: z.string().min(16) })).query(async ({ input }) => {
    const link = await getActivePortalLink(input.token);
    if (!link) throw new Error("Link inválido, revogado ou expirado.");
    const db = await requireDatabase();
    const [family] = await db.select().from(families).where(eq(families.id, link.familyId)).limit(1);
    const [project] = await db.select().from(projects).where(eq(projects.familyId, link.familyId)).limit(1);
    const documentList = await db.select().from(documents).where(eq(documents.familyId, link.familyId));
    const reports = await db.select().from(lwrReports).where(eq(lwrReports.familyId, link.familyId));
    return { family, project, documents: documentList, reports };
  }),
  uploadDocument: publicProcedure.input(z.object({ token: z.string().min(16), documentId: z.string(), fileName: z.string(), mimeType: z.string(), base64Data: z.string() })).mutation(async ({ input }) => {
    const link = await getActivePortalLink(input.token);
    if (!link) throw new Error("Link inválido, revogado ou expirado.");
    const document = await getDocumentRecord(input.documentId);
    if (!document || document.familyId !== link.familyId) throw new Error("Documento não autorizado.");
    const result = await storeDocumentVersion({ ...input, userId: 0 });
    await recordAudit({ action: "VERSAO_DOCUMENTO_ENVIADA_PORTAL", entityType: "DOCUMENTO", entityId: input.documentId, familyId: link.familyId, metadata: { version: result.versionNumber } });
    return result;
  }),
});
