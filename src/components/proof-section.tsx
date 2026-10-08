import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import {
  BUTTON_PRIMARY,
  Section,
  SectionHeader,
} from "@/components/primitives";
import { CASES, type CaseStudy } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ProofSection() {
  return (
    <Section id="provas">
      <SectionHeader
        eyebrow="Provas, não promessas"
        title={
          <>
            Dois projetos reais, dois gargalos{" "}
            <span className="text-brand">eliminados</span>.
          </>
        }
        description="Casos anonimizados a pedido dos clientes. Na chamada de diagnóstico eu abro os números completos, incluindo o que não funcionou de primeira."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {CASES.map((item, index) => (
          <Reveal key={item.tag} delay={index * 0.08} className="h-full">
            <CaseCard item={item} index={index} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12}>
        <div className="mt-5 flex flex-col gap-6 rounded-3xl border border-line bg-white p-7 md:flex-row md:items-center md:justify-between md:gap-10 md:p-9">
          <div>
            <p className="font-display text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink md:text-[26px]">
              O próximo case pode ser o <span className="text-brand">seu</span>.
            </p>
            <p className="mt-2 max-w-[56ch] text-[15px] leading-[1.6] text-muted">
              Me conte um pouco da dor de sua operação. No
              diagnóstico gratuito você sai sabendo onde está o gargalo e
              o que precisa fazer.
            </p>
          </div>
          <a href="#contato" className={cn(BUTTON_PRIMARY, "shrink-0")}>
            Quero um diagnóstico gratuito
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

function CaseCard({ item, index }: { item: CaseStudy; index: number }) {
  const [hero, ...rest] = item.numbers;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-colors duration-300 hover:border-brand/30">
      <div className="flex flex-1 flex-col p-7 md:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brand-deep">
            {item.tag}
          </p>
          <span
            aria-hidden="true"
            className="font-mono text-[11px] tracking-[0.14em] text-muted"
          >
            CASE {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-6 max-w-[24ch] font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-[28px]">
          {item.title}
        </h3>

        <BeforeAfter item={item} />

        <dl className="mt-8 grid gap-5 text-[14px] leading-[1.65]">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              O gargalo
            </dt>
            <dd className="mt-1.5 text-ink/85">{item.challenge}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              O que eu fiz
            </dt>
            <dd className="mt-1.5 text-ink/85">{item.solution}</dd>
          </div>
        </dl>
      </div>

      {/* Fixed min height so both footers line up side by side. */}
      <dl className="flex flex-wrap content-end items-end gap-x-10 gap-y-6 bg-ink px-7 py-7 text-white md:px-9 md:py-8 lg:min-h-[184px]">
        {/* dt must precede dd; flex-col-reverse puts the number back on top. */}
        <div className="flex flex-col-reverse">
          <dt className="mt-3 max-w-[22ch] text-[13px] leading-[1.45] text-white/70">
            {hero.label}
          </dt>
          <dd className="font-display text-[52px] font-semibold leading-none tracking-[-0.04em] text-[#7fb0ff] md:text-[64px]">
            {hero.value}
          </dd>
        </div>
        {rest.map((number) => (
          <div key={number.label} className="flex flex-col-reverse">
            <dt className="mt-3 max-w-[22ch] text-[13px] leading-[1.45] text-white/70">
              {number.label}
            </dt>
            <dd className="font-display text-[36px] font-semibold leading-none tracking-[-0.03em] md:text-[40px]">
              {number.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/** Quantitative cases get proportional bars; qualitative ones a from → to strip. */
function BeforeAfter({ item }: { item: CaseStudy }) {
  if (item.afterRatio !== undefined) {
    return (
      <div className="mt-7 grid gap-3 rounded-2xl border border-line bg-canvas p-5">
        <Bar label={item.before.label} value={item.before.value} width={1} muted />
        <Bar label={item.after.label} value={item.after.value} width={item.afterRatio} />
      </div>
    );
  }

  return (
    <div className="mt-7 grid items-center gap-3 rounded-2xl border border-line bg-canvas p-5 sm:grid-cols-[1fr_auto_1fr]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {item.before.label}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-muted line-through decoration-muted/40">
          {item.before.value}
        </p>
      </div>
      <span aria-hidden="true" className="text-brand sm:px-2">
        →
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
          {item.after.label}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-ink">
          {item.after.value}
        </p>
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  width,
  muted = false,
}: {
  label: string;
  value: string;
  width: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", muted ? "text-muted" : "text-brand")}
        >
          {label}
        </span>
        <span
          className={cn("font-display text-[15px] font-semibold", muted ? "text-muted" : "text-ink")}
        >
          {value}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/70">
        <div
          className={cn("h-full rounded-full", muted ? "bg-muted/35" : "bg-brand")}
          style={{ width: `${Math.max(width, 0.04) * 100}%` }}
        />
      </div>
    </div>
  );
}
