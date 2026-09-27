import { Home, Landmark, UsersRound, Wallet } from "lucide-react";
import { trpc } from "@/lib/trpc";

const vinculoLabels: Record<string, string> = {
  TITULAR: "Titular",
  CONJUGE: "Cônjuge",
  FILHO: "Filho(a)",
  NETO: "Neto(a)",
  BISNETO: "Bisneto(a)",
};

const assetCategoryLabels: Record<string, string> = {
  INVESTIMENTO: "Aplicação / Investimento",
  VEICULO: "Veículo",
  PARTICIPACAO_OUTRA: "Participação",
  DIREITO: "Direito creditório",
  OUTRO: "Outro",
};

function Section({
  title,
  icon: Icon,
  count,
  emptyLabel,
  isLoading,
  children,
}: {
  title: string;
  icon: typeof Home;
  count: number;
  emptyLabel: string;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-5">
      <header className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-lucathi-gray">
          <Icon className="size-4" /> {title}
        </h3>
        <span className="rounded-full bg-lucathi-mist px-2.5 py-0.5 text-xs font-semibold text-lucathi-navy">
          {count}
        </span>
      </header>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <p className="text-xs text-lucathi-gray">Carregando…</p>
        ) : count === 0 ? (
          <p className="rounded-lg border border-dashed border-lucathi-line px-3 py-2 text-xs text-lucathi-gray">
            {emptyLabel}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function Row({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-xl bg-lucathi-mist px-3.5 py-2.5">
      <p className="truncate text-sm font-medium text-lucathi-navy">{title}</p>
      {detail ? (
        <p className="mt-0.5 truncate text-xs text-lucathi-gray">{detail}</p>
      ) : null}
    </div>
  );
}

/** Patrimônio da família em consulta somente leitura (perfil do titular). */
export function ClientPatrimonio({ familyId }: { familyId: string }) {
  const people = trpc.people.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Section
        title="Pessoas"
        icon={UsersRound}
        count={people.data?.length ?? 0}
        emptyLabel="Nenhuma pessoa cadastrada."
        isLoading={people.isLoading}
      >
        {(people.data ?? []).map(person => (
          <Row
            key={person.id}
            title={person.fullName}
            detail={[
              person.vinculo ? vinculoLabels[person.vinculo] ?? person.vinculo : null,
              person.isPrimaryContact ? "Titular da família" : null,
              person.taxId || null,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </Section>

      <Section
        title="Imóveis"
        icon={Home}
        count={properties.data?.length ?? 0}
        emptyLabel="Nenhum imóvel registrado."
        isLoading={properties.isLoading}
      >
        {(properties.data ?? []).map(property => (
          <Row
            key={property.id}
            title={property.description}
            detail={[
              property.propertyCity,
              property.hasRegistration
                ? property.registrationNumber
                  ? `Matrícula ${property.registrationNumber}`
                  : "Com matrícula"
                : "Sem matrícula",
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </Section>

      <Section
        title="Sociedades & Holdings"
        icon={Landmark}
        count={companies.data?.length ?? 0}
        emptyLabel="Nenhuma sociedade registrada."
        isLoading={companies.isLoading}
      >
        {(companies.data ?? []).map(company => (
          <Row
            key={company.id}
            title={company.legalName}
            detail={[company.taxNumber ? `CNPJ ${company.taxNumber}` : null, company.type]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </Section>

      <Section
        title="Demais ativos"
        icon={Wallet}
        count={assets.data?.length ?? 0}
        emptyLabel="Nenhum ativo registrado."
        isLoading={assets.isLoading}
      >
        {(assets.data ?? []).map(asset => (
          <Row
            key={asset.id}
            title={asset.description}
            detail={assetCategoryLabels[asset.category] ?? asset.category}
          />
        ))}
      </Section>
    </div>
  );
}
