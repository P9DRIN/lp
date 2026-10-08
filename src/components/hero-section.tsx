import type { CSSProperties } from "react";
import { preload } from "react-dom";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { BUTTON_PRIMARY, CONTAINER, Eyebrow } from "@/components/primitives";
import { HeroBackdrop } from "@/components/hero-backdrop";

/**
 * Which backdrop the hero uses. "video" plays the pre-rendered loop; "webgl"
 * runs the interactive three.js tile field, where hovering moves the blue
 * tile. Flip this one word to compare them.
 */
const HERO_VISUAL: "video" | "webgl" = "video";

const HERO_POSTER = "/video/hero-poster.webp";

/** Entrance is plain CSS (see `.hero-rise` in globals.css) so the copy is
 *  painted straight from the HTML instead of waiting on hydration. */
const riseDelay = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties;

export function HeroSection() {
  // The poster fills the card, which makes it the LCP element — fetch it
  // ahead of everything else instead of when the <video> is parsed.
  if (HERO_VISUAL === "video") {
    preload(HERO_POSTER, { as: "image", fetchPriority: "high" });
  }

  return (
    <section id="topo" className="px-3 pt-20 sm:px-5 sm:pt-24">
      <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1400px] flex-col overflow-hidden rounded-[32px] border border-line bg-white md:min-h-[720px] md:rounded-[44px]">
        <div className="absolute inset-0 z-0">
          <HeroBackdrop visual={HERO_VISUAL} poster={HERO_POSTER} />
        </div>

        {/* Legibility scrim — keeps the copy at 4.5:1 over the bright tiles.
            Vertical on narrow screens, horizontal once the copy sits left. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_46%,rgba(255,255,255,0.72)_64%,rgba(255,255,255,0.1)_84%,rgba(255,255,255,0)_94%)] lg:bg-[linear-gradient(100deg,#ffffff_0%,rgba(255,255,255,0.97)_28%,rgba(255,255,255,0.82)_44%,rgba(255,255,255,0.2)_62%,rgba(255,255,255,0)_76%)]"
        />

        <div className="relative z-20 flex flex-1 items-center py-14 md:py-20">
          <div className={CONTAINER}>
            <div className="pointer-events-none max-w-2xl">
              <div className="hero-rise">
                <Eyebrow>Soluções em software sob medida</Eyebrow>
              </div>

              <h1
                style={riseDelay(0.08)}
                className="hero-rise mt-6 font-display text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[54px] md:text-[64px]"
              >
                Empresas comuns ocupam espaço.
                <span className="mt-1 block text-brand">
                  Empresas inteligentes se destacam.
                </span>
              </h1>

              <p
                style={riseDelay(0.16)}
                className="hero-rise mt-7 max-w-[54ch] text-[16px] leading-[1.65] text-muted md:text-[18px]"
              >
                Um sistema não custa caro. Perder o cliente por ineficiência custa. Projeto e construo sistemas de alta performance
                para empresas que perdem venda em página lenta, formulário
                confuso e processo feito na mão.
              </p>

              <div
                style={riseDelay(0.24)}
                className="hero-rise pointer-events-auto mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <a href="#contato" className={BUTTON_PRIMARY}>
                  Quero um diagnóstico gratuito
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Only the WebGL field reacts to the pointer. */}
        {HERO_VISUAL === "webgl" ? (
          <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted backdrop-blur-md lg:flex">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
            Passe o mouse pelos blocos
          </div>
        ) : null}
      </div>
    </section>
  );
}
