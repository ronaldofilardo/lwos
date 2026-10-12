import { auditLogs } from "../../../drizzle/schema";
import { createId } from "../_shared/ids";
import { requireDatabase } from "../_shared/database";
import { logError } from "../../lib/logger";

type AuditInput = {
  action: string;
  entityType: string;
  entityId: string;
  actorUserId?: number;
  familyId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function recordAudit(input: AuditInput) {
  const db = await requireDatabase();
  await db.insert(auditLogs).values({
    id: createId(),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    actorUserId: input.actorUserId?.toString(),
    familyId: input.familyId,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}

/**
 * Registra auditoria sem quebrar a operação principal.
 * Em caso de falha, loga o erro e continua silenciosamente.
 * Use quando a auditoria é secundária e não deve impedir o fluxo.
 */
export async function recordAuditSafe(input: AuditInput) {
  try {
    await recordAudit(input);
  } catch (error) {
    logError("audit.record_failed", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
