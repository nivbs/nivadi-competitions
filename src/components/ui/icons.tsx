import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CrownIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" fill="currentColor" fillOpacity="0.18" />
      <path d="M5 19h14" />
    </svg>
  );
}
export function PauseIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}
export function PlayIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor" fillOpacity="0.18" />
    </svg>
  );
}
export function SettingsIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}
export function TrashIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </svg>
  );
}
export function PencilIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" />
    </svg>
  );
}
export function UndoIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M9 7L4 12l5 5M4 12h10a6 6 0 010 12" transform="translate(0 -3)" />
    </svg>
  );
}
export function FlagIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}
export function PlusIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
