import { ArrowUpRight, Copy, Link2, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { civilStatusLabels, maritalRegimeLabels, type CivilStatus, type MaritalRegime } from "../types";

type Family = { id: string; name: string; civilStatus: CivilStatus; maritalRegime: MaritalRegime; updatedAt: Date; hasClientAccess?: boolean };

export function FamilyTable({ families, onGenerateLink, generatedLinks }: { families: Family[]; onGenerateLink?: (familyId: string) => void; generatedLinks?: Record<string, string> }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = async (link: string, familyId: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(familyId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  if (!families.length) return <div className="rounded-xl border border-dashed border-lucathi-line p-8 text-center"><UsersRound className="mx-auto size-6 text-lucathi-gray" /><p className="mt-3 text-sm font-medium">Nenhuma família cadastrada</p><p className="mt-1 text-sm text-lucathi-gray">Inicie o primeiro projeto pela família.</p></div>;
  return <div className="overflow-hidden rounded-xl border border-lucathi-line"><table className="w-full text-left text-sm"><thead className="bg-lucathi-mist text-xs uppercase tracking-[0.12em] text-lucathi-gray"><tr><th className="px-4 py-3">Família</th><th className="hidden px-4 py-3 md:table-cell">Situação</th><th className="hidden px-4 py-3 lg:table-cell">Regime</th><th className="px-4 py-3" /></tr></thead><tbody>{families.map(family => { const link = !family.hasClientAccess ? generatedLinks?.[family.id] : undefined; return <tr key={family.id} className="border-t border-lucathi-line"><td className="px-4 py-4 font-medium text-lucathi-navy">{family.name}</td><td className="hidden px-4 py-4 text-lucathi-gray md:table-cell">{civilStatusLabels[family.civilStatus]}</td><td className="hidden px-4 py-4 text-lucathi-gray lg:table-cell">{maritalRegimeLabels[family.maritalRegime]}</td><td className="px-4 py-4 text-right"><div className="flex items-center justify-end gap-1">{link ? (<span className="truncate max-w-[180px] text-xs font-mono text-lucathi-navy bg-lucathi-mist px-1.5 py-0.5 rounded" title={link}>{link}</span>) : null}{link ? (<Button size="sm" variant="ghost" onClick={() => handleCopy(link, family.id)}><Copy className="mr-1 size-3" />{copiedId === family.id ? "Copiado!" : "Copiar link"}</Button>) : (onGenerateLink && !family.hasClientAccess ? (<Button size="sm" variant="outline" onClick={() => onGenerateLink(family.id)}><Link2 className="mr-1 size-3" />1º acesso</Button>) : null)}<Link href={`/familias/${family.id}`}><Button size="sm" variant="ghost">Abrir <ArrowUpRight className="ml-1 size-4" /></Button></Link></div></td></tr>;})}</tbody></table></div>;
}
