import { asc, eq } from "drizzle-orm";
import { families, people } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";

export async function listProjectBirthdays() {
  try {
    const db = await requireDatabase();
    return await db
      .select({
        id: people.id,
        fullName: people.fullName,
        birthDate: people.birthDate,
        vinculo: people.vinculo,
        projectName: families.name,
      })
      .from(people)
      .leftJoin(families, eq(people.familyId, families.id))
      .orderBy(asc(people.fullName));
  } catch (cause) {
    throw new Error("Não foi possível consultar os aniversários dos projetos.", {
      cause,
    });
  }
}
