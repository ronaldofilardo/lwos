import {
  BellRing,
  LogOut,
  Shield,
  UsersRound,
  LayoutDashboard,
  UserPlus,
  Settings2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./BrandMark";
import { navigationItems, clientNavigationItems } from "./navigation";
import { isClient, canManage, isPlatformAdmin } from "@shared/domain/permissions";
import { hasBirthdaysThisWeek } from "@/features/birthdays/birthday-utils";
import { MobileNavSheet } from "./MobileNavSheet";
export function AppShell({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const [pathname] = useLocation();
  const { user, logout } = useAuth();
  const birthdays = trpc.birthdays.list.useQuery(undefined, {
    enabled: user?.role === "SOCIO",
    refetchInterval: 60 * 60 * 1000,
  });
  const hasWeeklyBirthdays = hasBirthdaysThisWeek(birthdays.data ?? []);
  const [matchFamily, paramsFamily] = useRoute("/familias/:familyId");
  const [matchClientFamily, paramsClientFamily] = useRoute("/minha-familia/:familyId");
  const familyId = matchFamily ? (paramsFamily?.familyId ?? "") : matchClientFamily ? (paramsClientFamily?.familyId ?? "") : "";
  const family = trpc.families.get.useQuery({ familyId }, { enabled: Boolean(familyId) });
  const projectTitle = family.data?.name;
  const canManageProjects = canManage(user?.role);
  const navItems = isClient(user?.role)
    ? clientNavigationItems
    : navigationItems.filter(item => {
        if (item.path === "/aniversarios") return user?.role === "SOCIO";
        if (item.path === "/familias") return canManageProjects;
        return true;
      });
  const [homeItem, ...otherNavItems] = navItems;
  return (
    <div className="min-h-screen bg-lucathi-canvas text-lucathi-ink">
      {!isClient(user?.role) && (
        <aside className="fixed inset-y-0 hidden w-64 border-r border-lucathi-line bg-white px-5 py-7 lg:block">
          <BrandMark />
          {projectTitle ? <div className="mt-8 rounded-xl bg-lucathi-mist px-3 py-2"><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-lucathi-gray font-subtitle">Projeto ativo</p><p className="mt-1 truncate text-sm font-medium text-lucathi-navy">{projectTitle}</p></div> : null}
          <nav className="mt-12 space-y-1" aria-label="Navegação principal">
            <Button key={homeItem.path} variant="ghost" onClick={() => navigate(homeItem.path)} className={`w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy ${pathname === homeItem.path ? "bg-lucathi-mist font-semibold text-lucathi-navy" : ""}`} aria-current={pathname === homeItem.path ? "page" : undefined}>
              <homeItem.icon className="size-4" />
              {homeItem.label}
            </Button>
            {canManage(user?.role) ? <Button variant="ghost" onClick={() => navigate("/dashboard")} className={`w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy ${pathname === "/dashboard" ? "bg-lucathi-mist font-semibold text-lucathi-navy" : ""}`} aria-current={pathname === "/dashboard" ? "page" : undefined}><LayoutDashboard className="size-4" />Dashboard</Button> : null}
            {canManage(user?.role) ? <Button variant="ghost" onClick={() => navigate("/interessados")} className={`w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy ${pathname === "/interessados" ? "bg-lucathi-mist font-semibold text-lucathi-navy" : ""}`} aria-current={pathname === "/interessados" ? "page" : undefined}><UserPlus className="size-4" />Interessados</Button> : null}
            {(isPlatformAdmin(user?.role) || user?.role === "SOCIO") ? <Button variant="ghost" onClick={() => navigate("/setup")} className={`w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy ${pathname === "/setup" ? "bg-lucathi-mist font-semibold text-lucathi-navy" : ""}`} aria-current={pathname === "/setup" ? "page" : undefined}><Settings2 className="size-4" />Setup</Button> : null}
            {otherNavItems.map(item => (
              <Button key={item.path} variant="ghost" onClick={() => navigate(item.path)} className={`w-full justify-start gap-3 text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy ${pathname === item.path ? "bg-lucathi-mist font-semibold text-lucathi-navy" : ""}`} aria-current={pathname === item.path ? "page" : undefined}>
                <item.icon className="size-4" />
                {item.label}
                {item.path === "/aniversarios" &&
                user?.role === "SOCIO" &&
                hasWeeklyBirthdays ? (
                  <span
                    className="ml-auto text-status-warning-text"
                    aria-label="Há aniversariantes esta semana"
                    role="img"
                    title="Há aniversariantes esta semana"
                  >
                    <BellRing className="size-4" aria-hidden={true} />
                  </span>
                ) : null}
              </Button>
            ))}
          </nav>
          <div className="absolute inset-x-5 bottom-7 rounded-2xl bg-lucathi-deep p-4 text-white">
            <Shield className="mb-3 size-4 text-white/70" />
            <p className="text-sm font-medium">Ambiente confidencial</p>
            <p className="mt-1 text-xs text-white/65">Acesso e ações auditados.</p>
          </div>
        </aside>
      )}
      <main className={!isClient(user?.role) ? "lg:ml-64" : ""}>
        <header className="flex min-h-20 items-center justify-between border-b border-lucathi-line bg-white/85 px-5 backdrop-blur lg:px-10">
          <MobileNavSheet user={user ?? null} />
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
