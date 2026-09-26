import { LogOut, Menu, Shield, UsersRound, LayoutDashboard, UserPlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./BrandMark";
import { navigationItems } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation(); const { user, logout } = useAuth();
  const [matchFamily, paramsFamily] = useRoute("/familias/:familyId");
  const familyId = matchFamily ? (paramsFamily?.familyId ?? "") : "";
  const family = trpc.families.get.useQuery({ familyId }, { enabled: Boolean(familyId) });
  const projectTitle = family.data?.name;
  return (
    <div className="min-h-screen bg-lucathi-canvas text-lucathi-ink">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-lucathi-line bg-white px-5 py-7 lg:block">
        <BrandMark />
        {projectTitle ? <div className="mt-8 rounded-xl bg-lucathi-mist px-3 py-2"><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-lucathi-gray">Projeto ativo</p><p className="mt-1 truncate text-sm font-medium text-lucathi-navy">{projectTitle}</p></div> : null}
        <nav className="mt-12 space-y-1" aria-label="Navegação principal">
          {user?.role === "SOCIO" || user?.role === "ADMIN" ? <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy"><LayoutDashboard className="size-4" />Dashboard</Button> : null}
          {user?.role === "SOCIO" || user?.role === "ADMIN" ? <Button variant="ghost" onClick={() => navigate("/interessados")} className="w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy"><UserPlus className="size-4" />Interessados</Button> : null}
          {navigationItems.map(item => (
            <Button key={item.path} variant="ghost" onClick={() => navigate(item.path === "/" && user?.role === "CLIENTE" ? "/dashboard" : item.path)} className="w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy">
              <item.icon className="size-4" />{item.label}
            </Button>
          ))}
        </nav>
        <div className="absolute inset-x-5 bottom-7 rounded-2xl bg-lucathi-deep p-4 text-white">
          <Shield className="mb-3 size-4 text-white/70" />
          <p className="text-sm font-medium">Ambiente confidencial</p>
          <p className="mt-1 text-xs text-white/65">Acesso e ações auditados.</p>
        </div>
      </aside>
      <main className="lg:ml-64">
        <header className="flex min-h-20 items-center justify-between border-b border-lucathi-line bg-white/85 px-5 backdrop-blur lg:px-10">
          <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="size-5" /></Button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right"><p className="text-sm font-medium">{user?.name || "Usuário"}</p><p className="text-xs text-lucathi-gray">{user?.role || "CLIENTE"}</p></div>
            <Button variant="outline" size="icon" onClick={logout} aria-label="Sair"><LogOut className="size-4" /></Button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
