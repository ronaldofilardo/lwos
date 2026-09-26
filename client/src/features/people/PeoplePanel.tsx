import { Crown, UsersRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatDateOnlyBR } from "@/lib/utils";
import {
  civilStatusLabels,
  isMarriedStatus,
  vinculoLabels,
  type Vinculo,
} from "@/features/families/types";
import { PersonForm } from "./common/PersonForm";
import { usePeople } from "./hooks/usePeople";

function VinculoBadge({ vinculo }: { vinculo: Vinculo | null }) {
  if (!vinculo) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-lucathi-navy/10 px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
      {vinculoLabels[vinculo]}
    </span>
  );
}

export function PeoplePanel({ familyId }: { familyId: string }) {
  const { user } = useAuth();
  const { people, loading, addPerson, creating, markPrimary, markingPrimary } =
    usePeople(familyId);
  const canEdit = user?.role === "SOCIO" || user?.role === "ANALISTA";

  const parentName = (personId: string | null) => {
    if (!personId) return null;
    return people.find(p => p.id === personId)?.fullName ?? null;
  };

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6">
      <div className="flex items-center gap-3">
        <UsersRound className="size-5 text-lucathi-navy" />
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">Pessoas</h2>
          <p className="text-sm text-lucathi-gray">
            Membros vinculados à família e seus requisitos documentais.
          </p>
        </div>
      </div>

      {canEdit ? (
        <PersonForm disabled={creating} people={people} onSubmit={addPerson} />
      ) : null}

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-lucathi-gray">Carregando pessoas…</p>
        ) : people.length ? (
          people.map(person => {
            const isConjuge = person.vinculo === "CONJUGE";
            const married = !isConjuge && isMarriedStatus(person.civilStatus);
            const parent =
              person.vinculo === "NETO" || person.vinculo === "BISNETO"
                ? parentName(person.parentPersonId)
                : null;

            return (
              <div
                key={person.id}
                className="rounded-xl bg-lucathi-mist px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{person.fullName}</p>
                    <VinculoBadge vinculo={person.vinculo} />
                  </div>
                  {person.isPrimaryContact ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-lucathi-navy/10 px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
                      <Crown className="size-3.5" />
                      Titular
                    </span>
                  ) : canEdit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-lucathi-gray"
                      disabled={markingPrimary}
                      onClick={() => markPrimary(person.id)}
                    >
                      Definir como titular
                    </Button>
                  ) : null}
                </div>
                {!isConjuge ? (
                  <p className="mt-1 text-xs text-lucathi-gray">
                    {civilStatusLabels[person.civilStatus] ??
                      person.civilStatus}
                    {married ? ` · ${person.maritalRegime}` : ""}
                    {` · ${person.taxId || "CPF não informado"}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-lucathi-gray">
                    {person.taxId || "CPF não informado"}
                  </p>
                )}
                {parent ? (
                  <p className="mt-1 text-xs text-lucathi-gray">
                    Filho(a) de: {parent}
                  </p>
                ) : null}
                {married && person.spouseName ? (
                  <p className="mt-1 text-xs text-lucathi-gray">
                    Cônjuge: {person.spouseName}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-lucathi-gray">
                  {person.email || "E-mail não informado"}
                  {person.birthDate
                    ? ` · Nascimento: ${formatDateOnlyBR(person.birthDate)}`
                    : ""}
                </p>
                {person.exSpouseNote ? (
                  <p className="mt-2 text-xs italic text-lucathi-gray">
                    Observação: {person.exSpouseNote}
                  </p>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-lucathi-gray">
            Nenhuma pessoa cadastrada.
          </p>
        )}
      </div>
    </section>
  );
}
