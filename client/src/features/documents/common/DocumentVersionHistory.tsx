import { Copy, History } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/lucathi/StatusBadge";

export function DocumentVersionHistory({
  documentId,
  currentVersion,
  documentStatus,
}: {
  documentId: string;
  currentVersion?: number;
  documentStatus: string;
}) {
  const versions = trpc.documents.versions.useQuery({ documentId });
  const [copied, setCopied] = useState<string | null>(null);
  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  };
  if (!versions.data?.length) return null;
  return (
    <div className="mt-2 rounded-lg bg-lucathi-mist p-3">
      <p className="flex items-center gap-1 text-xs font-semibold text-lucathi-gray">
        <History className="size-3" />
        Histórico preservado
      </p>
      {versions.data.map(version => (
        <p
          key={version.id}
          className="mt-1 flex items-center gap-2 text-xs text-lucathi-gray"
        >
          <span className="flex-1 truncate">
            <a
              href={`/api/local-storage/${version.storageKey}`}
              target="_blank"
              rel="noreferrer"
              className="text-lucathi-navy hover:underline hover:text-lucathi-deep cursor-pointer"
            >
              v{version.versionNumber} · {version.originalName}
            </a>
          </span>
          {version.versionNumber === currentVersion && (
            <div className="scale-75 origin-right">
              <StatusBadge status={documentStatus} />
            </div>
          )}
          <span
            className="font-mono text-[10px] bg-white/70 px-1.5 py-0.5 rounded shrink-0 max-w-[140px] truncate"
            title={version.sha256}
          >
            {version.sha256.slice(0, 12)}…
          </span>
          <button
            type="button"
            onClick={() => copyHash(version.sha256)}
            className="shrink-0 text-lucathi-navy hover:text-lucathi-deep"
            title="Copiar hash"
          >
            {copied === version.sha256 ? (
              <span className="text-emerald-600">✓</span>
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </p>
      ))}
    </div>
  );
}
