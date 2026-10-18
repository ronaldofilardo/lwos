import { Stamp } from "lucide-react";
import {
  certidaoStatusLabels,
  certidaoTypeLabels,
  type CertidaoStatus,
  type CertidaoType,
} from "@/features/certidoes/types";
import { Section } from "./common/CompanyFormField";

type CertidaoSummary = {
  id: string;
  type: string;
  status: string;
  validUntil: string | null;
};

export function CompanyCertidaoList({
  certidoes,
}: {
  certidoes: CertidaoSummary[];
}) {
  if (!certidoes.length) return null;
  return (
    <Section
      title="Certidões"
      hint="Geridas na aba Matriz Documental & Certidões (alteração restrita ao SOCIO)."
    >
      <div className="space-y-2">
        {certidoes.map(row => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-lucathi-line px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm text-lucathi-navy">
              <Stamp className="size-3.5 text-lucathi-gray" />
              {certidaoTypeLabels[row.type as CertidaoType] ?? row.type}
            </span>
            <span className="text-xs font-semibold text-lucathi-gray">
              {certidaoStatusLabels[row.status as CertidaoStatus] ?? row.status}
              {row.validUntil ? ` · válida até ${row.validUntil}` : ""}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
