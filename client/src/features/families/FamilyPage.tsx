import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { FamilyForm } from "./common/FamilyForm";
import { FamilyTable } from "./common/FamilyTable";
import { useFamilies } from "./hooks/useFamilies";
import { useFamilyForm } from "./hooks/useFamilyForm";

export function FamilyPage() {
  const { user } = useAuth();
  const { families, loading, createFamily, creating, generateFirstAccessLink, generatePasswordResetLink } = useFamilies();
  const form = useFamilyForm(createFamily);
  const canCreate = user?.role === "SOCIO" || user?.role === "ANALISTA";
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [resetLinks, setResetLinks] = useState<Record<string, string>>({});
  const handleGenerateLink = async (familyId: string) => {
    const result = await generateFirstAccessLink.mutateAsync({ familyId });
    const link = `${window.location.origin}/primeiro-acesso?token=${result.token}`;
    setGeneratedLinks(prev => ({ ...prev, [familyId]: link }));
  };
  const handleGenerateResetLink = async (familyId: string) => {
    const result = await generatePasswordResetLink.mutateAsync({ familyId });
    const link = `${window.location.origin}/primeiro-acesso?token=${result.token}`;
    setResetLinks(prev => ({ ...prev, [familyId]: link }));
  };
  return <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]"><aside className="rounded-2xl bg-lucathi-deep p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Novo projeto</p><h1 className="mt-3 font-display text-4xl">Família</h1><p className="mt-3 text-sm leading-6 text-white/70">O nome da família será o título do projeto em toda a plataforma.</p><div className="mt-8 rounded-xl bg-white/8 p-4"><Plus className="mb-3 size-5" /><p className="text-sm font-medium">Cadastro controlado</p><p className="mt-1 text-xs leading-5 text-lucathi-gray">As regras patrimoniais ainda não definidas serão mantidas como TBD.</p></div></aside><div className="space-y-6"><section className="rounded-2xl border border-lucathi-line bg-white p-6"><h2 className="font-display text-2xl text-lucathi-navy">Criar uma família</h2><p className="mt-3 text-sm text-lucathi-gray">Situação conjugal e regime são registrados sem inferir efeitos patrimoniais.</p><div className="mt-5">{canCreate ? <FamilyForm data={form.data} onChange={form.setData} onSubmit={form.submit} disabled={creating || form.submitting} /> : <p className="rounded-lg bg-lucathi-mist p-4 text-sm text-lucathi-gray">Seu papel atual permite consulta; o cadastro é realizado por SOCIO ou ANALISTA.</p>}</div></section><section className="rounded-2xl border border-lucathi-line bg-white p-6"><h2 className="font-display text-2xl text-lucathi-navy">Famílias em acompanhamento</h2><div className="mt-5">{loading ? <p className="text-sm text-lucathi-gray">Carregando famílias…</p> : <FamilyTable families={families} onGenerateLink={handleGenerateLink} generatedLinks={generatedLinks} onGenerateResetLink={handleGenerateResetLink} resetLinks={resetLinks} />}</div></section></div></section>;
}
