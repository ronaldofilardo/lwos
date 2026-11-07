import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import type { AppRole } from "@shared/domain/roles";

/**
 * Guarda de rotas por papel: renderiza só para quem está na lista `allow` e
 * redireciona para a home quem está fora dela (acesso direto pela URL).
 * Uso: dentro de <AuthGate>, ex. <RoleGate allow={["ADMIN"]}>…</RoleGate>.
 */
export function RoleGate({
  allow,
  children,
}: {
  allow: readonly AppRole[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const allowed = Boolean(user) && allow.includes(user!.role);

  useEffect(() => {
    if (!loading && user && !allowed) navigate("/", { replace: true });
  }, [loading, user, allowed, navigate]);

  if (loading || !allowed) return null;
  return <>{children}</>;
}
