"use client";

import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  useReducedMotion,
} from "motion/react";
import * as m from "motion/react-m";
import { Gauge, LineChart, Plus, Rocket, Webhook, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeader } from "@/components/primitives";
import { cn } from "@/lib/utils";

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
};

const SERVICES: Service[] = [
  {
    icon: Rocket,
    title: "Landing pages de alta conversão (high tech)",
    description:
      "A página que abre em um segundo, explica o seu negócio em oito e transforma visita em conversa. Sem template, sem carrossel de banner, sem enfeite que atrapalha a leitura.",
    bullets: [
      "Narrativa e copy construídas junto com você.",
      "Motion (animação) e 3D usados só onde ajudam a entender.",
      "Testes A/B de copy, layout e CTA para aumentar a conversão.",
      "Trackeamento de cada etapa do funil, para você decidir com dados.",
    ],
  },
  {
    icon: Workflow,
    title: "Sistemas internos e automações",
    description:
      "Painéis, portais e fluxos que tiram o trabalho manual do caminho do time.",
    bullets: [
      "Painéis e portais sob medida para o fluxo real do time.",
      "Automação de tarefas repetitivas, do cadastro ao relatório.",
      "Permissões e trilha de auditoria para cada ação.",
      "Construído para crescer junto com a operação.",
    ],
  },
  {
    icon: Webhook,
    title: "Integrações e APIs",
    description:
      "CRM, ERP, WhatsApp, pagamentos e planilhas falando a mesma língua.",
    bullets: [
      "CRM, ERP e WhatsApp sincronizados sem copiar e colar.",
      "Gateways de pagamento e webhooks confiáveis, com retentativa.",
      "Planilhas viram fonte de dados, não gargalo.",
      "Monitoramento e alerta quando algo para de conversar.",
    ],
  },
  {
    icon: Gauge,
    title: "Site rápido e bem posicionado no Google",
    description:
      "Página que carrega na hora, não trava no celular e aparece para quem procura o que você vende. O Google premia isso — e o cliente também.",
    bullets: [
      "Carrega rápido até no 4G, com as métricas do Google no verde (Core Web Vitals).",
      "Um limite de peso por página, conferido a cada atualização para o site não ficar lento com o tempo.",
      "O Google entende e mostra suas páginas do jeito certo (SEO técnico, sitemap, dados estruturados).",
      "Imagens, fontes e ferramentas de terceiros otimizadas para não pesar a página.",
    ],
  },
  {
    icon: LineChart,
    title: "Analytics e instrumentação",
    description:
      "Cada etapa do funil medida — você para de decidir por achismo.",
    bullets: [
      "Plano de eventos desenhado a partir do funil.",
      "Dashboards com as métricas que importam para o negócio.",
      "Atribuição de origem: saiba de onde vem cada lead.",
      "Dados confiáveis para rodar testes A/B com segurança.",
    ],
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Animation features arrive after the first render — see motion-features.ts. */
const loadFeatures = () =>
  import("@/components/motion-features").then((mod) => mod.default);

function ServiceCard({
  service,
  active,
  onSelect,
}: {
  service: Service;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = service.icon;
  const reducedMotion = useReducedMotion();
  const layout = reducedMotion ? false : "position";
  const bulletsId = `${service.title}-bullets`.replace(/\W+/g, "-");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-expanded={active}
      aria-controls={bulletsId}
      className={cn(
        "group relative flex h-full w-full cursor-pointer flex-col rounded-3xl border bg-white p-7 text-left transition-[border-color,box-shadow] duration-300 md:p-8",
        active
          ? "border-brand/40 shadow-[0_24px_60px_-28px_rgba(22,104,227,0.35)]"
          : "border-line hover:border-brand/35"
      )}
    >
      <m.span
        layout={layout}
        aria-hidden="true"
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl transition-colors duration-300",
          active
            ? "bg-brand text-white"
            : "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white"
        )}
      >
        <Icon className="h-5 w-5" />
      </m.span>

      <m.span
        layout={layout}
        aria-hidden="true"
        className={cn(
          "absolute right-7 top-7 grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-[transform,color,border-color] duration-300 md:right-8 md:top-8",
          active
            ? "rotate-45 border-brand/40 text-brand"
            : "group-hover:border-brand/35 group-hover:text-brand"
        )}
      >
        <Plus className="h-4 w-4" />
      </m.span>

      <m.h3
        layout={layout}
        className={cn(
          "mt-6 pr-10 font-display font-semibold tracking-[-0.02em] text-ink transition-[font-size] duration-300",
          active ? "text-[24px] md:text-[28px]" : "text-[19px]"
        )}
      >
        {service.title}
      </m.h3>

      <m.p
        layout={layout}
        className="mt-3 max-w-[52ch] text-[15px] leading-[1.65] text-muted"
      >
        {service.description}
      </m.p>

      <AnimatePresence initial={false}>
        {active ? (
          <m.div
            key="bullets"
            id={bulletsId}
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-6">
              {service.bullets.map((bullet, index) => (
                <m.li
                  key={bullet}
                  initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.12 + index * 0.05,
                    ease: EASE,
                  }}
                  className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {bullet}
                </m.li>
              ))}
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

export function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  return (
    <Section id="entregas" className="blueprint-grid">
      <SectionHeader
        eyebrow="O que você contrata"
        title={
          <>
            Não é &ldquo;só um <b className="text-blue-600">software</b> &rdquo;. É a peça que falta <b className="text-blue-600 mr-2">no seu processo</b>
            comercial.
          </>
        }
        description="A ineficácia começa pelo gargalo, não pela tela. Primeiro descobrimos onde está o bloqueio; depois decidimos o que construir, às vezes é uma landing page, às vezes são três telas internas que ninguém vê."
      />

      <LazyMotion features={loadFeatures}>
        <LayoutGroup>
          <div className="mt-12 grid grid-flow-row-dense gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const active = index === activeIndex;
              return (
                <m.div
                  key={service.title}
                  layout={!reducedMotion}
                  transition={{ layout: { duration: 0.5, ease: EASE } }}
                  className={cn("h-full", active && "md:col-span-2")}
                >
                  <Reveal delay={index * 0.05} className="h-full">
                    <ServiceCard
                      service={service}
                      active={active}
                      onSelect={() => setActiveIndex(index)}
                    />
                  </Reveal>
                </m.div>
              );
            })}
          </div>
        </LayoutGroup>
      </LazyMotion>
    </Section>
  );
}
