"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fade-and-rise on first scroll into view. The motion itself is a CSS
 * transition on `[data-reveal]` (see globals.css), so this only flips an
 * attribute — no animation library in the bundle for it. Reduced motion is
 * handled in CSS as well: the hidden state only applies under
 * `prefers-reduced-motion: no-preference`.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      className={className}
      style={
        delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
