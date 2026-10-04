"use client";

import { useId, type ReactNode } from "react";

type IconProps = {
  size?: number;
  className?: string;
};

type GradProps = {
  id: string;
  from: string;
  to: string;
};

function Grad({ id, from, to }: GradProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={from} />
      <stop offset="100%" stopColor={to} />
    </linearGradient>
  );
}

function useGradId(suffix: string) {
  const base = useId();
  return `${base}-${suffix}`;
}

function IconSvg({
  size = 16,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function RoundedSquareFrame({
  gradId,
  stroke,
  from,
  to,
}: {
  gradId: string;
  stroke: string;
  from: string;
  to: string;
}) {
  return (
    <>
      <defs>
        <Grad id={gradId} from={from} to={to} />
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2.5"
        fill={`url(#${gradId})`}
        stroke={stroke}
        strokeWidth="1"
      />
      <path
        d="M2.5 3.5h11"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.75"
        fill="none"
      />
    </>
  );
}

function CircleFrame({
  gradId,
  stroke,
  from,
  to,
}: {
  gradId: string;
  stroke: string;
  from: string;
  to: string;
}) {
  return (
    <>
      <defs>
        <Grad id={gradId} from={from} to={to} />
      </defs>
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill={`url(#${gradId})`}
        stroke={stroke}
        strokeWidth="1"
      />
      <path
        d="M3.5 5.5a6 6 0 0 1 9 0"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.75"
        fill="none"
      />
    </>
  );
}

const BLUE = { stroke: "#1A3F7A", from: "#7EB4F5", to: "#3A7BD5" };
const GREEN = { stroke: "#1A5C34", from: "#7FD67F", to: "#3C9A3C" };
const RED = { stroke: "#8B1A10", from: "#F08070", to: "#C4381A" };
const RED_CIRCLE = { stroke: "#8B1A10", from: "#F28B7D", to: "#D94A38" };

export function IconBack({ size = 16, className }: IconProps) {
  const gradId = useGradId("back");
  return (
    <IconSvg size={size} className={className}>
      <RoundedSquareFrame gradId={gradId} {...BLUE} />
      <path
        d="M9 4.5L5.5 8l3.5 3.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}

export function IconPlay({ size = 16, className }: IconProps) {
  const gradId = useGradId("play");
  return (
    <IconSvg size={size} className={className}>
      <CircleFrame gradId={gradId} {...GREEN} />
      <path d="M6.5 5.5v5l5-2.5-5-2.5z" fill="#fff" />
    </IconSvg>
  );
}

export function IconStop({ size = 16, className }: IconProps) {
  const gradId = useGradId("stop");
  return (
    <IconSvg size={size} className={className}>
      <RoundedSquareFrame gradId={gradId} {...RED} />
      <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" fill="#fff" />
    </IconSvg>
  );
}

export function IconNext({ size = 16, className }: IconProps) {
  const gradId = useGradId("next");
  return (
    <IconSvg size={size} className={className}>
      <RoundedSquareFrame gradId={gradId} {...BLUE} />
      <path d="M5.5 5.5v5l4-2.5-4-2.5z" fill="#fff" />
      <rect x="10.5" y="5.5" width="1.5" height="5" fill="#fff" />
    </IconSvg>
  );
}

export function IconAdd({ size = 16, className }: IconProps) {
  const gradId = useGradId("add");
  return (
    <IconSvg size={size} className={className}>
      <RoundedSquareFrame gradId={gradId} {...GREEN} />
      <path
        d="M8 4.5v7M4.5 8h7"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  );
}

export function IconFolder({ size = 16, className }: IconProps) {
  const backId = useGradId("folder-back");
  const frontId = useGradId("folder-front");
  return (
    <IconSvg size={size} className={className}>
      <defs>
        <Grad id={backId} from="#F8E07A" to="#E8C547" />
        <Grad id={frontId} from="#FFE566" to="#F4D35E" />
      </defs>
      <path
        d="M1.5 5.5h5l1 1h7v7.5H1.5V5.5z"
        fill={`url(#${backId})`}
        stroke="#B8860B"
        strokeWidth="1"
      />
      <path d="M1.5 6.5h13v1H1.5V6.5z" fill="#E0B840" />
      <path
        d="M2.5 8.5h11v5H2.5V8.5z"
        fill={`url(#${frontId})`}
        stroke="#C9A227"
        strokeWidth="0.75"
      />
      <path d="M2.5 4.5h4.5l1 1H2.5V4.5z" fill="#F4D35E" stroke="#B8860B" strokeWidth="0.75" />
    </IconSvg>
  );
}

export function IconKey({ size = 16, className }: IconProps) {
  const goldId = useGradId("key");
  return (
    <IconSvg size={size} className={className}>
      <defs>
        <Grad id={goldId} from="#FFE566" to="#D4A017" />
      </defs>
      <circle
        cx="5.5"
        cy="6.5"
        r="3.5"
        fill={`url(#${goldId})`}
        stroke="#9A7B0A"
        strokeWidth="1"
      />
      <circle cx="5.5" cy="6.5" r="1.25" fill="#FFF8DC" stroke="#C9A227" strokeWidth="0.5" />
      <path
        d="M8 8.5h5.5v1.5h-1.5v1.5h-1.5v1.5H8V8.5z"
        fill="#C0C0C0"
        stroke="#606060"
        strokeWidth="0.75"
      />
      <rect x="12" y="10" width="1.5" height="2" fill="#A0A0A0" />
      <rect x="10" y="11.5" width="1.5" height="2" fill="#A0A0A0" />
    </IconSvg>
  );
}

export function IconWarning({ size = 16, className }: IconProps) {
  const gradId = useGradId("warn");
  return (
    <IconSvg size={size} className={className}>
      <defs>
        <Grad id={gradId} from="#FFE566" to="#FFCC00" />
      </defs>
      <path
        d="M8 1.5L14.5 13.5H1.5L8 1.5z"
        fill={`url(#${gradId})`}
        stroke="#996600"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.5v4"
        stroke="#000"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.25" r="0.75" fill="#000" />
    </IconSvg>
  );
}

export function IconError({ size = 16, className }: IconProps) {
  const gradId = useGradId("err");
  return (
    <IconSvg size={size} className={className}>
      <CircleFrame gradId={gradId} {...RED_CIRCLE} />
      <path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  );
}

export function IconInfo({ size = 16, className }: IconProps) {
  const gradId = useGradId("info");
  return (
    <IconSvg size={size} className={className}>
      <CircleFrame gradId={gradId} stroke="#1A3F7A" from="#9BC4F5" to="#4A8AD4" />
      <circle cx="8" cy="5" r="0.9" fill="#fff" />
      <path
        d="M8 7v4.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  );
}

export function IconApp({ size = 16, className }: IconProps) {
  const gradId = useGradId("app");
  const titleId = useGradId("app-title");
  return (
    <IconSvg size={size} className={className}>
      <defs>
        <Grad id={gradId} from="#7EB4F5" to="#245EDC" />
        <Grad id={titleId} from="#3593FF" to="#0058EE" />
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2.5"
        fill={`url(#${gradId})`}
        stroke="#1A3F7A"
        strokeWidth="1"
      />
      <rect x="2.5" y="2.5" width="11" height="2.5" fill={`url(#${titleId})`} />
      <rect
        x="3.5"
        y="6"
        width="9"
        height="6"
        fill="#ECE9D8"
        stroke="#7F9DB9"
        strokeWidth="0.75"
      />
      <rect x="3.5" y="12.5" width="9" height="1.5" fill="#D4D0C8" />
    </IconSvg>
  );
}

export function IconPencil({ size = 16, className }: IconProps) {
  return (
    <IconSvg size={size} className={className}>
      <path
        d="M10.5 2.5l3 3-7.5 7.5H3v-3l7.5-7.5z"
        fill="#FFE566"
        stroke="#C9A227"
        strokeWidth="0.75"
      />
      <path d="M9.5 3.5l3 3" stroke="#E8C547" strokeWidth="0.5" />
      <path d="M3 12.5l1.5 1.5" stroke="#E8A0B0" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12.5h1.5v1.5H3V12.5z" fill="#F0A0B0" stroke="#C06070" strokeWidth="0.5" />
      <path d="M3 10.5l2.5-2.5" stroke="#8B7355" strokeWidth="1" />
      <path d="M3 10.5l0.5 1.5 1-0.5-0.5-1.5z" fill="#404040" />
    </IconSvg>
  );
}

export function IconRemove({ size = 16, className }: IconProps) {
  const gradId = useGradId("remove");
  return (
    <IconSvg size={size} className={className}>
      <CircleFrame gradId={gradId} {...RED_CIRCLE} />
      <path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  );
}

function GripDot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="3" height="3" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5" />
      <path d="M0.5 0.5h2" stroke="#fff" strokeWidth="0.5" />
      <path d="M2.5 2.5v0.5h0.5" stroke="#606060" strokeWidth="0.5" />
    </g>
  );
}

export function IconGrip({ size = 16, className }: IconProps) {
  return (
    <IconSvg size={size} className={className}>
      <GripDot x={4.5} y={2.5} />
      <GripDot x={8.5} y={2.5} />
      <GripDot x={4.5} y={6.5} />
      <GripDot x={8.5} y={6.5} />
      <GripDot x={4.5} y={10.5} />
      <GripDot x={8.5} y={10.5} />
    </IconSvg>
  );
}

export function IconOpen({ size = 16, className }: IconProps) {
  const backId = useGradId("open-back");
  const flapId = useGradId("open-flap");
  return (
    <IconSvg size={size} className={className}>
      <defs>
        <Grad id={backId} from="#F8E07A" to="#E8C547" />
        <Grad id={flapId} from="#FFF8E0" to="#F4D35E" />
      </defs>
      <path
        d="M1.5 5.5h5l1 1h7v7.5H1.5V5.5z"
        fill={`url(#${backId})`}
        stroke="#B8860B"
        strokeWidth="1"
      />
      <path
        d="M8.5 7.5l5.5-2v5.5H8.5V7.5z"
        fill={`url(#${flapId})`}
        stroke="#C9A227"
        strokeWidth="0.75"
      />
      <path d="M8.5 7.5L14 5.5" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <rect x="9" y="9" width="4" height="3" fill="#fff" stroke="#7F9DB9" strokeWidth="0.5" />
    </IconSvg>
  );
}
