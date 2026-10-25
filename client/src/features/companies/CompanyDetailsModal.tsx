import { toast } from "sonner";
import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";
import { useCepLookup } from "@/shared/hooks/useCepLookup";
import {
  computePerShare,
  emptyHoldingForm,
  holdingFormFromDetails,
  holdingFormToFields,
  holdingTotalsFromForm,
  type HoldingFormState,
} from "./holdingDetails";
import { CompanyPerShareBox } from "./CompanyPerShareBox";
import { CompanyModalHeader } from "./CompanyModalHeader";
import { CompanyBasicInfoForm } from "./CompanyBasicInfoForm";
import { CompanyAddressFields } from "./CompanyAddressFields";
import { CompanyCapitalFields } from "./CompanyCapitalFields";
import { CompanyShareholdersTable } from "./CompanyShareholdersTable";
import { CompanyBalanceSection } from "./CompanyBalanceSection";
import { CompanyCertidaoList } from "./CompanyCertidaoList";
import { CompanyModalActions } from "./CompanyModalActions";
import { Field, Section } from "./common/CompanyFormField";

type ModalProps = {
  familyId: string;
  companyId: string | null;
  onClose: () => void;
};

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

  const data = query.data;
  const company = data?.company;
  const international = company?.isOffshore === true;
  const currency = international ? "$" : "R$";
  const totals = holdingTotalsFromForm(form);
  const perShare = computePerShare(form);

  useEffect(() => {
    if (!data) return;
    setForm(holdingFormFromDetails(data.details));
  }, [data]);

  const save = trpc.companies.upsertDetails.useMutation({
    onSuccess: () => {
      utils.companies.getDetails.invalidate();
      utils.companies.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      toast.success("Detalhes da holding salvos.");
      onClose();
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const { lookupCep, loading: loadingCep } = useCepLookup();
  const update = (key: keyof HoldingFormState, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));
  const updateMultiple = (patch: Partial<HoldingFormState>) =>
    setForm(previous => ({ ...previous, ...patch }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!companyId || !company) return;
    save.mutate({ companyId, fields: holdingFormToFields(form) });
  };

  return (
    <Dialog
      open={enabled}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <CompanyModalHeader
          legalName={company?.legalName ?? null}
          taxNumber={company?.taxNumber ?? null}
          international={international}
        />
        {query.isLoading ? (
          <p className="text-sm text-lucathi-gray">Carregando ficha…</p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Identificação">
            <div className="grid gap-3 sm:grid-cols-2">
              <CompanyBasicInfoForm
                international={international}
                legalName={company?.legalName ?? null}
                taxNumber={company?.taxNumber ?? null}
                form={form}
                update={update}
              />
              {!international ? (
                <CompanyAddressFields
                  form={form}
                  update={update}
                  updateMultiple={updateMultiple}
                  lookupCep={lookupCep}
                  loadingCep={loadingCep}
                />
              ) : null}
            </div>
          </Section>
          <Section title="Capital e administração">
            <CompanyCapitalFields
              currency={currency}
              international={international}
              form={form}
              update={update}
              people={data?.people ?? []}
            />
            <CompanyShareholdersTable
              stakeholders={data?.stakeholders ?? []}
              totals={totals}
              international={international}
            />
          </Section>
          <Section title={`Balanço (${currency})`}>
            <CompanyBalanceSection
              currency={currency}
              estimatedValue={totals.estimatedValue}
              form={form}
              update={update}
            />
          </Section>
          <CompanyPerShareBox values={perShare} international={international} />
          {!international ? (
            <CompanyCertidaoList certidoes={data?.certidoes ?? []} />
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
          <CompanyModalActions
            onClose={onClose}
            disabled={!company}
            isPending={save.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
