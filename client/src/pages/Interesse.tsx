import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { BrandMark } from "@/components/lucathi/BrandMark";

async function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export default function Interesse() {
  const [fullName, setFullName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => setShowSuccess(true),
    onError: error => toast.error(error.message),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error("Anexe uma imagem ou PDF de identificação.");
      return;
    }
    await createLead.mutateAsync({
      fullName,
      taxId,
      email,
      birthDate,
      fileName: file.name,
      mimeType: file.type,
      base64Data: await readAsBase64(file),
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-lucathi-canvas p-6">
      <section className="w-full max-w-md rounded-[28px] border border-lucathi-line bg-white p-8 shadow-xl shadow-lucathi-deep/5">
        <BrandMark />
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-xs text-lucathi-gray hover:text-lucathi-navy">
          <ArrowLeft className="size-3.5" /> Voltar para o login
        </Link>
        <h1 className="mt-6 font-display text-3xl text-lucathi-navy">Tenho interesse</h1>
        <p className="mt-3 text-sm leading-6 text-lucathi-gray">
          Deixe seus dados abaixo. Nossa equipe entrará em contato pra conversar sobre a Lucathi.
        </p>

        {showSuccess ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle className="mx-auto size-10 text-emerald-600" />
            <p className="mt-3 font-semibold text-emerald-800">Recebemos seu interesse!</p>
            <p className="mt-1 text-sm text-emerald-600">Em breve alguém da nossa equipe entra em contato.</p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="fullName">Nome completo</label>
              <input id="fullName" required value={fullName} onChange={e => setFullName(e.target.value)} className="h-10 w-full rounded-md border border-input px-3 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="taxId">CPF</label>
              <input id="taxId" required value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Somente números" className="h-10 w-full rounded-md border border-input px-3 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">E-mail</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-10 w-full rounded-md border border-input px-3 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="birthDate">Data de nascimento</label>
              <input id="birthDate" type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="h-10 w-full rounded-md border border-input px-3 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="file">Documento de identificação (imagem ou PDF)</label>
              <input id="file" type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
            </div>

            <button type="submit" disabled={createLead.isPending} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-lucathi-deep hover:bg-lucathi-navy text-white h-10 font-medium">
              <Send className="size-4" /> Enviar interesse
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
