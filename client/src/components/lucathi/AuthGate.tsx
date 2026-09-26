import { ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "./BrandMark";

function LoginForm() {
  const { login, register, authError, authPending, refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok =
      mode === "login" ? await login(email, password) : await register(name, email, password);
    if (ok) await refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-lucathi-canvas p-6">
      <section className="w-full max-w-md rounded-[28px] border border-lucathi-line bg-white p-8 shadow-xl shadow-lucathi-deep/5">
        <BrandMark />
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-lucathi-gray">
          Wealth & Legacy Engineering
        </p>
        <h1 className="mt-3 font-display text-4xl text-lucathi-navy">Acesso reservado</h1>
        <p className="mt-4 text-sm leading-6 text-lucathi-gray">
          Entre para acessar informações familiares, patrimoniais e documentais em um ambiente protegido.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {authError && <p className="text-sm text-red-600">{authError}</p>}

          <Button type="submit" className="w-full bg-lucathi-deep hover:bg-lucathi-navy" disabled={authPending}>
            <ShieldCheck className="mr-2 size-4" />
            {mode === "login" ? "Entrar com segurança" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-xs text-lucathi-gray underline underline-offset-2"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Ainda não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>

        <a href="/interesse" className="mt-3 block text-xs text-lucathi-gray underline underline-offset-2">
          Ainda não é cliente? Tenho interesse em conhecer a Lucathi
        </a>
      </section>
    </main>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center overflow-hidden bg-lucathi-deep p-6 text-white">
        <section className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] p-10 shadow-2xl">
          <div className="absolute -right-14 -top-14 size-52 rotate-45 border border-white/10" />
          <img
            src="/lucathi-logo.png"
            alt="Lucathi Consult"
            className="h-12 w-auto object-contain object-left"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="mt-14 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Ambiente confidencial
          </p>
          <h1 className="mt-3 font-display text-4xl">Preparando o seu acesso.</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Verificando permissões e preservando a integridade das informações familiares.
          </p>
          <div className="mt-8 h-px w-24 bg-white/35" />
        </section>
      </main>
    );
  if (isAuthenticated) return <>{children}</>;
  return <LoginForm />;
}
