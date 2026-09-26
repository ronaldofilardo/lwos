type BrandMarkProps = { compact?: boolean; inverse?: boolean };

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <img
      src="/lucathi-logo.png"
      alt="Lucathi Consult"
      className={`w-auto object-contain object-left ${compact ? "h-7" : "h-9"}`}
      style={inverse ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}
