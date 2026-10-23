import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M8.5 6.2c0-1.1 1.2-1.8 2.2-1.2l9 5.8c.9.6.9 1.9 0 2.4l-9 5.8c-1 .6-2.2-.1-2.2-1.2V6.2Z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <rect x="6.5" y="5.5" width="3.6" height="13" rx="1.2" />
      <rect x="13.9" y="5.5" width="3.6" height="13" rx="1.2" />
    </svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M6.4 6.9c0-1 1.1-1.6 1.9-1l7.2 5.1c.7.5.7 1.5 0 2l-7.2 5.1c-.8.6-1.9 0-1.9-1V6.9Z" />
      <rect x="16.6" y="5.5" width="2.2" height="13" rx="1" />
    </svg>
  );
}

export function PrevIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M17.6 6.9c0-1-1.1-1.6-1.9-1l-7.2 5.1c-.7.5-.7 1.5 0 2l7.2 5.1c.8.6 1.9 0 1.9-1V6.9Z" />
      <rect x="5.2" y="5.5" width="2.2" height="13" rx="1" />
    </svg>
  );
}

export function Forward10Icon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5.5a6.5 6.5 0 1 1-6.2 4.6" />
      <path d="M12 2.8v5.4l4-2.7" />
      <text
        x="12"
        y="15.8"
        textAnchor="middle"
        fontSize="7.5"
        fill="currentColor"
        stroke="none"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
      >
        10
      </text>
    </svg>
  );
}

export function Back10Icon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5.5a6.5 6.5 0 1 0 6.2 4.6" />
      <path d="M12 2.8v5.4l-4-2.7" />
      <text
        x="12"
        y="15.8"
        textAnchor="middle"
        fontSize="7.5"
        fill="currentColor"
        stroke="none"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
      >
        10
      </text>
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="6.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="m8.8 10.7 6.4-3.4M8.8 13.3l6.4 3.4" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4.5 12h15M12 4c2.2 2.2 3.3 5 3.3 8s-1.1 5.8-3.3 8c-2.2-2.2-3.3-5-3.3-8s1.1-5.8 3.3-8Z" />
    </svg>
  );
}

export function ChevronStart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m14.5 6.5-5.5 5.5 5.5 5.5" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="13" cy="17" r="2" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16.5V20" />
    </svg>
  );
}

