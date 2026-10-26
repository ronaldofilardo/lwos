import { useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle2,
  CircleDashed,
  EyeOff,
  FileStack,
  Home,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { trpc } from "@/lib/trpc";
import { isResolvedDocumentStatus } from "@shared/domain/document-status";

type DocRow = {
  id: string;
  entityType: string;
  entityId: string;
  category: string;
  status: string;
  rejectionReason: string | null;
  dispensationReason: string | null;
};

type EntityPick = { type: "PESSOA" | "IMOVEL" | "SOCIEDADE"; id: string };
type ViewType = "DOCUMENTOS" | "CERTIDOES";
type TabType = "FAMILIARES" | "IMOVEIS" | "SOCIEDADES";

function statusInfo(status: string): {
  label: string;
  icon: typeof CheckCircle2;
  iconClass: string;
  resolved: boolean;
} {
  switch (status) {
    case "VALIDADO":
      return { label: "Validado", icon: CheckCircle2, iconClass: "text-emerald-600", resolved: true };
    case "DISPENSADO":
      return { label: "Dispensado", icon: EyeOff, iconClass: "text-purple-500", resolved: true };
    case "NAO_POSSUI":
      return { label: "Não possui", icon: Ban, iconClass: "text-purple-500", resolved: true };
    case "REJEITADO":
      return { label: "Rejeitado", icon: AlertCircle, iconClass: "text-red-600", resolved: false };
    case "RECEBIDO_EM_ANALISE":
      return { label: "Em análise", icon: CircleDashed, iconClass: "text-lucathi-navy", resolved: false };
    default:
      return { label: "Pendente", icon: CircleDashed, iconClass: "text-lucathi-gray", resolved: false };
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
        <p className={`truncate text-xs font-medium ${info.resolved ? "text-lucathi-gray" : "text-lucathi-navy"}`}>
          {doc.category}
          {personName ? (
            <span className="ml-1.5 font-normal text-lucathi-gray">· {personName}</span>
          ) : null}
        </p>
        {doc.status === "REJEITADO" && doc.rejectionReason ? (
          <p className="mt-0.5 truncate text-[11px] text-red-700">{doc.rejectionReason}</p>
        ) : null}
        {doc.status === "DISPENSADO" && doc.dispensationReason ? (
          <p className="mt-0.5 truncate text-[11px] text-purple-700">{doc.dispensationReason}</p>
        ) : null}
      </div>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-lucathi-gray">
        {info.label}
      </span>
    </li>
  );
}

export function UnifiedRequirementsMap({ familyId }: { familyId: string }) {
  const documents = trpc.documents.list.useQuery({ familyId }, { enabled: Boolean(familyId) });
  const people = trpc.people.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const certidoes = trpc.certidoes.list.useQuery({ familyId }, { enabled: Boolean(familyId) });

  const [tab, setTab] = useState<TabType>("FAMILIARES");
  const [selectedEntity, setSelectedEntity] = useState<EntityPick | null>(null);
  const [viewType, setViewType] = useState<ViewType>("DOCUMENTOS");

  const certidaoOwner = useMemo(() => {
    const ownerByDocId = new Map<string, string>();
    const subjectByDocId = new Map<string, string>();
    for (const row of certidoes.data ?? []) {
      if (row.documentId && row.subjectName) ownerByDocId.set(row.documentId, row.subjectName);
      if (row.documentId && row.subjectId) subjectByDocId.set(row.documentId, row.subjectId);
    }
    return { ownerByDocId, subjectByDocId };
  }, [certidoes.data]);

  const personName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people.data ?? []) map.set(p.id, p.fullName);
    return map;
  }, [people.data]);

  const propertyName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of properties.data ?? []) map.set(p.id, p.description);
    return map;
  }, [properties.data]);

  const companyName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of companies.data ?? []) map.set(c.id, c.legalName);
    return map;
  }, [companies.data]);

  const stats = useMemo(() => {
    const docs = documents.data ?? [];
    let resolved = 0;
    let rejected = 0;
    let pending = 0;
    for (const d of docs) {
      if (isResolvedDocumentStatus(d.status)) resolved++;
      else if (d.status === "REJEITADO") rejected++;
      else pending++;
    }
    return { total: docs.length, resolved, rejected, pending };
  }, [documents.data]);

  const allDocs = useMemo(() => documents.data ?? [], [documents.data]);

  const docsForEntity = useMemo(() => {
    if (!selectedEntity) return [];
    const isCertidaoView = viewType === "CERTIDOES";
    return allDocs.filter(d => {
      if (d.entityType !== selectedEntity.type && d.entityType !== "CERTIDAO") return false;
      if (d.entityType === selectedEntity.type) return d.entityId === selectedEntity.id;
      if (d.entityType === "CERTIDAO" && isCertidaoView) {
        return certidaoOwner.subjectByDocId.get(d.id) === selectedEntity.id;
      }
      return false;
    });
  }, [allDocs, selectedEntity, viewType, certidaoOwner.subjectByDocId]);

  if (documents.isLoading) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-6">
        <p className="text-sm text-lucathi-gray">Carregando mapa de requisitos…</p>
      </div>
    );
  }

  const entityLabel = useMemo(() => {
    if (!selectedEntity) return "Selecione uma entidade";
    if (selectedEntity.type === "PESSOA") return personName.get(selectedEntity.id) ?? "Pessoa";
    if (selectedEntity.type === "IMOVEL") return propertyName.get(selectedEntity.id) ?? "Imóvel";
    if (selectedEntity.type === "SOCIEDADE") return companyName.get(selectedEntity.id) ?? "Sociedade";
    return "";
  }, [selectedEntity, personName, propertyName, companyName]);

  return (
    <section className="space-y-4 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
            <FileStack className="mr-1 inline size-3.5" /> Mapa visual de requisitos
          </p>
          <h2 className="mt-1 font-display text-xl text-lucathi-navy">
            O que já existe e o que ainda falta
          </h2>
          <p className="mt-1 text-sm text-lucathi-gray">
            Itens concluídos aparecem de forma opaca; pendentes e rejeitados destacados para orientar o trabalho do Sócio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-center">
            <p className="text-lg font-semibold text-lucathi-navy">{stats.resolved}/{stats.total}</p>
            <p className="text-[10px] uppercase tracking-wider text-lucathi-gray">resolvidos</p>
          </div>
          <div className="rounded-xl bg-lucathi-navy/10 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-lucathi-navy">{stats.pending}</p>
            <p className="text-[10px] uppercase tracking-wider text-lucathi-gray">pendentes</p>
          </div>
          <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-red-700">{stats.rejected}</p>
            <p className="text-[10px] uppercase tracking-wider text-red-700/80">rejeitados</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <ToggleGroup type="single" value={tab} onValueChange={v => setTab(v as TabType)} className="shrink-0">
          <ToggleGroupItem value="FAMILIARES">
            <User className="mr-2 size-3.5" /> Familiares
          </ToggleGroupItem>
          <ToggleGroupItem value="IMOVEIS">
            <Home className="mr-2 size-3.5" /> Imóveis
          </ToggleGroupItem>
          <ToggleGroupItem value="SOCIEDADES">
            <Building2 className="mr-2 size-3.5" /> Sociedades
          </ToggleGroupItem>
        </ToggleGroup>

        {tab !== "IMOVEIS" && selectedEntity && (
          <ToggleGroup type="single" value={viewType} onValueChange={v => setViewType(v as ViewType)} className="shrink-0 ml-3">
            <ToggleGroupItem value="DOCUMENTOS">
              <FileStack className="mr-2 size-3.5" /> Documentos
            </ToggleGroupItem>
            <ToggleGroupItem value="CERTIDOES">
              <FileStack className="mr-2 size-3.5" /> Certidões
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {tab === "FAMILIARES" && !selectedEntity ? (
          <div className="w-64 ml-3">
            <Select
              onValueChange={value => setSelectedEntity(value ? { type: "PESSOA", id: value } : null)}
            >
              <SelectLabel>Familiar</SelectLabel>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um familiar" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pessoas</SelectLabel>
                  {(people.data ?? []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {tab === "SOCIEDADES" && !selectedEntity ? (
          <div className="w-64 ml-3">
            <Select
              onValueChange={value => setSelectedEntity(value ? { type: "SOCIEDADE", id: value } : null)}
            >
              <SelectLabel>Sociedade</SelectLabel>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sociedade" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sociedades</SelectLabel>
                  {(companies.data ?? []).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.legalName}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {tab === "IMOVEIS" && !selectedEntity ? (
          <div className="w-64 ml-3">
            <Select
              onValueChange={value => setSelectedEntity(value ? { type: "IMOVEL", id: value } : null)}
            >
              <SelectLabel>Imóvel</SelectLabel>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                <SelectLabel>Imóveis</SelectLabel>
                {(properties.data ?? []).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.description}</SelectItem>
                ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {!selectedEntity ? (
        <div className="rounded-lg border border-dashed border-lucathi-line px-6 py-8 text-center text-lucathi-gray">
          <p>Selecione uma entidade para ver seus requisitos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-lucathi-navy">{entityLabel}</p>
            {tab !== "IMOVEIS" && (
              <span className="rounded-full bg-lucathi-mist px-2 py-0.5 text-[10px] font-semibold text-lucathi-gray uppercase tracking-wide">
                {viewType}
              </span>
            )}
          </div>
          {docsForEntity.length === 0 ? (
            <p className="rounded-lg border border-dashed border-lucathi-line px-3 py-2 text-xs text-lucathi-gray">
              Nenhum requisito desta entidade foi gerado ainda.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {docsForEntity.map(doc => {
                const isCertidao = doc.entityType === "CERTIDAO";
                const name =
                  isCertidao ? certidaoOwner.ownerByDocId.get(doc.id) :
                  selectedEntity.type === "PESSOA" ? personName.get(doc.entityId) :
                  selectedEntity.type === "IMOVEL" ? propertyName.get(doc.entityId) :
                  companyName.get(doc.entityId);
                return (
                  <DocRowItem key={doc.id} doc={doc} personName={name} />
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
