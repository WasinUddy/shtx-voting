"use client";

import { useEffect, useRef, useState } from "react";

type XpMenuProps = {
  label: string;
  children: React.ReactNode;
};

export function XpMenu({ label, children }: XpMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="xp-menu" ref={ref}>
      <button
        type="button"
        className="xp-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
      </button>
      {open ? <div className="xp-menu__dropdown">{children}</div> : null}
    </div>
  );
}

type XpMenuItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function XpMenuItem({ children, onClick, type = "button" }: XpMenuItemProps) {
  return (
    <button type={type} className="xp-menu__item" onClick={onClick}>
      {children}
    </button>
  );
}
