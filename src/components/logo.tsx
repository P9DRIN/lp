import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Brand assets live in /public/brand. Both the SVG masters and these PNGs are
 * generated — edit scripts/brand-sheet.png and re-run the pipeline, don't hand-
 * retouch the output. See scripts/vectorize-brand.sh.
 *
 * These reference the PNGs, not the SVG masters, on purpose: each master embeds
 * its interior shading as a data URI, so the SVG is heavier than a 3x PNG at
 * the sizes the site actually renders. Reach for the .svg when something needs
 * to scale past that — print, a large hero, an OG image.
 *
 * The full lockup carries a "SOFTWARE STUDIO" line set at roughly 1/10 the
 * lockup height, so it stops being legible below ~72px tall. Above that use
 * <LogoLockup>; in the nav and footer use <LogoMark> with live text.
 */

export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={264}
      height={192}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}

export function LogoLockup({
  variant = "dark",
  className,
  priority = false,
}: {
  /** `dark` = dark wordmark for light backgrounds; `light` = white wordmark. */
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={
        variant === "light"
          ? "/brand/logo-lockup-white.png"
          : "/brand/logo-lockup.png"
      }
      alt="Lima Silva — Software Studio"
      width={1086}
      height={216}
      priority={priority}
      className={cn("h-[72px] w-auto", className)}
    />
  );
}
