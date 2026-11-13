import { useId } from "react";

/** Shining gold crown: metallic gradient fill, bright highlight, soft glow. */
export function GoldCrown({ size = 30 }: { size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ filter: "drop-shadow(0 1px 1px rgb(60 35 5 / 0.7)) drop-shadow(0 0 4px rgb(255 214 110 / 0.75))" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset="0.35" stopColor="#f4c64a" />
          <stop offset="0.7" stopColor="#d4a017" />
          <stop offset="1" stopColor="#a67510" />
        </linearGradient>
      </defs>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" fill={`url(#${id})`} stroke="#7a5410" strokeWidth="1" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="#7a5410" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.4 10.2L12 6.8" stroke="#fffbe6" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
      <circle cx="3" cy="8" r="1.1" fill="#fff2b8" stroke="#7a5410" strokeWidth="0.6" />
      <circle cx="12" cy="5" r="1.1" fill="#fff2b8" stroke="#7a5410" strokeWidth="0.6" />
      <circle cx="21" cy="8" r="1.1" fill="#fff2b8" stroke="#7a5410" strokeWidth="0.6" />
    </svg>
  );
}
