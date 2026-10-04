type IconProps = {
  size?: number;
  className?: string;
};

export function IconBack({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#4A7EC4" stroke="#1E3A6E" strokeWidth="0.5" />
      <path d="M9 4L5 8l4 4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlay({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7" fill="#3CB371" stroke="#1A5C34" strokeWidth="0.5" />
      <path d="M6 5v6l6-3-6-3z" fill="#fff" />
    </svg>
  );
}

export function IconStop({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#E74C3C" stroke="#8B1A10" strokeWidth="0.5" />
      <rect x="5" y="5" width="6" height="6" fill="#fff" />
    </svg>
  );
}

export function IconNext({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#5B9BD5" stroke="#2E5A8A" strokeWidth="0.5" />
      <path d="M7 5l4 3-4 3V5z" fill="#fff" />
      <rect x="11" y="5" width="2" height="6" fill="#fff" />
    </svg>
  );
}

export function IconAdd({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#6BB86B" stroke="#2D6B2D" strokeWidth="0.5" />
      <path d="M8 4v8M4 8h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconFolder({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M2 4h5l1 1h6v8H2V4z" fill="#F4D35E" stroke="#B8860B" strokeWidth="0.5" />
      <path d="M2 5h14v1H2V5z" fill="#E8C547" />
    </svg>
  );
}

export function IconKey({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="10" cy="10" rx="6" ry="6" fill="#FFD700" stroke="#B8860B" strokeWidth="0.75" />
      <circle cx="10" cy="10" r="2.5" fill="#FFF8DC" />
      <path d="M14 14l6 6M16 16l2 2" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="18" width="4" height="3" rx="0.5" fill="#A0A0A0" stroke="#606060" strokeWidth="0.5" />
    </svg>
  );
}

export function IconWarning({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M8 1L15 14H1L8 1z" fill="#FFCC00" stroke="#996600" strokeWidth="0.5" />
      <path d="M8 6v4M8 11.5v.5" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconApp({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="url(#xpAppGrad)" stroke="#1E3A6E" strokeWidth="0.5" />
      <defs>
        <linearGradient id="xpAppGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6BA3E8" />
          <stop offset="100%" stopColor="#245EDC" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="10" height="7" fill="#ECE9D8" stroke="#808080" strokeWidth="0.5" />
      <rect x="3" y="11" width="10" height="2" fill="#D4D0C8" />
    </svg>
  );
}

export function IconPencil({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M11 2l3 3-8 8H3v-3l8-8z" fill="#F5DEB3" stroke="#8B7355" strokeWidth="0.5" />
      <path d="M10 3l3 3" stroke="#8B7355" strokeWidth="0.5" />
    </svg>
  );
}

export function IconRemove({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="#E74C3C" stroke="#8B1A10" strokeWidth="0.5" />
      <path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconGrip({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="6" cy="4" r="1.2" fill="#606060" />
      <circle cx="10" cy="4" r="1.2" fill="#606060" />
      <circle cx="6" cy="8" r="1.2" fill="#606060" />
      <circle cx="10" cy="8" r="1.2" fill="#606060" />
      <circle cx="6" cy="12" r="1.2" fill="#606060" />
      <circle cx="10" cy="12" r="1.2" fill="#606060" />
    </svg>
  );
}

export function IconOpen({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M2 4h5l1 1h6v8H2V4z" fill="#F4D35E" stroke="#B8860B" strokeWidth="0.5" />
      <path d="M9 7h5v5H9V7z" fill="#fff" stroke="#808080" strokeWidth="0.5" />
    </svg>
  );
}
