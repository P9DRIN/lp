import { ArrowRight, Mail } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CONTAINER } from "@/components/primitives";
import { CONTACT } from "@/lib/site";

const REASSURANCE = [
  CONTACT.responseTime,
  "Sem compromisso e sem apresentação de vendas",
  "O diagnóstico escrito é seu, com ou sem proposta",
];

const MAIL_HREF = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
  "Diagnóstico gratuito"
)}&body=${encodeURIComponent(
  "Oi! Queria entender quanto a ineficiência está custando no meu negócio.\n\nEmpresa:\nSite atual:\nPrincipal gargalo hoje:\n"
)}`;

export function CtaSection() {
  return (
    <section id="contato" className="scroll-mt-24 px-3 pb-16 pt-8 sm:px-5">
      <div className={CONTAINER}>
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-7 py-14 md:rounded-[40px] md:px-16 md:py-20">
            <div
              aria-hidden="true"
              className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-brand/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
            />

            <div className="relative max-w-[46rem]">
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-blue-200">
                <span aria-hidden="true" className="h-px w-6 bg-blue-300/50" />
                Próximo passo
              </p>

              <h2 className="mt-6 font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px] md:text-[52px]">
                Vamos descobrir quanto a ineficiência está te custando por mês.
              </h2>

              <p className="mt-6 max-w-[56ch] text-[16px] leading-[1.65] text-slate-300 md:text-[17px]">
                Uma conversa rápida pra entender seu problema, não te vender cultura da minha empresa. Logo após sai o diagnóstico por
                escrito e com o número na mão, mesmo que decida não contratar
                nada. Se eu achar que o seu caso não precisa de mim, eu digo.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={MAIL_HREF}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[14px] font-semibold text-ink transition-colors duration-200 hover:bg-blue-100"
                >
                  Diagnóstico gratuito
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </div>

              <ul className="mt-10 flex flex-col gap-2.5 text-[13px] text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-7">
                {REASSURANCE.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
