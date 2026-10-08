import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Every section aligns to the same container so the page reads as one grid. */
export const CONTAINER = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-[14px] font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-brand-deep min-h-11";

export const BUTTON_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-[14px] font-semibold text-ink cursor-pointer transition-colors duration-200 hover:border-ink/25 hover:bg-brand-soft min-h-11";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand",
        className
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-brand/40" />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center"
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="max-w-[19ch] font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[40px] md:text-[46px]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-[62ch] text-[16px] leading-[1.65] text-muted md:text-[17px]",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Consistent vertical rhythm between sections. */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-20 md:py-28", className)}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}
