import { UsersRound, FileStack, FolderKanban, HardDrive, Folder, type LucideIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import ClientFamilyDashboard from "./ClientFamilyDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "CLIENTE") return <ClientFamilyDashboard />;
  return <TeamDashboard />;
}

function TeamDashboard() {
  const dashboard = trpc.families.getDashboard.useQuery();
  const storage = trpc.families.listStorage.useQuery();

  if (dashboard.isLoading || storage.isLoading) return <div className="p-8 text-center text-lucathi-gray">Carregando dashboard…</div>;
  if (dashboard.isError) return <div className="p-8 text-center text-red-500">Erro ao carregar dashboard</div>;

  const { totalFamilies, totalPeople, totalDocuments, families } = dashboard.data ?? { totalFamilies: 0, totalPeople: 0, totalDocuments: 0, families: [] };

  const storageBytes = storage.data ? storage.data.reduce((acc: number, f: { isDirectory: boolean; size: number }) => acc + (f.isDirectory ? 0 : f.size), 0) : 0;
  const storageLabel = storage.data && storage.data.length ? `${(storageBytes / 1024).toFixed(1)} KB` : "—";

  return <section className="space-y-8">
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard label="Famílias" value={String(totalFamilies)} icon={FolderKanban} />
      <MetricCard label="Pessoas" value={String(totalPeople)} icon={UsersRound} />
      <MetricCard label="Documentos" value={String(totalDocuments)} icon={FileStack} />
      <MetricCard label="Armazenamento" value={storageLabel} icon={HardDrive} />
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <FamiliesList families={families} />
      <StorageList files={storage.data ?? []} />
    </div>
  </section>;
}

function FamiliesList({ families }: { families: { id: string; name: string; peopleCount: number; documentsCount: number }[] }) {
  return <div className="rounded-2xl border border-lucathi-line bg-white p-6">
    <h2 className="font-display text-2xl text-lucathi-navy">Famílias</h2>
    <div className="mt-4 space-y-3">
      {families.length ? families.map(f => <FamilyRow key={f.id} family={f} />) : <p className="text-sm text-lucathi-gray">Nenhuma família cadastrada</p>}
    </div>
  </div>;
}

function FamilyRow({ family }: { family: { id: string; name: string; peopleCount: number; documentsCount: number } }) {
  return <div className="flex items-center justify-between rounded-xl border border-lucathi-line p-4">
    <div>
      <Link href={`/familias/${family.id}`} className="text-sm font-medium text-lucathi-navy hover:underline">{family.name}</Link>
      <p className="text-xs text-lucathi-gray">{family.peopleCount} pessoas · {family.documentsCount} documentos</p>
    </div>
    <Button asChild size="sm" variant="ghost">
      <Link href={`/familias/${family.id}`}>Abrir</Link>
    </Button>
  </div>;
}

function StorageList({ files }: { files: { path: string; size: number; isDirectory: boolean }[] }) {
  return <div className="rounded-2xl border border-lucathi-line bg-white p-6">
    <h2 className="font-display text-2xl text-lucathi-navy">Armazenamento Local</h2>
    <div className="mt-4 space-y-3">
      {files.length ? files.map((f, i) => <StorageRow key={i} file={f} />) : <p className="text-sm text-lucathi-gray">Nenhum arquivo no storage.</p>}
    </div>
  </div>;
}

function StorageRow({ file }: { file: { path: string; size: number; isDirectory: boolean } }) {
  return <div className="flex items-center justify-between rounded-xl border border-lucathi-line p-4">
    <div className="flex items-center gap-2"><Folder className="size-4 text-lucathi-navy" /><span className="text-sm font-medium">{file.path}</span></div>
    <span className="text-xs text-lucathi-gray">{file.isDirectory ? "pasta" : `${(file.size / 1024).toFixed(1)} KB`}</span>
  </div>;
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="rounded-2xl border border-lucathi-line bg-white p-6"><div className="flex items-center gap-3"><Icon className="size-6 text-lucathi-navy" /><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-lucathi-gray">{label}</p><p className="text-3xl font-display text-lucathi-navy">{value}</p></div></div></div>;
}
