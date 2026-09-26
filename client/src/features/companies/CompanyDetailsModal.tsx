import { useEffect, useState, type FormEvent } from "react";
import { Scale, Stamp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  certidaoStatusLabels,
  certidaoTypeLabels,
  type CertidaoStatus,
  type CertidaoType,
} from "@/features/certidoes/types";
import {
  companyDocLabels,
  companyDocStatusLabels,
  companyDocStatusValues,
  companyJurisdictionLabels,
  companyJurisdictionValues,
  computePerShare,
  docTypesForCompany,
  emptyHoldingForm,
  formatAmount,
  holdingFormFromDetails,
  holdingFormToFields,
  type CompanyDocStatus,
  type CompanyDocType,
  type CompanyType,
  type HoldingFormState,
} from "./holdingDetails";

type ModalProps = {
  familyId: string;
  companyId: string | null;
  onClose: () => void;
};

const BALANCE_FIELDS: { key: keyof HoldingFormState; label: string }[] = [
  { key: "equity", label: "PL (Patrimônio Líquido)" },
  { key: "cashAndEquivalents", label: "Caixa/Disponibilidades" },
  { key: "inventory", label: "Estoque" },
  { key: "accountsReceivable", label: "Créditos a receber" },
  { key: "investments", label: "Investimentos" },
  { key: "fixedAssets", label: "Ativos Imobilizados" },
  { key: "retainedEarnings", label: "Lucros Acumulados" },
  { key: "taxLiabilities", label: "Obrigações tributárias" },
  { key: "laborLiabilities", label: "Obrigações trabalhistas" },
  { key: "financing", label: "Financiamentos" },
  { key: "estimatedMarketValue", label: "Valor de Mercado Estimado" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          {title}
        </h3>
        {hint ? <p className="text-xs text-lucathi-gray">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  if (multiline) {
    return (
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-medium text-lucathi-gray">{label}</span>
        <Textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
        />
      </label>
    );
  }
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-lucathi-gray">{label}</span>
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9"
      />
    </label>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-lucathi-gray">{label}</span>
      <p className="rounded-md border border-lucathi-line bg-lucathi-mist/60 px-3 py-2 text-sm text-lucathi-navy">
        {value || "—"}
      </p>
    </div>
  );
}

export function CompanyDetailsModal({
  familyId,
  companyId,
  onClose,
}: ModalProps) {
  const utils = trpc.useUtils();
  const enabled = Boolean(companyId);
  const query = trpc.companies.getDetails.useQuery(
    { companyId: companyId ?? "" },
    { enabled }
  );

  const [form, setForm] = useState<HoldingFormState>(emptyHoldingForm);
  const [docs, setDocs] = useState<
    Partial<Record<CompanyDocType, CompanyDocStatus>>
  >({});

  const data = query.data;
  const company = data?.company;
  const international = company?.type === "HOLDING_INTERNACIONAL";
  const currency = international ? "$" : "R$";
  const docTypes = company
    ? docTypesForCompany(company.type as CompanyType)
    : [];

  useEffect(() => {
    if (!data) return;
    setForm(holdingFormFromDetails(data.details));
    setDocs(
      data.docs.reduce(
        (acc, row) => {
          acc[row.docType as CompanyDocType] = row.status;
          return acc;
        },
        {} as Partial<Record<CompanyDocType, CompanyDocStatus>>
      )
    );
  }, [data]);

  const save = trpc.companies.upsertDetails.useMutation({
    onSuccess: () => {
      utils.companies.getDetails.invalidate();
      utils.companies.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      toast.success("Detalhes da holding salvos.");
      onClose();
    },
    onError: error => toast.error(error.message),
  });

  const update = (key: keyof HoldingFormState, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const perShare = computePerShare(form);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!companyId || !company) return;
    save.mutate({
      companyId,
      fields: holdingFormToFields(form),
      docs: docTypes.map(docType => ({
        docType,
        status: docs[docType] ?? "PENDENTE",
      })),
    });
  };

  return (
    <Dialog
      open={enabled}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-lucathi-navy">
            Detalhes — {company?.legalName ?? "sociedade"}
          </DialogTitle>
          <DialogDescription>
            Ficha cadastral, balanço, documentos e certidões.{" "}
            {company?.taxNumber ? `CNPJ ${company.taxNumber}.` : ""}{" "}
            {international
              ? "Holding internacional — valores em $."
              : "Valores em R$."}
          </DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <p className="text-sm text-lucathi-gray">Carregando ficha…</p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Identificação">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadonlyField
                label="Denominação"
                value={company?.legalName ?? ""}
              />
              {international ? (
                <Field
                  label="Company Number"
                  value={form.companyNumber}
                  onChange={value => update("companyNumber", value)}
                  placeholder="Company number"
                />
              ) : (
                <ReadonlyField label="CNPJ" value={company?.taxNumber ?? ""} />
              )}

              {international ? (
                <>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-lucathi-gray">
                      Jurisdição
                    </span>
                    <select
                      value={form.jurisdiction}
                      onChange={event =>
                        update("jurisdiction", event.target.value)
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      aria-label="Jurisdição"
                    >
                      <option value="">Selecione</option>
                      {companyJurisdictionValues.map(value => (
                        <option key={value} value={value}>
                          {companyJurisdictionLabels[value]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Agente residente"
                    value={form.residentAgent}
                    onChange={value => update("residentAgent", value)}
                  />
                </>
              ) : (
                <>
                  <Field
                    label="NIRE"
                    value={form.nire}
                    onChange={value => update("nire", value)}
                  />
                  <Field
                    label="UF"
                    value={form.uf}
                    onChange={value => update("uf", value)}
                    placeholder="SP"
                  />
                  <Field
                    label="Tipo societário"
                    value={form.societaryType}
                    onChange={value => update("societaryType", value)}
                    placeholder="Ltda, S.A., EIRELI…"
                  />
                  <Field
                    label="Regime tributário"
                    value={form.taxRegime}
                    onChange={value => update("taxRegime", value)}
                    placeholder="Lucro presumido, Lucro real…"
                  />
                </>
              )}

              <Field
                label="Sede"
                value={form.sede}
                onChange={value => update("sede", value)}
              />
              {!international ? (
                <Field
                  label="Objeto social"
                  value={form.corporatePurpose}
                  onChange={value => update("corporatePurpose", value)}
                  multiline
                />
              ) : null}
            </div>
          </Section>

          <Section title="Capital e administração">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={`Capital Social (${currency})`}
                value={form.capitalSocial}
                onChange={value => update("capitalSocial", value)}
                placeholder="0,00"
              />
              <Field
                label="Quantidade de quotas/ações"
                value={form.shareQuantity}
                onChange={value => update("shareQuantity", value)}
                placeholder="0"
              />
              <Field
                label="Administrador"
                value={form.administrator1}
                onChange={value => update("administrator1", value)}
              />
              <Field
                label="Administrador"
                value={form.administrator2}
                onChange={value => update("administrator2", value)}
              />
            </div>

            <div className="rounded-xl border border-lucathi-line bg-lucathi-mist/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
                Sócios (quadro societário)
              </p>
              {data?.stakeholders.length ? (
                <ul className="mt-2 space-y-1">
                  {data.stakeholders.map(stakeholder => (
                    <li
                      key={stakeholder.id}
                      className="flex items-center justify-between text-sm text-lucathi-navy"
                    >
                      <span>{stakeholder.displayName ?? "Sem vínculo"}</span>
                      <span className="text-xs text-lucathi-gray">
                        {Number(stakeholder.percentage).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                        %
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-lucathi-gray">
                  Nenhum sócio vinculado — cadastre no painel “Holding e
                  sociedades”.
                </p>
              )}
            </div>
          </Section>

          <Section title={`Balanço (${currency})`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {BALANCE_FIELDS.map(field => (
                <Field
                  key={field.key}
                  label={`${field.label} (${currency})`}
                  value={form[field.key]}
                  onChange={value => update(field.key, value)}
                  placeholder="0,00"
                />
              ))}
            </div>
          </Section>

          <Section
            title="Valores por quota/ação"
            hint="Calculados: capital social ÷ qtd · PL ÷ qtd · valor de mercado ÷ qtd."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <ReadonlyField
                label="Valor contábil"
                value={formatAmount(perShare.contabil, Boolean(international))}
              />
              <ReadonlyField
                label="Valor patrimonial"
                value={formatAmount(
                  perShare.patrimonial,
                  Boolean(international)
                )}
              />
              <ReadonlyField
                label="Valor de mercado"
                value={formatAmount(perShare.mercado, Boolean(international))}
              />
            </div>
          </Section>

          <Section
            title="Documentos"
            hint="Status de cada documento da holding."
          >
            <div className="space-y-2">
              {docTypes.map(docType => (
                <div
                  key={docType}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-lucathi-line px-3 py-2"
                >
                  <span className="text-sm text-lucathi-navy">
                    {companyDocLabels[docType]}
                  </span>
                  <select
                    value={docs[docType] ?? "PENDENTE"}
                    onChange={event =>
                      setDocs(previous => ({
                        ...previous,
                        [docType]: event.target.value as CompanyDocStatus,
                      }))
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    aria-label={`Status de ${companyDocLabels[docType]}`}
                  >
                    {companyDocStatusValues.map(status => (
                      <option key={status} value={status}>
                        {companyDocStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Section>

          {!international && data?.certidoes.length ? (
            <Section
              title="Certidões"
              hint="Geridas na aba Matriz Documental & Certidões (alteração restrita ao SOCIO)."
            >
              <div className="space-y-2">
                {data.certidoes.map(row => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-lucathi-line px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-lucathi-navy">
                      <Stamp className="size-3.5 text-lucathi-gray" />
                      {certidaoTypeLabels[row.type as CertidaoType] ?? row.type}
                    </span>
                    <span className="text-xs font-semibold text-lucathi-gray">
                      {certidaoStatusLabels[row.status as CertidaoStatus] ??
                        row.status}
                      {row.validUntil ? ` · válida até ${row.validUntil}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Observações">
            <Field
              label="Observações"
              value={form.notes}
              onChange={value => update("notes", value)}
              placeholder="Anotações internas sobre a holding."
              multiline
            />
          </Section>

          <DialogFooter className="gap-2 border-t border-lucathi-line pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || !company}>
              <Scale className="mr-1.5 size-4" />
              {save.isPending ? "Salvando…" : "Salvar detalhes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
