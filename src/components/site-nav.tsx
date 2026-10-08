"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { CONTAINER } from "@/components/primitives";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <div className={CONTAINER}>
        <nav
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border px-3 py-2.5 transition-colors duration-300",
            scrolled
              ? "border-line bg-white/85 shadow-[0_10px_40px_-18px_rgba(8,20,38,0.28)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          )}
        >
          <a
            href="#topo"
            className="flex items-center gap-2.5 pl-1 text-ink"
            aria-label="Lima Silva — voltar ao início"
          >
            <LogoMark className="h-7 sm:h-8" priority />
            <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
              Lima Silva
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-muted transition-colors duration-200 hover:bg-brand-soft hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#contato"
              className="hidden items-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-brand-deep sm:inline-flex"
            >
              Entrar em contato
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-line bg-white text-ink transition-colors duration-200 hover:bg-brand-soft md:hidden"
            >
              {open ? (
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              ) : (
                <Menu className="h-4.5 w-4.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {open ? (
          <div
            id="menu-mobile"
            className="mt-2 rounded-2xl border border-line bg-white p-2 shadow-[0_18px_50px_-24px_rgba(8,20,38,0.35)] md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-brand-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contato"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl bg-ink px-4 py-3 text-center text-[15px] font-semibold text-white"
                >
                  Falar com especialista
                </a>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}
