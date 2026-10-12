import { createHash } from "node:crypto";
import { and, eq, isNull, gt } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "../../_core/rateLimit";
import { publicProcedure, router } from "../../_core/trpc";
import { createUser, getUserByEmail } from "../../db";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { familyAccess, firstAccessLinks, type User, users } from "../../../drizzle/schema";
import { getPersonRecord } from "./person-repository";
import { recordAudit, recordAuditSafe } from "../audit/audit-repository";
import { withAdvisoryLock, AdvisoryLockKey } from "../../_shared/advisory-lock";

const BCRYPT_ROUNDS = 12;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Uma conta pré-existente só pode receber a senha redefinida pelo link de
 * primeiro acesso se for do próprio titular (CLIENTE) e já vinculada a esta
 * família. Contas de equipe (SOCIO/ANALISTA/ADMIN) ou clientes de outras
 * famílias são recusadas — evita takeover de conta por e-mail coincidente.
 */
async function assertExistingClientUsable(
  db: any,
  existing: User,
  familyId: string
): Promise<number> {
  if (existing.role !== "CLIENTE") {
    throw new Error("Já existe uma conta de equipe com este e-mail. Use a redefinição de senha para acessá-la.");
  }
  const linked = await db
    .select({ id: familyAccess.id })
    .from(familyAccess)
    .where(and(eq(familyAccess.userId, existing.id), eq(familyAccess.familyId, familyId)))
    .limit(1);
  if (!linked[0]) {
    throw new Error("Já existe uma conta com este e-mail sem vínculo com esta família. Contate o sócio responsável.");
  }
  return existing.id;
}

export const firstAccessRouter = router({
  verifyToken: publicProcedure
    .input(z.object({ token: z.string().min(16) }))
    .query(async ({ input }) => {
      checkRateLimit(`verify:${input.token}`);
      const db = await requireDatabase();
      const [link] = await db
        .select()
        .from(firstAccessLinks)
        .where(
          and(
            eq(firstAccessLinks.tokenHash, hashToken(input.token)),
            isNull(firstAccessLinks.consumedAt),
            gt(firstAccessLinks.expiresAt, new Date())
          )
        )
        .limit(1);
      if (!link) throw new Error("Link inválido, expirado ou já utilizado.");
      const person = await getPersonRecord(link.personId);
      if (!person) throw new Error("Pessoa não encontrada.");
      return {
        personId: person.id,
        fullName: person.fullName,
        email: person.email ?? null,
      };
    }),

  setPassword: publicProcedure
    .input(z.object({ token: z.string().min(16), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      checkRateLimit(`setpwd:${input.token}`);

      return withAdvisoryLock(
        requireDatabase(),
        "FIRST_ACCESS",
        input.token, // discriminator: token único por link
        async (tx) => {
          const [link] = await tx
            .select()
            .from(firstAccessLinks)
            .where(
              and(
                eq(firstAccessLinks.tokenHash, hashToken(input.token)),
                isNull(firstAccessLinks.consumedAt),
                gt(firstAccessLinks.expiresAt, new Date())
              )
            )
            .limit(1);
          if (!link) throw new Error("Link inválido, expirado ou já utilizado.");

          const person = await getPersonRecord(link.personId);
          if (!person) throw new Error("Pessoa não encontrada.");
          if (!person.email) throw new Error("Pessoa sem e-mail cadastrado. Contate o sócio.");

          let userId: number;
          const existing = await getUserByEmail(person.email);
          if (existing) {
            userId = await assertExistingClientUsable(tx, existing, person.familyId);
            const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
            await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
          } else {
            const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
            try {
              const created = await createUser({
                name: person.fullName ?? undefined,
                email: person.email,
                passwordHash,
                role: "CLIENTE",
                lastSignedIn: new Date(),
              });
              userId = created.id;
            } catch (error) {
              // Corrida: outra requisição criou a conta entre o check e o insert.
              // Reconsulta o e-mail; se for CLIENTE, reutiliza. Se for equipe, recusa.
              const raced = await getUserByEmail(person.email);
              if (!raced) throw error;
              if (raced.role !== "CLIENTE") {
                throw new Error("Já existe uma conta de equipe com este e-mail. Use a redefinição de senha para acessá-la.");
              }
              userId = raced.id;
            }
          }

          await tx
            .insert(familyAccess)
            .values({
              id: createId(),
              familyId: person.familyId,
              userId,
              accessRole: "CLIENTE",
            })
            .onConflictDoNothing();
          await tx
            .update(firstAccessLinks)
            .set({ consumedAt: new Date() })
            .where(eq(firstAccessLinks.id, link.id));

          await recordAuditSafe({
            action: "PRIMEIRO_ACESSO_SENHA_DEFINIDA",
            entityType: "USUARIO",
            entityId: String(userId),
            actorUserId: userId,
            familyId: person.familyId,
            metadata: { personId: person.id, tokenHash: hashToken(input.token) },
          });

          return { success: true };
        }
      );
    }),
});
