import { Building2, FileText, LayoutDashboard, UsersRound } from "lucide-react";

export const navigationItems = [
  { label: "Visão geral", path: "/", icon: LayoutDashboard },
  { label: "Famílias", path: "/familias", icon: UsersRound },
  { label: "Patrimônio", path: "/patrimonio", icon: Building2 },
  { label: "Relatórios", path: "/relatorios", icon: FileText },
] as const;

/** Sidebar do titular (CLIENTE): só o essencial, sem módulos da equipe. */
export const clientNavigationItems = [
  { label: "Início", path: "/dashboard", icon: LayoutDashboard },
  { label: "Minha família", path: "/minha-familia", icon: UsersRound },
] as const;
