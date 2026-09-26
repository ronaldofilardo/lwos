import { Building2, FileText, LayoutDashboard, UsersRound } from "lucide-react";

export const navigationItems = [
  { label: "Visão geral", path: "/", icon: LayoutDashboard },
  { label: "Famílias", path: "/familias", icon: UsersRound },
  { label: "Patrimônio", path: "/patrimonio", icon: Building2 },
  { label: "Relatórios", path: "/relatorios", icon: FileText },
] as const;
