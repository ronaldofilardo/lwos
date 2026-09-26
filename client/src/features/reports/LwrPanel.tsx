import { useState } from "react";
import { ExternalLink, FileText, Presentation, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function LwrPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [structure, setStructure] = useState("");
  const [canvaUrl, setCanvaUrl] = useState("");
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 10));

  const list = trpc.lwr.list.useQuery({ familyId });
  const create = trpc.lwr.create.useMutation({
    onSuccess: () => {
      utils.lwr.list.invalidate({ familyId });
      setStructure("");
      setCanvaUrl("");
      toast.success("Versão do Lucathi Wealth Report (LWR) registrada.");
    },
    onError: (e) => toast.error(e.message),
  });

  const ready = structure.trim().length >= 10;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          <Presentation className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">LWR — Lucathi Wealth Report</h2>
          <p className="text-sm text-lucathi-gray">
            Apresentação executiva personalizada (Taylor-made / Canva) com diagnóstico, fragilidades e estrutura proposta.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-lucathi-line p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lucathi-gray">
          Registrar Versão do LWR (Apresentação Taylor-Made)
        </p>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="text-sm"
            />
            <Input
              value={canvaUrl}
              onChange={(e) => setCanvaUrl(e.target.value)}
              placeholder="Link da Apresentação no Canva (https://canva.com/...)"
              className="text-sm"
            />
          </div>
          <Textarea
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            placeholder="Síntese da Estrutura Proposta & Fragilidades Mitigadas (ex: Criação de Holding Pura, doação com reserva de usufruto e cláusulas restritivas de inalienabilidade, incomunicabilidade e impenhorabilidade)..."
            rows={3}
            className="text-sm"
          />
          <Button
            disabled={!ready || create.isPending}
            onClick={() =>
              create.mutate({
                familyId,
                baseDate,
                proposedStructure: structure.trim(),
                canvaUrl: canvaUrl.trim() || undefined,
              })
            }
          >
            <Sparkles className="mr-2 size-4" /> Registrar Versão Executiva do LWR
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {list.data?.map((item) => (
          <article key={item.id} className="rounded-xl bg-lucathi-mist/70 p-4 transition-all">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-lucathi-line/50 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lucathi-navy">
                  LWR · Versão {item.version}
                </span>
                <span className="rounded-full bg-lucathi-deep/10 px-2.5 py-0.5 text-xs text-lucathi-deep font-medium">
                  Data-base: {new Date(item.baseDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {item.canvaUrl ? (
                <a
                  href={item.canvaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lucathi-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-lucathi-navy/90 transition-colors"
                >
                  <ExternalLink className="size-3.5" /> Abrir no Canva
                </a>
              ) : null}
            </header>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
                Diagnóstico e Estrutura Proposta
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-lucathi-navy">
                {item.proposedStructure}
              </p>
            </div>
          </article>
        ))}

        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhuma versão de LWR registrada ainda.</p>
        ) : null}
      </div>
    </section>
  );
}
