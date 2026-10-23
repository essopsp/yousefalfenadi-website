/**
 * زخرفة واحدة مستوحاة من الفن المغاربي: شريط معينات هندسية بسيط
 */
export function Motif({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-[var(--accent-soft)] ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-current opacity-50 sm:w-28" />
      <svg width="88" height="14" viewBox="0 0 88 14" fill="none" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path
              d={`M${8 + i * 24} 7 L${14 + i * 24} 1.5 L${20 + i * 24} 7 L${14 + i * 24} 12.5 Z`}
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx={14 + i * 24} cy="7" r="1.4" fill="currentColor" />
          </g>
        ))}
      </svg>
      <span className="h-px w-16 bg-current opacity-50 sm:w-28" />
    </div>
  );
}
