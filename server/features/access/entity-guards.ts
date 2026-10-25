import { getPersonRecord } from "../people/person-repository";
import { badRequest } from "../_shared/errors";

/**
 * Garante que a pessoa pertence à família informada. Sem isso, um sócio ou
 * responsável de ativo poderia apontar para pessoa de OUTRA família (o banco
 * não tem chave estrangeira).
 */
export async function assertPersonInFamily(personId: string, familyId: string) {
  const person = await getPersonRecord(personId);
  if (!person || person.familyId !== familyId) {
    throw badRequest("A pessoa informada não pertence a esta família.");
  }
  return person;
}
