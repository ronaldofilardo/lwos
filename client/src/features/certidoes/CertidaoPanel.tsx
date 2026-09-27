import { useEffect, useRef, useState } from "react";
import { BadgeCheck, FileUp, RefreshCw, Stamp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { readAsBase64 } from "@/lib/file";
import { trpc } from "@/lib/trpc";
import {
  certidaoScopeLabels,
  certidaoStatusLabels,
  certidaoStatusStyles,
  certidaoStatusValues,
  certidaoTypeLabels,
  certidaoTypeValues,
  type CertidaoStatus,
  type CertidaoScope,
} from "./types";

type CertidaoRow = {
  id: string;
  scope: CertidaoScope;
  type: string;
  status: CertidaoStatus;
  validUntil: string | null;
  documentId: string | null;
  subjectName: string | null;
  documentCurrentVersion: number;
};

function isExpired(validUntil: string | null) {
  if (!validUntil) return false;
  const [year, month, day] = validUntil.split("-").map(Number);
  if (!year || !month || !day) return false;
  const today = new Date();
  return new Date(year, month - 1, day).getTime() < today.setHours(0, 0, 0, 0);
}

function CertidaoRowItem({
  row,
  canEdit,
  canUpload,
  onStatusChange,
  onUpload,
  busy,
}: {
  row: CertidaoRow;
  canEdit: boolean;
  canUpload: boolean;
  onStatusChange: (certidaoId: string, status: CertidaoStatus, validUntil?: string) => void;
  onUpload: (documentId: string, file: File) => void;
  busy: boolean;
}) {
  const [status, setStatus] = useState<CertidaoStatus>(row.status);
  const [validUntil, setValidUntil] = useState(row.validUntil ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStatus(row.status);
    setValidUntil(row.validUntil ?? "");
  }, [row.status, row.validUntil]);

  const commit = (nextStatus: CertidaoStatus, nextValidUntil: string) => {
    if (nextStatus === row.status && nextValidUntil === (row.validUntil ?? "")) return;
    onStatusChange(row.id, nextStatus, nextValidUntil);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-lucathi-line bg-white px-3 py-2.5">
      <div className="min-w-40 flex-1">
        <p className="text-sm font-semibold text-lucathi-navy">
          {certidaoTypeLabels[row.type as keyof typeof certidaoTypeLabels] ?? row.type}
        </p>
      </div>

      <span
        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${certidaoStatusStyles[row.status]}`}
      >
        {certidaoStatusLabels[row.status]}
      </span>

      {isExpired(row.validUntil) ? (
        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
          Vencida
        </span>
      ) : null}

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={e => {
              const next = e.target.value as CertidaoStatus;
              setStatus(next);
              commit(next, validUntil);
            }}
            disabled={busy}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            aria-label="Status da certidão"
          >
            {certidaoStatusValues.map(value => (
              <option key={value} value={value}>
                {certidaoStatusLabels[value]}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={validUntil}
            onChange={e => setValidUntil(e.target.value)}
            onBlur={() => commit(status, validUntil)}
            disabled={busy}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            aria-label="Validade da certidão"
          />
        </div>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-lucathi-gray">
          {row.documentCurrentVersion
            ? `v${row.documentCurrentVersion}`
            : "sem arquivo"}
        </span>
        {canUpload && row.documentId ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <FileUp className="mr-1 size-3.5" />
            {row.documentCurrentVersion ? "Substituir" : "Anexar"}
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx"
          onChange={e => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file && row.documentId) onUpload(row.documentId, file);
          }}
        />
      </div>
    </div>
  );
}

export function CertidaoPanel({
  familyId,
  readOnly = false,
}: {
  familyId: string;
  /** Titular (CLIENTE): mostra apenas status/validade, sem gerar nem anexar. */
  readOnly?: boolean;
}) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const canEdit = user?.role === "SOCIO";
  const canManage = user?.role === "SOCIO" || user?.role === "ANALISTA";

  const list = trpc.certidoes.list.useQuery({ familyId });

  const refresh = () => {
    utils.certidoes.list.invalidate({ familyId });
    utils.documents.list.invalidate({ familyId });
  };

  const generate = trpc.certidoes.generate.useMutation({
    onSuccess: result => {
      refresh();
      toast.success(
        result.created > 0
          ? `${result.created} certidão(ões) gerada(s).`
          : "Todas as certidões já estavam geradas."
      );
    },
    onError: error => toast.error(error.message),
  });

  const updateStatus = trpc.certidoes.updateStatus.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Certidão atualizada pelo sócio.");
    },
    onError: error => toast.error(error.message),
  });

  const upload = trpc.documents.uploadVersion.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Arquivo da certidão enviado.");
    },
    onError: error => toast.error(error.message),
  });

  const rows = (list.data ?? []) as CertidaoRow[];
  const scopes: CertidaoScope[] = ["PESSOA", "SOCIEDADE"];

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
            <Stamp className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-lucathi-navy">
              Certidões & CNDs
            </h2>
            <p className="text-sm text-lucathi-gray">
              Membros da família e holdings. Status e validade alterados apenas
              pelo SOCIO; arquivo anexado por versão.
            </p>
          </div>
        </div>
        {canManage ? (
          <Button
            variant="outline"
            size="sm"
            disabled={generate.isPending}
            onClick={() => generate.mutate({ familyId })}
          >
            <RefreshCw className="mr-1.5 size-4" /> Gerar certidões
          </Button>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {list.isLoading ? (
          <p className="text-sm text-lucathi-gray">Carregando certidões…</p>
        ) : null}

        {!list.isLoading && !rows.length ? (
          <p className="text-sm text-lucathi-gray">
            Nenhuma certidão gerada. Cadastre membros/sociedades e clique em
            “Gerar certidões”.
          </p>
        ) : null}

        {scopes.map(scope => {
          const scoped = rows.filter(row => row.scope === scope);
          if (!scoped.length) return null;
          const resolved = scoped.filter(
            row =>
              row.status === "NEGATIVA" ||
              row.status === "POSITIVA_COM_EFEITOS_DE_NEGATIVA" ||
              row.status === "SOMENTE_FISICA"
          ).length;

          return (
            <div
              key={scope}
              className="rounded-2xl border border-lucathi-line/80 bg-lucathi-mist/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-lucathi-navy" />
                  <p className="text-sm font-semibold text-lucathi-navy">
                    {certidaoScopeLabels[scope]}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
                  {resolved}/{scoped.length} regulares
                </span>
              </div>

              <div className="mt-3 space-y-4">
                {Object.entries(
                  scoped.reduce((acc, row) => {
                    const key = row.subjectName ?? "Registro não vinculado";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(row);
                    return acc;
                  }, {} as Record<string, typeof scoped>)
                ).map(([subjectName, items]) => (
                  <div key={subjectName} className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray px-1 pb-1">
                      {subjectName}
                    </h4>
                    {items.map(row => (
                      <CertidaoRowItem
                        key={row.id}
                        row={row}
                        canEdit={canEdit}
                        canUpload={!readOnly}
                        busy={updateStatus.isPending || upload.isPending}
                        onStatusChange={(certidaoId, status, validUntil) =>
                          updateStatus.mutate({ certidaoId, status, validUntil })
                        }
                        onUpload={(documentId, file) => {
                          void (async () => {
                            try {
                              const base64Data = await readAsBase64(file);
                              await upload.mutateAsync({
                                documentId,
                                fileName: file.name,
                                mimeType: file.type,
                                base64Data,
                              });
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Falha ao enviar o arquivo."
                              );
                            }
                          })();
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {rows.length ? (
          <p className="text-xs text-lucathi-gray">
            Matriz: {certidaoTypeValues.length} tipos por membro/holding ·
            inclui CNAT, CNDT e certidão de protestos.
          </p>
        ) : null}
      </div>

      {upload.isPending ? (
        <p className="mt-3 text-xs text-lucathi-gray">Enviando arquivo…</p>
      ) : null}
    </section>
  );
}
