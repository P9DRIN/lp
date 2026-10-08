import { Accessibility, Code2, KeyRound, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeader } from "@/components/primitives";

const PILLARS: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Code2,
    title: "Engenharia de verdade",
    description:
      "TypeScript estrito, componentes tipados, revisão de código e teste no que realmente quebra. Nada de arquivo gerado que ninguém consegue abrir seis meses depois.",
  },
  {
    icon: Gauge,
    title: "Performance é requisito, não brinde",
    description:
      "O orçamento de performance é definido antes do design. Se a página não bate a meta de Core Web Vitals, ela não sobe — é critério de aceite, igual a qualquer outro.",
  },
  {
    icon: Accessibility,
    title: "Acessível e indexável",
    description:
      "WCAG AA, HTML semântico, contraste medido e navegação por teclado. Quem usa leitor de tela também é cliente — e o Google lê exatamente a mesma estrutura.",
  },
  {
    icon: KeyRound,
    title: "Você fica dono de tudo",
    description:
      "Repositório, domínio, contas de nuvem e documentação no seu nome, desde o primeiro dia. Se um dia quiser trocar de fornecedor, você troca — sem pedir licença.",
  },
];

const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "three.js / WebGL",
  "PostgreSQL",
  "Node.js",
  "Vercel / AWS",
];

export function AuthoritySection() {
  return (
    <Section id="autoridade">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            eyebrow="Com quem você vai trabalhar"
            title={
              <>
                Você contrata a <span className="text-brand">decisão</span>{" "}
                técnica, não só as horas.
              </>
            }
            description="A parte cara de um software não é escrever o código — é decidir o que não construir. Anos de produto para web entram nessa conta: o que você recebe é código que outra pessoa consegue manter, decisão documentada e alguém que atende o telefone depois do go-live."
          />

          <div className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Stack em produção
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {STACK.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delay={index * 0.06} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-7">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.65] text-muted">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
