import { Building2, FileText, LayoutDashboard, UsersRound, Cake } from "lucide-react";

export const navigationItems = [
  { label: "Visão geral", path: "/", icon: LayoutDashboard },
  { label: "Projetos", path: "/familias", icon: UsersRound },
  { label: "Patrimônio", path: "/patrimonio", icon: Building2 },
  { label: "Relatórios", path: "/relatorios", icon: FileText },
  { label: "Aniversários", path: "/aniversarios", icon: Cake },
] as const;

/** Sidebar do titular (CLIENTE): só o essencial, sem módulos da equipe. */
export const clientNavigationItems = [
  { label: "Início", path: "/dashboard", icon: LayoutDashboard },
  { label: "Minha família", path: "/minha-familia", icon: UsersRound },
] as const;
