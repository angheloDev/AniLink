/** The circle mark inside a spinning ring. The ring only spins when the visitor allows motion. */
export function LogoLoader({ size = 72 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size + 28, height: size + 28 }}>
      <span aria-hidden className="absolute inset-0 rounded-full border-2 border-border border-t-eyebrow motion-safe:animate-spin" />
      <img src="/logos/mark.png" alt="" width={size} height={size} />
    </div>
  );
}
