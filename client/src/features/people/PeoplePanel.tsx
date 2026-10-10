import { useState } from "react";
import { Crown, Pencil, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateOnlyBR } from "@/lib/utils";
import {
  formatarIdadeDecimal,
  isNascimentoValido,
  idadeDecimal,
} from "@shared/validation";
import {
  civilStatusLabels,
  isMarriedStatus,
  vinculoLabels,
  type Vinculo,
} from "@/features/families/types";
import { PersonForm, type PersonFormSubmit } from "./common/PersonForm";
import { usePeople } from "./hooks/usePeople";

function VinculoBadge({ vinculo }: { vinculo: Vinculo | null }) {
  if (!vinculo) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-lucathi-navy/10 px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
      {vinculoLabels[vinculo]}
    </span>
  );
}

type PersonRow = {
  id: string;
  fullName: string;
  vinculo: Vinculo | null;
  civilStatus: string;
  maritalRegime: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  spouseName: string | null;
  parentPersonId: string | null;
  exSpouseNote: string | null;
  isPrimaryContact: boolean;
  isDependent: boolean;
  addressSameAsPrimary: boolean;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  uf: string | null;
};

function toFormValues(person: PersonRow): Partial<PersonFormSubmit> {
  return {
    fullName: person.fullName,
    email: person.email ?? "",
    taxId: person.taxId ?? "",
    birthDate: person.birthDate ?? "",
    phone: person.phone ?? "",
    exSpouseNote: person.exSpouseNote ?? "",
    vinculo: person.vinculo ?? "TITULAR",
    civilStatus: person.civilStatus as PersonFormSubmit["civilStatus"],
    maritalRegime: person.maritalRegime as PersonFormSubmit["maritalRegime"],
    spouseName: person.spouseName ?? "",
    isDependent: person.isDependent,
    addressSameAsPrimary: person.addressSameAsPrimary,
    cep: person.cep ?? "",
    street: person.street ?? "",
    number: person.number ?? "",
    complement: person.complement ?? "",
    district: person.district ?? "",
    city: person.city ?? "",
    uf: person.uf as PersonFormSubmit["uf"],
  };
}

export function PeoplePanel({ familyId }: { familyId: string }) {
  const { user } = useAuth();
  const {
    people,
    loading,
    addPerson,
    creating,
    updatePerson,
    updating,
    removePerson,
    removing,
    markPrimary,
    markingPrimary,
  } = usePeople(familyId);
  const canEdit = user?.role === "SOCIO" || user?.role === "ANALISTA";
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PersonRow | null>(null);
  const [deleting, setDeleting] = useState<PersonRow | null>(null);

  const parentName = (personId: string | null) => {
    if (!personId) return null;
    return people.find(p => p.id === personId)?.fullName ?? null;
  };

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UsersRound className="size-5 text-lucathi-navy" />
          <div>
            <h2 className="font-display text-2xl text-lucathi-navy">Pessoas</h2>
            <p className="text-sm text-lucathi-gray">
              Membros vinculados ao projeto e seus requisitos documentais.
            </p>
          </div>
        </div>
        {canEdit ? (
          <Button
            size="sm"
            className="bg-lucathi-deep hover:bg-lucathi-navy"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="mr-1.5 size-4" />
            Adicionar membro
          </Button>
        ) : null}
      </div>

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
            const idade =
              person.birthDate && isNascimentoValido(person.birthDate)
                ? formatarIdadeDecimal(idadeDecimal(person.birthDate))
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
                    {person.isDependent ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Dependente · IRPF do titular
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
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
                    {canEdit ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-lucathi-gray"
                          onClick={() => setEditing(person as PersonRow)}
                        >
                          <Pencil className="mr-1 size-3" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-red-600 hover:text-red-700"
                          onClick={() => setDeleting(person as PersonRow)}
                        >
                          <Trash2 className="mr-1 size-3" />
                          Excluir
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
                {!isConjuge ? (
                  <p className="mt-1 text-xs text-lucathi-gray">
                    {civilStatusLabels[person.civilStatus as never] ??
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
                  {person.phone ? ` · ${person.phone}` : ""}
                  {person.birthDate
                    ? ` · Nascimento: ${formatDateOnlyBR(person.birthDate)}`
                    : ""}
                  {idade ? ` · ${idade}` : ""}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar membro</DialogTitle>
            <DialogDescription>
              Cadastro com validação de CPF, nascimento e endereço.
            </DialogDescription>
          </DialogHeader>
          <PersonForm
            key="novo"
            disabled={creating}
            people={people}
            onSubmit={async data => {
              await addPerson(data);
              setCreateOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar {editing?.fullName}</DialogTitle>
            <DialogDescription>
              Vínculo e parentalidade não são alterados por aqui.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <PersonForm
              key={editing.id}
              isEdit
              disabled={updating}
              people={people}
              initial={toFormValues(editing)}
              onSubmit={async data => {
                await updatePerson({ ...data, personId: editing.id });
                setEditing(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={o => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir {deleting?.fullName}?</DialogTitle>
            <DialogDescription>
              A pessoa será removida do projeto. Os documentos e arquivos já
              enviados serão arquivados — nada é apagado do disco. A exclusão é
              registrada em auditoria.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-lucathi-gray">
            Exclusão bloqueada se a pessoa for titular, tiver dependentes na
            árvore, titularidade de imóvel, participação em sociedade ou for
            responsável por ativos.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleting(null)}
              disabled={removing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={removing}
              onClick={async () => {
                if (!deleting) return;
                await removePerson(deleting.id);
                setDeleting(null);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
