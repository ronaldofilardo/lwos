import { useRef } from "react";
import { FileUp } from "lucide-react";
import { StatusBadge } from "@/components/lucathi/StatusBadge";

type Document = { id: string; category: string; currentVersion: number; status: string };

export function PortalDocumentRow({ document, onSelect }: { document: Document; onSelect: (file?: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lucathi-line p-4"><div><p className="text-sm font-medium">{document.category}</p><p className="text-xs text-lucathi-gray">Versão atual: {document.currentVersion || "não enviada"}</p></div><div className="flex items-center gap-2"><StatusBadge status={document.status} /><input ref={fileRef} className="hidden" type="file" onChange={e => onSelect(e.target.files?.[0])} /><button onClick={() => fileRef.current?.click()} className="grid size-9 place-items-center rounded-md border border-lucathi-line text-lucathi-navy" aria-label={`Enviar ${document.category}`}><FileUp className="size-4" /></button></div></div>;
}
