import { FileStack, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { StatusBadge } from "@/components/lucathi/StatusBadge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { DocumentActions } from "./common/DocumentActions";
import { DocumentVersionHistory } from "./common/DocumentVersionHistory";
import { useDocumentActions } from "./hooks/useDocumentActions";
import { useDocuments } from "./hooks/useDocuments";
import {
  buildDocumentSections,
  groupDocumentsByMember,
  isResolvedStatus,
} from "./groupDocuments";

export function DocumentPanel({ familyId }: { familyId: string }) {
  const { documents, loading } = useDocuments(familyId);
  const { user } = useAuth();
  const actions = useDocumentActions(familyId);
  const canReview = user?.role === "SOCIO";
  const canEdit = user?.role === "SOCIO" || user?.role === "ANALISTA";
  const [syncing, setSyncing] = useState(false);

  const family = trpc.families.get.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );
  const people = trpc.people.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });
  const utils = trpc.useUtils();
  const generate = trpc.documents.generateRequirements.useMutation({
    onSuccess: result => {
      utils.documents.list.invalidate({ familyId });
      toast.success(
        result.created > 0
          ? `${result.created} requisito(s) documentais criados.`
          : "Todos os requisitos já estavam gerados."
      );
    },
    onError: error => toast.error(error.message),
    onSettled: () => setSyncing(false),
  });

  // As certidões têm seção própria (/famílias → Certidões), não entram aqui.
  const matrixDocuments = documents.filter(d => d.entityType !== "CERTIDAO");

  const groups = groupDocumentsByMember(matrixDocuments, {
    familyName: family.data?.name ?? null,
    people: people.data ?? [],
    properties: (properties.data ?? []).map(p => ({
      id: p.id,
      description: p.description,
    })),
    companies: (companies.data ?? []).map(c => ({
      id: c.id,
      legalName: c.legalName,
    })),
    assets: (assets.data ?? []).map(a => ({
      id: a.id,
      description: a.description,
    })),
  });
  const sections = buildDocumentSections(groups);

  const totalDocs = matrixDocuments.length;
  const resolvedDocs = matrixDocuments.filter(d =>
    isResolvedStatus(d.status)
  ).length;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
            <FileStack className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-lucathi-navy">
              Matriz Documental & Compliance
            </h2>
            <p className="text-sm text-lucathi-gray">
              Organizada por membro do caso. Versões preservadas com SHA-256;
              validação e dispensa pelo SOCIO.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              disabled={syncing || generate.isPending}
              onClick={() => {
                setSyncing(true);
                generate.mutate({ familyId });
              }}
            >
              <RefreshCw className="mr-1.5 size-4" /> Gerar requisitos
            </Button>
          ) : null}
          {totalDocs > 0 ? (
            <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
                Progresso
              </p>
              <p className="text-sm font-semibold text-lucathi-navy">
                {resolvedDocs}/{totalDocs} resolvidos
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {loading ? (
          <p className="text-sm text-lucathi-gray">Carregando documentos…</p>
        ) : null}
        {!loading && !matrixDocuments.length ? (
          <p className="text-sm text-lucathi-gray">
            Cadastre uma pessoa, imóvel, sociedade ou ativo — ou clique em
            “Gerar requisitos” — para montar as seções da matriz documental.
          </p>
        ) : null}

        {sections.map(section => {
          const sectionDocs = section.groups.flatMap(group => group.documents);
          const sectionResolved = sectionDocs.filter(d =>
            isResolvedStatus(d.status)
          ).length;

          return (
            <section
              key={section.key}
              className="rounded-2xl border border-lucathi-line bg-lucathi-mist/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg text-lucathi-navy">
                    {section.title}
                  </p>
                  <p className="text-xs text-lucathi-gray">
                    {section.description}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
                  {sectionResolved}/{sectionDocs.length} resolvidos
                </span>
              </div>

              <div className="mt-3 space-y-4">
                {section.groups.map(group => {
                  const groupResolved = group.documents.filter(d =>
                    isResolvedStatus(d.status)
                  ).length;
                  return (
                    <div
                      key={group.key}
                      className="rounded-2xl border border-lucathi-line/80 bg-white/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-lucathi-navy">
                            {group.title}
                          </p>
                          {group.subtitle ? (
                            <p className="text-xs text-lucathi-gray">
                              {group.subtitle}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full bg-lucathi-mist px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
                          {groupResolved}/{group.documents.length} resolvidos
                        </span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {group.documents.map(document => (
                          <div
                            key={document.id}
                            className="rounded-xl border border-lucathi-line bg-white p-4 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-lucathi-navy">
                                  {document.category}
                                </p>
                                <p className="text-xs text-lucathi-gray">
                                  Versão atual:{" "}
                                  {document.currentVersion
                                    ? `v${document.currentVersion}`
                                    : "não enviada"}
                                </p>
                              </div>
                              <StatusBadge status={document.status} />
                            </div>

                            {document.status === "DISPENSADO" &&
                            document.dispensationReason ? (
                              <div className="mt-2.5 rounded-lg border border-purple-200 bg-purple-50/80 p-2.5 text-xs text-purple-900">
                                <span className="font-semibold">
                                  Dispensa formalizada por Sócio:
                                </span>{" "}
                                “{document.dispensationReason}”
                                {document.dispensedAt
                                  ? ` em ${new Date(document.dispensedAt).toLocaleDateString("pt-BR")}`
                                  : ""}
                              </div>
                            ) : null}

                            {document.status === "REJEITADO" &&
                            document.rejectionReason ? (
                              <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                                <span className="font-semibold">
                                  Motivo da Rejeição:
                                </span>{" "}
                                {document.rejectionReason}
                              </div>
                            ) : null}

                            <div className="mt-3">
                              <DocumentActions
                                documentId={document.id}
                                canReview={canReview}
                                busy={
                                  actions.uploading ||
                                  actions.reviewing ||
                                  actions.dispensing
                                }
                                onUpload={file =>
                                  actions.upload(document.id, file)
                                }
                                onReview={(status, reason) =>
                                  actions.review(document.id, status, reason)
                                }
                                onDispense={reason =>
                                  actions.dispense(document.id, reason)
                                }
                              />
                            </div>

                            <DocumentVersionHistory
                              documentId={document.id}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
