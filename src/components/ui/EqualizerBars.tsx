"use client";

export function EqualizerBars({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-3.5 items-end gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-sm bg-current"
          style={{ height: "100%", animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}
