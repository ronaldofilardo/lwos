import { createHash } from "node:crypto";
import { and, eq, isNull, gt } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "../../_core/rateLimit";
import { publicProcedure, router } from "../../_core/trpc";
import { createUser, getUserByEmail } from "../../db";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { familyAccess, firstAccessLinks } from "../../../drizzle/schema";
import { getPersonRecord } from "./person-repository";

const BCRYPT_ROUNDS = 12;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
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
      if (!person.email)
        throw new Error("Pessoa sem e-mail cadastrado. Contate o sócio.");

      let userId: number;
      const existing = await getUserByEmail(person.email);
      if (existing) {
        userId = existing.id;
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
          const message = String(error);
          if (!message.includes("Já existe")) throw error;
          const raced = await getUserByEmail(person.email);
          if (!raced) throw error;
          userId = raced.id;
        }
      }

      await db
        .insert(familyAccess)
        .values({
          id: createId(),
          familyId: person.familyId,
          userId,
          accessRole: "CLIENTE",
        })
        .onConflictDoNothing();
      await db
        .update(firstAccessLinks)
        .set({ consumedAt: new Date() })
        .where(eq(firstAccessLinks.id, link.id));

      return { success: true };
    }),
});
