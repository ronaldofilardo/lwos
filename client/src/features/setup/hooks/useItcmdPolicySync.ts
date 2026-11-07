import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { UfBracketFormData } from "../types";
import { errorMessage } from "@/lib/trpcError";

interface Props {
  selectedUf: string;
}

export function useItcmdPolicySync({ selectedUf }: Props) {
  const utils = trpc.useUtils();
  const summariesQuery = trpc.setup.itcmd.listUfs.useQuery();
  const ufQuery = trpc.setup.itcmd.getByUf.useQuery({ uf: selectedUf });

  const saveMutation = trpc.setup.itcmd.updatePolicy.useMutation({
    onSuccess: () => {
      toast.success(`Políticas de ITCMD para ${selectedUf} salvas com sucesso!`);
      utils.setup.itcmd.listUfs.invalidate();
      utils.setup.itcmd.getByUf.invalidate({ uf: selectedUf });
    },
    onError: (err) => toast.error(`Erro ao salvar: ${err.message}`),
  });

  const serverBrackets = ufQuery.data?.brackets ?? [];
  const initialUnitName = serverBrackets[0]?.indexedUnitName ?? "";
  const initialUnitValue = serverBrackets[0]?.indexedUnitValue
    ? String(serverBrackets[0].indexedUnitValue)
    : "";

  const handleSavePolicy = (
    brackets: UfBracketFormData[],
    unitName: string,
    unitValue: string
  ) => {
    const payload = brackets.map((b, idx) => ({
      bracketOrder: idx + 1,
      limitValue: b.limitValue,
      rate: b.rate,
      accumulatedTax: 0,
      deductionValue: 0,
      indexedUnitName: unitName.trim() || null,
      indexedUnitValue: parseFloat(unitValue) || null,
    }));
    saveMutation.mutate({ uf: selectedUf, brackets: payload });
  };

  return {
    summaries: summariesQuery.data ?? [],
    serverBrackets,
    initialUnitName,
    initialUnitValue,
    saveMutation,
    handleSavePolicy,
  };
}
