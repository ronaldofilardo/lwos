import { useState } from "react";
import { Copy, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function PortalPanel({ familyId }: { familyId: string }) {
  const [url, setUrl] = useState("");
  const utils = trpc.useUtils();
  const create = trpc.portal.createLink.useMutation({ onSuccess: value => { setUrl(value.url); toast.success("Link gerado. Envie-o externamente ao cliente."); }, onError: e => toast.error(e.message) });
  const links = trpc.portal.listLinks.useQuery({ familyId });
  const revoke = trpc.portal.revokeLink.useMutation({ onSuccess: () => { utils.portal.listLinks.invalidate({ familyId }); toast.success("Link revogado."); }, onError: e => toast.error(e.message) });
  const copy = async () => { await navigator.clipboard.writeText(url); toast.success("Link copiado."); };
  return <section className="rounded-2xl border border-lucathi-line bg-white p-6"><div className="flex items-center gap-3"><Link2 className="size-5 text-lucathi-navy" /><div><h2 className="font-display text-2xl text-lucathi-navy">Portal do cliente</h2><p className="text-sm text-lucathi-gray">O sistema gera; o SOCIO envia por canal externo.</p></div></div><Button className="mt-4" disabled={create.isPending} onClick={() => create.mutate({ familyId, origin: window.location.origin })}>Gerar link de acesso</Button>{url ? <div className="mt-4 flex items-center gap-2 rounded-xl bg-lucathi-mist p-3"><p className="truncate text-xs">{url}</p><Button size="icon" variant="outline" onClick={copy} aria-label="Copiar link"><Copy className="size-4" /></Button></div> : null}<div className="mt-4 space-y-2">{links.data?.map(link => <div key={link.id} className="flex items-center justify-between rounded-lg bg-lucathi-mist px-3 py-2 text-xs"><span>{link.revokedAt ? "Revogado" : `Expira em ${new Date(link.expiresAt).toLocaleDateString("pt-BR")}`}</span>{!link.revokedAt ? <Button size="sm" variant="ghost" disabled={revoke.isPending} onClick={() => revoke.mutate({ linkId: link.id })}><X className="mr-1 size-3" />Revogar</Button> : null}</div>)}</div></section>;
}
