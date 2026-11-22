/** The yellow "sun" circle from the Fieldlink look. Purely decorative; position it with `className`. */
export function SunDecor({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`sun-breathe pointer-events-none absolute rounded-full bg-sun ${className}`} />;
}
