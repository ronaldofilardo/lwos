import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export function CompanyBalanceUpload({
  familyId,
  companyId,
  category,
  label,
}: {
  familyId: string;
  companyId: string;
  category: "Balanço Fechado" | "Balancete Atualizado";
  label: string;
}) {
  const utils = trpc.useUtils();
  const [referenceDate, setReferenceDate] = useState("");
  const [fileName, setFileName] = useState("");
  const [base64, setBase64] = useState("");

  const upload = trpc.documents.uploadBalance.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ familyId });
      setFileName("");
      setBase64("");
      toast.success(`${category} enviado.`);
    },
    onError: error => toast.error(errorMessage(error)),
  });

  return (
    <div className="grid items-end gap-2 rounded-lg border border-lucathi-line/60 p-3 sm:grid-cols-[1fr_10rem_auto]">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-lucathi-gray">{label}</span>
        <input
          type="file"
          className="block w-full text-xs"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setBase64(await toBase64(file));
          }}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-lucathi-gray">Data-base</span>
        <Input
          type="date"
          value={referenceDate}
          onChange={event => setReferenceDate(event.target.value)}
          className="h-9"
        />
      </label>
      <Button
        size="sm"
        variant="outline"
        disabled={!base64 || !referenceDate || upload.isPending}
        onClick={() =>
          upload.mutate({
            familyId,
            companyId,
            category,
            referenceDate,
            fileName,
            base64Data: base64,
          })
        }
      >
        <Upload className="mr-1 size-3.5" />
        Enviar
      </Button>
    </div>
  );
}
