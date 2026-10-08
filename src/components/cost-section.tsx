import { ArrowRight, Check, Minus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import {
  BUTTON_PRIMARY,
  Section,
  SectionHeader,
} from "@/components/primitives";

const TODAY = [
  "A página demora a abrir no celular e o visitante volta pro Google.",
  "O formulário pede onze informações antes de qualquer conversa.",
  "O lead chega por e-mail e alguém precisa lembrar de responder.",
  "Ninguém sabe dizer de onde veio a última venda.",
  "Cada relatório é uma planilha copiada de outra planilha.",
];

const AFTER = [
  "Abre em menos de 1,5s no 4G, com métricas no verde.",
  "Duas etapas: o essencial primeiro, o resto depois do contato.",
  "O lead cai no WhatsApp ou no CRM com origem e contexto.",
  "Funil instrumentado: você vê onde ganha e onde perde.",
  "Relatório gerado sozinho, sempre com o mesmo número.",
];

export function CostSection() {
  return (
    <Section id="custo">
      <SectionHeader
        eyebrow="Processo Ineficiente tem um custo invisível."
        title={
          <>
            Ninguém emite nota fiscal da venda que{" "}
            <span className="text-brand">não aconteceu</span>.
          </>
        }
        description="A ineficiência parece de graça. O processo ineficente não aparece no extrato, aparece no lead que desistiu no meio do formulário, na proposta que levou três dias para sair e no time fazendo à mão o que o sistema deveria fazer sozinho."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
        <Reveal>
          <div className="h-full rounded-3xl border border-line bg-white/70 p-7 md:p-9">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-500">
              Como está hoje
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {TODAY.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5.5 shrink-0 place-items-center rounded-full bg-red-200/80 text-amber-800"
                  >
                    <Minus className="h-3 w-3" />
                  </span>
                  <span className="text-[15px] leading-[1.6] text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative h-full overflow-hidden rounded-3xl border border-brand/25 bg-ink p-7 text-white md:p-9">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand/35 blur-3xl"
            />
            <p className="relative font-mono text-[11px] uppercase tracking-[0.18em] text-blue-200">
              Como fica depois
            </p>
            <ul className="relative mt-6 flex flex-col gap-4">
              {AFTER.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-[1.6] text-slate-200">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <div className="mt-4 rounded-3xl border border-line bg-white p-7 md:p-9 lg:mt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            Conta de guardanapo
          </p>
          <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-10">
            <p className="font-display text-[21px] font-medium leading-[1.45] tracking-[-0.02em] text-ink md:text-[24px]">
              Mil visitas por mês, 2% de conversão e ticket de R$ 2.500 dão
              R$ 50 mil. Levar a conversão a 3% — o que costuma vir só de
              velocidade e clareza — coloca{" "}
              <span className="text-brand">R$ 25 mil por mês</span> na mesa.
            </p>
            <div className="flex flex-col gap-3 rounded-2xl bg-canvas p-5">
              <p className="text-[14px] leading-[1.6] text-muted">
                O sistema é um custo único. A ineficiência é uma assinatura
                mensal que você paga sem perceber.
              </p>
              <p className="text-[12px] leading-[1.6] text-muted/80">
                Exemplo ilustrativo.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t border-line pt-7 md:flex-row md:items-center md:justify-between md:gap-10">
            <div>
              <p className="font-display text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink md:text-[20px]">
                Quanto a sua operação está deixando na mesa?
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-muted">
                No diagnóstico gratuito eu faço essa conta com os seus números
                reais, não com um exemplo.
              </p>
            </div>
            <a href="#contato" className={`${BUTTON_PRIMARY} shrink-0`}>
              Calcular com meus números
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
