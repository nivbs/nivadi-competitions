import type { ComponentPropsWithRef } from "react";

/** The doubling cube: the one place a numeral is allowed (2 to 64). */
export function DoublingCube({
  value = 64,
  size = 36,
  className = "",
  style,
  ...rest
}: { value?: 2 | 4 | 8 | 16 | 32 | 64; size?: number } & ComponentPropsWithRef<"div">) {
  return (
    <div
      role="img"
      aria-label={String(value)}
      {...rest}
      className={`inline-flex shrink-0 items-center justify-center font-mono font-bold ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        fontSize: size * 0.46,
        color: "var(--color-ink)",
        background: "linear-gradient(145deg, #ffffff 0%, var(--color-die) 50%, #e6dcc6 100%)",
        boxShadow: `var(--shadow-die), inset 0 0 0 ${Math.max(1.5, size * 0.05)}px var(--color-gold), inset -2px -3px 5px rgb(90 60 20 / 0.25)`,
        ...style,
      }}
    >
      {value}
    </div>
  );
}
