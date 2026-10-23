import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { errorMessage } from "@/lib/trpcError";
import { PropertyRow } from "./PropertyRow";
import { PropertyFormModal } from "./PropertyFormModal";

export function PropertyPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [creating, setCreating] = useState(false);

  const list = trpc.properties.list.useQuery({ familyId });
  const create = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate({ familyId });
      setCreating(false);
      toast.success("Imóvel cadastrado na Due Diligence.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          <Building2 className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">Imóveis</h2>
        </div>
      </div>

      <Button className="mt-4" onClick={() => setCreating(true)}>
        <Plus className="mr-2 size-4" /> Cadastrar Imóvel
      </Button>

      {creating ? (
        <PropertyFormModal
          title="Novo Imóvel"
          familyId={familyId}
          submitLabel="Cadastrar Imóvel"
          isPending={create.isPending}
          onClose={() => setCreating(false)}
          onSubmit={payload => create.mutate(payload)}
        />
      ) : null}

      <div className="mt-5 space-y-3">
        {list.data?.map(item => (
          <PropertyRow key={item.id} familyId={familyId} property={item} />
        ))}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhum imóvel cadastrado.</p>
        ) : null}
      </div>
    </section>
  );
}
