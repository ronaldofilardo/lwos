import { useState } from "react";
import { AlertCircle, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function PrimeiroAcesso() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token") ?? "";

  const verify = trpc.firstAccess.verifyToken.useQuery({ token }, { enabled: Boolean(token) });
  const setPassword = trpc.firstAccess.setPassword.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: error => toast.error(error.message),
  });

  const [password, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!token) return <div className="min-h-screen flex items-center justify-center"><div className="text-center max-w-md"><AlertCircle className="mx-auto size-12 text-red-500" /><h1 className="mt-4 text-2xl font-display">Link inválido</h1><p className="mt-2 text-lucathi-gray">Token não fornecido.</p></div></div>;
  if (verify.isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Verificando identidade…</p></div>;
  if (verify.isError) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center max-w-md"><AlertCircle className="mx-auto size-12 text-red-500" /><h1 className="mt-4 text-2xl font-display">Link inválido</h1><p className="mt-2 text-lucathi-gray">{verify.error?.message ?? "Não foi possível verificar sua identidade."}</p></div></div>;
  }

  const person = verify.data;

  const submit = async () => {
    if (password.length < 6) return;
    if (password !== confirmPassword) return;
    try {
      await setPassword.mutateAsync({ token, password });
      setShowSuccess(true);
      setTimeout(() => { window.location.href = "/"; }, 2000);
    } catch {
      // error handled by onError
    }
  };

  return <main className="min-h-screen bg-lucathi-canvas p-5 md:p-10"><div className="mx-auto max-w-md"><div className="text-center mb-8"><Lock className="mx-auto size-10 text-lucathi-navy" /><h1 className="mt-4 font-display text-3xl">Defina sua senha</h1><p className="mt-2 text-sm text-lucathi-gray">Bem-vindo, <strong>{person?.fullName}</strong></p></div>{showSuccess ? (<div className="rounded-xl bg-emerald-50 p-6 text-center border border-emerald-200"><CheckCircle className="mx-auto size-10 text-emerald-600" /><p className="mt-3 font-semibold text-emerald-800">Senha definida com sucesso!</p><p className="mt-1 text-sm text-emerald-600">Redirecionando…</p></div>) : (<div className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm space-y-4"><div><label className="text-sm font-medium">Nova senha</label><input type="password" value={password} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="mt-1 h-10 w-full rounded-md border border-input px-3 text-sm" /></div><div><label className="text-sm font-medium">Confirmar senha</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="mt-1 h-10 w-full rounded-md border border-input px-3 text-sm" /></div>{password !== confirmPassword && password.length > 0 ? (<p className="text-xs text-red-600">As senhas não coincidem.</p>) : null}<button disabled={password.length < 6 || password !== confirmPassword || setPassword.isPending} onClick={submit} className="w-full bg-lucathi-deep hover:bg-lucathi-navy text-white rounded-lg h-10 font-medium">Definir senha</button></div>)}</div></main>;
}
