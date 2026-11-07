import { CircleHelp, Info, RefreshCw } from "lucide-react";

interface Props {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function InstitutionalEmptyState({
  icon = <CircleHelp className="size-8 text-lucathi-mist" />,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center rounded-xl bg-lucathi-mist/50 border border-lucathi-line/50">
      <div className="size-16 rounded-full bg-lucathi-mist flex items-center justify-center p-2">
        {icon}
      </div>
      <h3 className="font-semibold text-lucathi-navy">{title}</h3>
      <p className="text-sm text-lucathi-gray max-w-sm">{description}</p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-3 rounded-lg px-4 py-2 text-sm font-medium bg-lucathi-navy text-white hover:bg-lucathi-navy/90"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
