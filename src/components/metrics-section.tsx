import { Reveal } from "@/components/reveal";
import { Eyebrow, Section } from "@/components/primitives";
import { METRICS } from "@/lib/site";

export function MetricsSection() {
  return (
    <Section id="metricas" className="pb-4 pt-16 md:pb-6 md:pt-20">
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-line bg-white">
          <div className="flex flex-col gap-3 border-b border-line px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <Eyebrow>Números das entregas</Eyebrow>
            <p className="text-[13px] text-muted">
              Média dos projetos colocados em produção nos últimos 24 meses.
            </p>
          </div>

          <dl className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
            {/* <dl> only allows dt/dd (optionally in one <div>) as children, and
                dt must come first — the number is moved on top with `order`. */}
            {METRICS.map((metric, index) => (
              <Reveal
                key={metric.label}
                delay={index * 0.06}
                className="flex flex-col px-6 py-8 sm:px-8"
              >
                <dt className="order-2 mt-3 text-[14px] font-semibold text-ink">
                  {metric.label}
                </dt>
                <dd className="order-1 font-display text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink md:text-[48px]">
                  {metric.value}
                </dd>
                <dd className="order-3 mt-2 text-[13px] leading-[1.6] text-muted">
                  {metric.detail}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Reveal>
    </Section>
  );
}
