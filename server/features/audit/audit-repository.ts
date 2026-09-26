import { auditLogs } from "../../../drizzle/schema";
import { createId } from "../_shared/ids";
import { requireDatabase } from "../_shared/database";

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
