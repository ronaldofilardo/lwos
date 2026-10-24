import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BirthdaysList } from "./BirthdaysList";
import { sortBirthdayPeople } from "./birthday-utils";

export function BirthdaysPage() {
  const { user } = useAuth();
  const birthdays = trpc.birthdays.list.useQuery(undefined, {
    enabled: user?.role === "SOCIO",
  });
  const people = sortBirthdayPeople(birthdays.data ?? []);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-4xl text-lucathi-navy">Aniversários</h1>
        <p className="mt-2 text-sm text-lucathi-gray">
          Pessoas dos projetos, com destaque para os aniversários desta semana.
        </p>
      </header>
      {user?.role !== "SOCIO" ? (
        <p role="alert" className="rounded-xl border border-lucathi-line bg-white p-5 text-sm">
          Esta lista está disponível somente para o perfil Sócio.
        </p>
      ) : birthdays.isPending ? (
        <p role="status" className="rounded-xl border border-lucathi-line bg-white p-5 text-sm text-lucathi-gray">
          Carregando aniversariantes...
        </p>
      ) : birthdays.isError ? (
        <div role="alert" className="space-y-3 rounded-xl border border-lucathi-line bg-white p-5">
          <p className="text-sm text-lucathi-gray">{birthdays.error.message}</p>
          <Button variant="outline" onClick={() => void birthdays.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <BirthdaysList people={people} />
      )}
    </section>
  );
}
