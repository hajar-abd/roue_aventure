import type { CSSProperties } from "react";

export type IconName =
  | "compass"
  | "arrow"
  | "clock"
  | "coin"
  | "leaf"
  | "spark"
  | "check"
  | "copy"
  | "refresh"
  | "close"
  | "history";
const paths: Record<IconName, React.ReactNode> = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2 6-6 2 2-6Z" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 7c-5-2-7 1-7 5s2 7 7 5M6 10h8M6 14h7" />
    </>
  ),
  leaf: (
    <>
      <path d="M19 4C8 2 3 7 5 14c2 7 12 6 14-10Z" />
      <path d="M4 21 14 10" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V3H3v13h5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  history: (
    <>
      <path d="M3 5v5h5M3 10a9 9 0 1 1 1 7" />
      <path d="M12 7v5l4 2" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
