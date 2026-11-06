import { Cake, FileText, Home, LayoutDashboard, UsersRound } from "lucide-react";

export const navigationItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Projetos", path: "/familias", icon: UsersRound },
  { label: "Relatórios", path: "/relatorios", icon: FileText },
  { label: "Aniversários", path: "/aniversarios", icon: Cake },
] as const;

/** Sidebar do titular (CLIENTE): só o essencial, sem módulos da equipe. */
export const clientNavigationItems = [
  { label: "Início", path: "/dashboard", icon: LayoutDashboard },
  { label: "Minha família", path: "/minha-familia", icon: UsersRound },
] as const;
