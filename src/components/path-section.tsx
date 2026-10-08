"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { MotionValue } from "motion/react";
import {
  LazyMotion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import { CONTAINER, SectionHeader } from "@/components/primitives";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Entendemos o problema",
    description:
      "Mapeamos sua operação e definimos o que realmente precisa ser construído.",
  },
  {
    title: "Projetamos a solução",
    description:
      "Arquitetura, experiência e tecnologia são pensadas antes de sair desenvolvendo.",
  },
  {
    title: "Construímos",
    description:
      "Desenvolvimento focado no que gera valor para o negócio, sem complexidade desnecessária.",
  },
  {
    title: "Colocamos no ar",
    description:
      "Deploy, infraestrutura, integrações e acompanhamento até a solução estar funcionando.",
  },
];

const GAPS = STEPS.length - 1;

/** Animation features arrive after the first render — see motion-features.ts. */
const loadFeatures = () =>
  import("@/components/motion-features").then((mod) => mod.default);

/**
 * Below this the pinned panel would have to clip its own content to fit the
 * viewport — on a 390x667 screen the stacked steps run 804px tall inside a
 * 667px panel. So the scene only pins where the horizontal layout is in play
 * and there is height to spare; everywhere else the section stays in normal
 * flow and just fills the path as you scroll past it.
 *
 * Keep in sync with the `pinned` variant in globals.css.
 */
const PIN_QUERY = "(min-width: 64rem) and (min-height: 44rem)";

/** Scene phases, as a fraction of the track: grow, hold, shrink. */
const GROW_END = 0.22;
const SHRINK_START = 0.78;
/** The path fills inside the held phase, finishing before the shrink starts. */
const FILL_START = 0.26;
const FILL_END = 0.62;

function subscribeToPinQuery(onChange: () => void) {
  const query = window.matchMedia(PIN_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the viewport can host the pinned scene. Only the transforms read
 * this — the layout itself is switched by the `pinned:` CSS variant, so the
 * page height never depends on JavaScript and nothing shifts on hydration.
 */
function useCanPin() {
  return useSyncExternalStore(
    subscribeToPinQuery,
    () => window.matchMedia(PIN_QUERY).matches,
    () => false
  );
}

/**
 * The line between two nodes.
 *
 * Drawn per segment rather than as one track across the whole list: a single
 * element can be anchored to the first node, but nothing in CSS anchors its
 * far end to the last node's centre, so on the stacked layout it would always
 * overshoot into the last step's text.
 *
 * Geometry, with 40px nodes:
 *   stacked   from this node's bottom edge down to the next node's top edge,
 *             which is exactly one 40px row gap below this item.
 *   in a row  from this node's right edge (50% + 20px) across to the next
 *             node's left edge (150% + 12px — the 32px column gap less the
 *             20px node radius).
 */
function Connector({
  progress,
  index,
  frozen,
}: {
  progress: MotionValue<number>;
  index: number;
  frozen: boolean;
}) {
  const scale = useTransform(
    progress,
    [index / GAPS, (index + 1) / GAPS],
    [0, 1],
    { clamp: true }
  );
  const fill = frozen ? 1 : scale;

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute -bottom-10 left-5 top-10 w-px bg-line lg:hidden"
      >
        <m.span
          className="block h-full w-full origin-top bg-brand"
          style={{ scaleY: fill }}
        />
      </span>

      <span
        aria-hidden="true"
        className="absolute top-5 hidden h-px bg-line lg:block"
        style={{ left: "calc(50% + 20px)", right: "calc(-50% - 12px)" }}
      >
        <m.span
          className="block h-full w-full origin-left bg-brand"
          style={{ scaleX: fill }}
        />
      </span>
    </>
  );
}

export function PathSection() {
  const reducedMotion = useReducedMotion() ?? false;
  const canPin = useCanPin();
  const pin = canPin && !reducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);

  // Pinned: `start start -> end end` is exactly the window in which the panel
  // is stuck to the screen — progress hits 0 as it pins and 1 as it releases.
  const { scrollYProgress: pinnedTrack } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // In normal flow the section is shorter than the viewport, which makes that
  // offset pair degenerate; this one runs over the section's own travel.
  const { scrollYProgress: flowTrack } = useScroll({
    target: trackRef,
    offset: ["start 0.85", "end 0.85"],
  });
  const track = pin ? pinnedTrack : flowTrack;

  // Grow into full bleed, hold, shrink back out. The corner radius follows the
  // same phases so the panel reads as a card at the ends and as the whole
  // screen in the middle.
  const scale = useTransform(
    track,
    [0, GROW_END, SHRINK_START, 1],
    [0.86, 1, 1, 0.86]
  );
  const radius = useTransform(
    track,
    [0, GROW_END, SHRINK_START, 1],
    [44, 0, 0, 44]
  );

  // Pinned, the path draws during the held phase — the stretch of scroll where
  // the section owns the screen. In flow it just runs the section's travel.
  const fill = useTransform(
    track,
    pin ? [FILL_START, FILL_END] : [0.05, 0.9],
    [0, 1],
    { clamp: true }
  );
  const progress = useSpring(fill, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  // Backdrop drifting against the copy is what keeps the held phase from
  // feeling like a freeze frame.
  const gridY = useTransform(track, [0, 1], [-150, 150]);
  const gridX = useTransform(track, [0, 1], [-22, 22]);
  const glowY = useTransform(track, [0, 1], ["-45%", "45%"]);
  const glowX = useTransform(track, [0, 1], ["15%", "-15%"]);
  const counterGlowY = useTransform(track, [0, 1], ["38%", "-38%"]);
  const headerY = useTransform(track, [0, 1], [40, -40]);
  const pathY = useTransform(track, [0, 1], [-8, 8]);

  // Reduced motion gets the finished state: no pin, no scrub, no scaling.
  const [reached, setReached] = useState(reducedMotion ? STEPS.length : 1);
  useMotionValueEvent(progress, "change", (value) => {
    if (reducedMotion) return;
    const next = STEPS.filter((_, i) => value >= i / GAPS - 0.04).length;
    setReached(Math.max(1, next));
  });

  const drift = useCallback(
    <T,>(value: MotionValue<T>) => (reducedMotion ? undefined : value),
    [reducedMotion]
  );

  return (
    <LazyMotion features={loadFeatures}>
      <section
        id="processo"
        ref={trackRef}
        className="relative scroll-mt-24 pinned:h-[320vh] pinned:scroll-mt-0"
      >
        <div className="py-20 md:py-28 pinned:sticky pinned:top-0 pinned:flex pinned:h-screen pinned:items-center pinned:overflow-hidden pinned:py-0">
          <m.div
            className="relative flex w-full flex-col justify-center overflow-hidden pinned:h-full pinned:bg-white"
            style={pin ? { scale, borderRadius: radius } : undefined}
          >
            {/* Parallax backdrop. The mask lives on the wrapper, not on each
                layer: the panel clips everything at its own edges, and without
                this the glows would end on a dead straight horizontal line. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
              }}
            >
              <m.div
                className="blueprint-grid absolute -inset-x-24 -inset-y-56"
                style={{ y: drift(gridY), x: drift(gridX) }}
              />
              <m.div
                className="absolute left-[52%] top-[-34%] h-[38rem] w-[38rem] rounded-full bg-brand/14 blur-3xl"
                style={{ y: drift(glowY), x: drift(glowX) }}
              />
              {/* Runs the other way, so the two never read as one moving field. */}
              <m.div
                className="absolute bottom-[-38%] left-[-12%] h-[30rem] w-[30rem] rounded-full bg-sky-300/20 blur-3xl"
                style={{ y: drift(counterGlowY) }}
              />
            </div>

            <div className={cn(CONTAINER, "relative")}>
              <m.div className="max-w-[46rem]" style={{ y: drift(headerY) }}>
                <SectionHeader
                  eyebrow="Como trabalhamos"
                  title={
                    <>
                      Do problema ao sistema no ar, em{" "}
                      <span className="text-brand">quatro etapas</span>.
                    </>
                  }
                  description="Cada etapa termina com algo que você consegue ver e aprovar. Não reinventamos a roda, mas sabemos como ela funciona e como fazer ela girar mais rápido, tração pro seu negócio."
                />
              </m.div>

              <m.div
                className="mt-14 md:mt-16 pinned:mt-20"
                style={{ y: drift(pathY) }}
              >
                <ol className="relative flex flex-col gap-10 lg:grid lg:grid-cols-4 lg:gap-x-8">
                  {STEPS.map((step, index) => {
                    const isReached = index < reached;

                    return (
                      <li
                        key={step.title}
                        className="relative pl-16 lg:pl-0 lg:pt-16"
                      >
                        {index < GAPS ? (
                          <Connector
                            index={index}
                            progress={progress}
                            frozen={reducedMotion}
                          />
                        ) : null}

                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300 lg:left-1/2 lg:-translate-x-1/2",
                            isReached
                              ? "border-brand bg-brand text-white"
                              : "border-line bg-white text-muted"
                          )}
                        >
                          <span className="font-mono text-[12px] font-medium tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </span>

                        <h3
                          className={cn(
                            "font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] transition-colors duration-300 md:text-[21px]",
                            isReached ? "text-ink" : "text-ink/60"
                          )}
                        >
                          {step.title}
                        </h3>

                        <p className="mt-3 max-w-[38ch] text-[14px] leading-[1.65] text-muted">
                          {step.description}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </m.div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
