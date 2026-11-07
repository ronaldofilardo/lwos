type BrandMarkProps = { compact?: boolean; variant?: "primary" | "negative" };

export function BrandMark({ compact = false, variant = "primary" }: BrandMarkProps) {
  const src = variant === "negative" ? "/lucathi-logo-white.png" : "/lucathi-logo.png";
  const height = compact ? "h-7" : "h-9";
  const padding = "pl-[1.2em]";

  return (
    <img
      src={src}
      alt="Lucathi Consult"
      className={`w-auto object-contain object-left ${height} ${padding}`}
    />
  );
}
