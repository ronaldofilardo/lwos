import { useRoute } from "wouter";
import { ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/lucathi/StatusBadge";
import { BrandMark } from "@/components/lucathi/BrandMark";
import { toast } from "sonner";
import { PortalDocumentRow } from "./PortalDocumentRow";

async function base64(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = () => reject(new Error("Leitura indisponível.")); reader.readAsDataURL(file); });
}

export function ClientPortalPage() {
  const [, params] = useRoute("/portal/:token"); const token = params?.token ?? "";
  const status = trpc.portal.status.useQuery({ token }, { enabled: Boolean(token), retry: false }); const utils = trpc.useUtils();
  const upload = trpc.portal.uploadDocument.useMutation({ onSuccess: () => { utils.portal.status.invalidate({ token }); toast.success("Documento enviado para análise."); }, onError: e => toast.error(e.message) });
  const select = async (documentId: string, file?: File) => { if (!file) return; await upload.mutateAsync({ token, documentId, fileName: file.name, mimeType: file.type, base64Data: await base64(file) }); };
  if (status.isLoading) return <div className="grid min-h-screen place-items-center bg-lucathi-canvas text-lucathi-gray">Carregando portal seguro…</div>;
  if (status.error || !status.data?.family) return <div className="grid min-h-screen place-items-center bg-lucathi-canvas p-6"><div className="max-w-md text-center"><BrandMark /><h1 className="mt-8 font-display text-4xl text-lucathi-navy">Link indisponível</h1><p className="mt-3 text-sm text-lucathi-gray">Este link pode ter expirado ou sido revogado. Solicite um novo acesso ao seu consultor.</p></div></div>;
  return <main className="min-h-screen bg-lucathi-canvas p-5 md:p-10"><div className="mx-auto max-w-3xl"><BrandMark /><header className="mt-10 rounded-[28px] bg-lucathi-deep p-7 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Portal do cliente</p><h1 className="mt-3 font-display text-4xl">{status.data.family.name}</h1><p className="mt-3 text-sm text-white/70">Acompanhe documentos e o status do seu projeto familiar.</p></header><section className="mt-6 rounded-2xl border border-lucathi-line bg-white p-6"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-lucathi-navy" /><div><h2 className="font-display text-2xl text-lucathi-navy">Documentos solicitados</h2><p className="text-sm text-lucathi-gray">O recebimento não significa validação. A aprovação é realizada pelo SOCIO.</p></div></div><div className="mt-5 space-y-3">{status.data.documents.map(document => <PortalDocumentRow key={document.id} document={document} onSelect={file => select(document.id, file)} />)}</div></section></div></main>;
}
