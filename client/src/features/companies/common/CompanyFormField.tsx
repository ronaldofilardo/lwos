import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          {title}
        </h3>
        {hint ? <p className="text-xs text-lucathi-gray">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  if (multiline) {
    return (
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-medium text-lucathi-gray">{label}</span>
        <Textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
        />
      </label>
    );
  }
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-lucathi-gray">{label}</span>
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9"
      />
    </label>
  );
}

export function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-lucathi-gray">{label}</span>
      <p className="rounded-md border border-lucathi-line bg-lucathi-mist/60 px-3 py-2 text-sm text-lucathi-navy">
        {value || "—"}
      </p>
    </div>
  );
}
