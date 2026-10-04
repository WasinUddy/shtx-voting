"use client";

import {
  createElement,
  useLayoutEffect,
  useRef,
  type ElementType,
} from "react";

type FitTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  minFontSizePx?: number;
};

export function FitText({
  text,
  className = "",
  as = "span",
  minFontSizePx = 14,
}: FitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    function fit() {
      const node = ref.current;
      if (!node) {
        return;
      }
      node.style.fontSize = "";
      const computed = getComputedStyle(node);
      let size = parseFloat(computed.fontSize);
      if (!Number.isFinite(size) || size <= 0) {
        size = 24;
      }

      while (size > minFontSizePx && node.scrollWidth > node.clientWidth + 1) {
        size -= 1;
        node.style.fontSize = `${size}px`;
      }
    }

    fit();

    const observer = new ResizeObserver(() => {
      fit();
    });
    observer.observe(el);
    if (el.parentElement) {
      observer.observe(el.parentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [text, minFontSizePx]);

  return createElement(
    as,
    {
      ref,
      className: `xp-fit-text ${className}`.trim(),
      title: text,
    },
    text,
  );
}
