import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import type { AddressLookupResult } from "../../../../server/features/address/viacep-types";

export type { AddressLookupResult };

export function useCepLookup() {
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const lookupCep = async (
    rawCep: string,
    onFound?: (address: AddressLookupResult) => void
  ): Promise<AddressLookupResult | null> => {
    const cleanCep = rawCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    setLoading(true);
    try {
      const address = await utils.address.lookupCep.fetch({ cep: cleanCep });
      if (!address) {
        toast.info("CEP não localizado. Preencha o endereço manualmente.");
        return null;
      }
      onFound?.(address);
      return address;
    } catch {
      toast.warning("Não foi possível consultar o CEP automaticamente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookupCep, loading };
}
