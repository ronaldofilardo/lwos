import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useMemo, useState } from "react";

export function useAuth() {
  const utils = trpc.useUtils();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return;
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setAuthPending(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAuthError(data.error ?? "Falha no login.");
          return false;
        }
        await utils.auth.me.invalidate();
        return true;
      } finally {
        setAuthPending(false);
      }
    },
    [utils],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthError(null);
      setAuthPending(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAuthError(data.error ?? "Falha no cadastro.");
          return false;
        }
        await utils.auth.me.invalidate();
        return true;
      } finally {
        setAuthPending(false);
      }
    },
    [utils],
  );

  const state = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending],
  );

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    login,
    register,
    authError,
    authPending,
  };
}
