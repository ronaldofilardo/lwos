import { ArrowUpRight, Copy, Link2, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { projectStatusLabels, type ProjectStatus } from "../types";

type Family = {
  id: string;
  name: string;
  updatedAt: Date;
  hasClientAccess?: boolean;
  status?: ProjectStatus;
  titularName?: string | null;
  titularEmail?: string | null;
  titularPhone?: string | null;
};

const statusBadge: Record<ProjectStatus, string> = {
  ATIVO: "bg-emerald-50 text-emerald-700",
  SUSPENSO: "bg-amber-50 text-amber-700",
  CONCLUIDO: "bg-lucathi-mist text-lucathi-navy",
  CANCELADO: "bg-gray-100 text-gray-500",
};

export function FamilyTable({ families, onGenerateLink, generatedLinks, onGenerateResetLink, resetLinks }: { families: Family[]; onGenerateLink?: (familyId: string) => void; generatedLinks?: Record<string, string>; onGenerateResetLink?: (familyId: string) => void; resetLinks?: Record<string, string> }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = async (link: string, familyId: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(familyId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  if (!families.length) return <div className="rounded-xl border border-dashed border-lucathi-line p-8 text-center"><UsersRound className="mx-auto size-6 text-lucathi-gray" /><p className="mt-3 text-sm font-medium">Nenhum projeto cadastrado</p><p className="mt-1 text-sm text-lucathi-gray">Inicie o primeiro projeto pelo formulário ao lado.</p></div>;
  return <div className="overflow-x-auto rounded-xl border border-lucathi-line"><table className="w-full text-left text-sm"><thead className="bg-lucathi-mist text-xs uppercase tracking-[0.12em] text-lucathi-gray"><tr><th className="px-4 py-3">Projeto</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Nome do Cliente</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3" /></tr></thead><tbody>{families.map(family => { const isClientAccess = family.hasClientAccess; const link = !isClientAccess ? generatedLinks?.[family.id] : resetLinks?.[family.id]; const status = family.status ?? "ATIVO"; return <tr key={family.id} className="border-t border-lucathi-line"><td className="px-4 py-4 font-medium text-lucathi-navy">{family.name}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[status]}`}>{projectStatusLabels[status]}</span></td><td className="px-4 py-4 text-lucathi-navy">{family.titularName ?? "—"}</td><td className="px-4 py-4 text-lucathi-gray">{family.titularPhone ?? "—"}</td><td className="px-4 py-4 text-lucathi-gray">{family.titularEmail ?? "—"}</td><td className="px-4 py-4 text-right"><div className="flex items-center justify-end gap-1">{link ? (<span className="truncate max-w-[180px] text-xs font-mono text-lucathi-navy bg-lucathi-mist px-1.5 py-0.5 rounded" title={link}>{link}</span>) : null}{link ? (<Button size="sm" variant="ghost" onClick={() => handleCopy(link, family.id)}><Copy className="mr-1 size-3" />{copiedId === family.id ? "Copiado!" : "Copiar link"}</Button>) : (!isClientAccess && onGenerateLink ? (<Button size="sm" variant="outline" onClick={() => onGenerateLink(family.id)}><Link2 className="mr-1 size-3" />1º acesso</Button>) : isClientAccess && onGenerateResetLink ? (<Button size="sm" variant="outline" onClick={() => onGenerateResetLink(family.id)}><Link2 className="mr-1 size-3" />Redefinir senha</Button>) : null)}<Link href={`/familias/${family.id}`}><Button size="sm" variant="ghost">Abrir <ArrowUpRight className="ml-1 size-4" /></Button></Link></div></td></tr>;})}</tbody></table></div>;
}
