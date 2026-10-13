import type { SVGProps } from "react";

/**
 * A small, deliberate icon set drawn as inline SVG.
 *
 * The report uses icons only where they carry meaning (direction, action,
 * status) — never as decoration. All icons inherit `currentColor` and are
 * hidden from assistive technology, because every one of them sits beside a
 * text label that already says what it means.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
  focusable: false,
};

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M5.5 4.5h6v6" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 8H3" />
      <path d="M7 4 3 8l4 4" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.25 10.25 14 14" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 11V3" />
      <path d="M4.5 6.5 8 3l3.5 3.5" />
      <path d="M2.5 11.5v2h11v-2" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" />
      <path d="M8 6.5v3" />
      <path d="M8 11.25v.25" />
    </svg>
  );
}

export function DashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8h9" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <svg {...base} {...props} width={12} height={12} viewBox="0 0 12 12">
      <path d="M6 2v8" />
      <path d="M3.5 7.5 6 10l2.5-2.5" />
    </svg>
  );
}
