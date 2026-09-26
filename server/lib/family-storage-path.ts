import { and, eq } from "drizzle-orm";
import { people } from "../../drizzle/schema";
import { requireDatabase } from "../features/_shared/database";

/** Mantém só dígitos — CPF/CNPJ sem máscara, seguro pra nome de pasta e pra comparação. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Resolve a chave de pasta usada no storage local para uma família:
 * CPF (só dígitos) da pessoa marcada como titular (`isPrimaryContact`).
 * Se nenhuma pessoa estiver marcada como titular, ou o titular não tiver
 * CPF cadastrado, cai no id da família — garante que o upload nunca falha
 * por falta de CPF, mas o ideal é sempre ter um titular com CPF definido.
 */
export async function resolveFamilyStorageFolder(familyId: string): Promise<string> {
  const db = await requireDatabase();

  const [primary] = await db
    .select({ taxId: people.taxId })
    .from(people)
    .where(and(eq(people.familyId, familyId), eq(people.isPrimaryContact, true)))
    .limit(1);

  const digits = primary?.taxId ? onlyDigits(primary.taxId) : "";
  if (digits) return digits;

  return `familia-${familyId}`;
}

/**
 * Verifica se o CPF já é usado como titular por OUTRA família — evitaria que
 * duas famílias diferentes acabassem apontando pra mesma pasta de storage
 * por erro de digitação. Retorna o id da família conflitante, ou null se
 * não há conflito. `excludeFamilyId` ignora a própria família (ela pode já
 * ter esse titular com esse CPF, isso não é conflito).
 */
export async function findFamilyIdByPrimaryContactCpf(
  cpf: string,
  excludeFamilyId?: string,
): Promise<string | null> {
  const digits = onlyDigits(cpf);
  if (!digits) return null;

  const db = await requireDatabase();
  const rows = await db
    .select({ familyId: people.familyId, taxId: people.taxId })
    .from(people)
    .where(eq(people.isPrimaryContact, true));

  for (const row of rows) {
    if (!row.taxId) continue;
    if (excludeFamilyId && row.familyId === excludeFamilyId) continue;
    if (onlyDigits(row.taxId) === digits) return row.familyId;
  }

  return null;
}
