import {
  formatBirthdayDate,
  getBirthdayAge,
  isBirthdayThisWeek,
} from "./birthday-utils";
import type { BirthdayPerson } from "./types";

function formatAge(birthDate: string | null): string {
  const age = getBirthdayAge(birthDate);
  if (age === null) return "—";
  return `${age} ${age === 1 ? "ano" : "anos"}`;
}

export function BirthdaysList({ people }: { people: BirthdayPerson[] }) {
  if (!people.length) {
    return (
      <p className="rounded-xl border border-dashed border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Nenhuma pessoa cadastrada nos projetos.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-lucathi-line bg-white">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">
          Pessoas cadastradas, datas de nascimento e idades
        </caption>
        <thead className="bg-lucathi-mist text-xs uppercase tracking-[0.12em] text-lucathi-gray">
          <tr>
            <th scope="col" className="px-4 py-3">Pessoa</th>
            <th scope="col" className="px-4 py-3">Projeto</th>
            <th scope="col" className="px-4 py-3">Nascimento</th>
            <th scope="col" className="px-4 py-3">Idade</th>
            <th scope="col" className="px-4 py-3">Aniversário</th>
          </tr>
        </thead>
        <tbody>
          {people.map(person => {
            const thisWeek = isBirthdayThisWeek(person.birthDate);
            return (
              <tr
                key={person.id}
                className={`border-t border-lucathi-line ${
                  thisWeek ? "bg-lucathi-mist/70" : ""
                }`}
              >
                <td className="px-4 py-4 font-medium text-lucathi-navy">
                  {person.fullName}
                </td>
                <td className="px-4 py-4 text-lucathi-gray">
                  {person.projectName ?? "Projeto não identificado"}
                </td>
                <td className="px-4 py-4 text-lucathi-ink">
                  {formatBirthdayDate(person.birthDate)}
                </td>
                <td className="px-4 py-4 text-lucathi-ink">
                  {formatAge(person.birthDate)}
                </td>
                <td className="px-4 py-4">
                  {thisWeek ? (
                    <span className="rounded-full bg-lucathi-deep px-2.5 py-1 text-xs font-semibold text-white">
                      Esta semana
                    </span>
                  ) : (
                    <span className="text-lucathi-gray">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
