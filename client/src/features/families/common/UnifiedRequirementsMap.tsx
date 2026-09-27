import { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  EyeOff,
  FileStack,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type DocRow = {
  id: string;
  entityType: string;
  entityId: string;
  category: string;
  status: string;
  rejectionReason: string | null;
  dispensationReason: string | null;
};

type SectionDef = {
  key: string;
  title: string;
  entityTypes: string[];
};

const SECTIONS: SectionDef[] = [
  {
    key: "FAMILIARES",
    title: "Familiares",
    entityTypes: ["FAMILIA", "PESSOA"],
  },
  { key: "IMOVEL", title: "Imóveis", entityTypes: ["IMOVEL"] },
  {
    key: "SOCIEDADE",
    title: "Sociedades & Holdings",
    entityTypes: ["SOCIEDADE"],
  },
  { key: "CERTIDAO", title: "Certidões & CNDs", entityTypes: ["CERTIDAO"] },
  { key: "ATIVO", title: "Ativos", entityTypes: ["ATIVO"] },
];

const RESOLVED = new Set(["VALIDADO", "DISPENSADO"]);

function statusInfo(status: string): {
  label: string;
  icon: typeof CheckCircle2;
  iconClass: string;
  resolved: boolean;
} {
  switch (status) {
    case "VALIDADO":
      return {
        label: "Validado",
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        resolved: true,
      };
    case "DISPENSADO":
      return {
        label: "Dispensado",
        icon: EyeOff,
        iconClass: "text-purple-500",
        resolved: true,
      };
    case "REJEITADO":
      return {
        label: "Rejeitado",
        icon: AlertCircle,
        iconClass: "text-red-600",
        resolved: false,
      };
    case "RECEBIDO_EM_ANALISE":
      return {
        label: "Em análise",
        icon: CircleDashed,
        iconClass: "text-lucathi-navy",
        resolved: false,
      };
    default:
      return {
        label: "Pendente",
        icon: CircleDashed,
        iconClass: "text-lucathi-gray",
        resolved: false,
      };
  }
}

function DocRowItem({ doc, personName }: { doc: DocRow; personName?: string }) {
  const info = statusInfo(doc.status);
  const Icon = info.icon;

  return (
    <li
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
        info.resolved
          ? "border-lucathi-line/60 bg-white/60 opacity-55"
          : doc.status === "REJEITADO"
            ? "border-red-200 bg-red-50/60"
            : "border-lucathi-navy/20 bg-white"
      }`}
      title={info.resolved ? "Concluído — item opaco" : undefined}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${info.iconClass}`} />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-xs font-medium ${
            info.resolved ? "text-lucathi-gray" : "text-lucathi-navy"
          }`}
        >
          {doc.category}
          {personName ? (
            <span className="ml-1.5 font-normal text-lucathi-gray">
              · {personName}
            </span>
          ) : null}
        </p>
        {doc.status === "REJEITADO" && doc.rejectionReason ? (
          <p className="mt-0.5 truncate text-[11px] text-red-700">
            {doc.rejectionReason}
          </p>
        ) : null}
        {doc.status === "DISPENSADO" && doc.dispensationReason ? (
          <p className="mt-0.5 truncate text-[11px] text-purple-700">
            {doc.dispensationReason}
          </p>
        ) : null}
      </div>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-lucathi-gray">
        {info.label}
      </span>
    </li>
  );
}

export function UnifiedRequirementsMap({ familyId }: { familyId: string }) {
  const documents = trpc.documents.list.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );
  const people = trpc.people.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });

  const personName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people.data ?? []) map.set(p.id, p.fullName);
    return map;
  }, [people.data]);

  const stats = useMemo(() => {
    const docs = documents.data ?? [];
    let resolved = 0;
    let rejected = 0;
    let pending = 0;
    for (const d of docs) {
      if (RESOLVED.has(d.status)) resolved++;
      else if (d.status === "REJEITADO") rejected++;
      else pending++;
    }
    return { total: docs.length, resolved, rejected, pending };
  }, [documents.data]);

  const sections = useMemo(() => {
    const docs = (documents.data ?? []) as DocRow[];
    return SECTIONS.map(section => ({
      ...section,
      docs: docs.filter(d => section.entityTypes.includes(d.entityType)),
    }));
  }, [documents.data]);

  if (documents.isLoading) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-6">
        <p className="text-sm text-lucathi-gray">
          Carregando mapa de requisitos…
        </p>
      </div>
    );
  }

  const missingEntities = [
    { label: "Pessoas", count: people.data?.length ?? 0 },
    { label: "Imóveis", count: properties.data?.length ?? 0 },
    { label: "Sociedades", count: companies.data?.length ?? 0 },
    { label: "Ativos", count: assets.data?.length ?? 0 },
  ];

  return (
    <section className="space-y-4 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
            <FileStack className="mr-1 inline size-3.5" /> Mapa visual de
            requisitos
          </p>
          <h2 className="mt-1 font-display text-xl text-lucathi-navy">
            O que já existe e o que ainda falta
          </h2>
          <p className="mt-1 text-sm text-lucathi-gray">
            Itens concluídos aparecem de forma opaca; pendentes e rejeitados
            destacados para orientar o trabalho do Sócio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-center">
            <p className="text-lg font-semibold text-lucathi-navy">
              {stats.resolved}/{stats.total}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-lucathi-gray">
              resolvidos
            </p>
          </div>
          <div className="rounded-xl bg-lucathi-navy/10 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-lucathi-navy">
              {stats.pending}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-lucathi-gray">
              pendentes
            </p>
          </div>
          <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-red-700">
              {stats.rejected}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-red-700/80">
              rejeitados
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {missingEntities.map(entity => (
          <span
            key={entity.label}
            className="rounded-full border border-lucathi-line bg-lucathi-mist/60 px-3 py-1 text-xs text-lucathi-gray"
          >
            {entity.label}:{" "}
            <strong className="text-lucathi-navy">{entity.count}</strong>{" "}
            cadastrados
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(section => {
          const resolved = section.docs.filter(d =>
            RESOLVED.has(d.status)
          ).length;
          return (
            <div
              key={section.key}
              className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/40 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-lucathi-navy">
                  {section.title}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-lucathi-navy">
                  {resolved}/{section.docs.length}
                </span>
              </div>
              {section.docs.length === 0 ? (
                <p className="rounded-lg border border-dashed border-lucathi-line px-3 py-2 text-xs text-lucathi-gray">
                  Nenhum requisito desta seção foi gerado ainda.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {section.docs.map(doc => (
                    <DocRowItem
                      key={doc.id}
                      doc={doc}
                      personName={
                        doc.entityType === "PESSOA"
                          ? personName.get(doc.entityId)
                          : undefined
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
