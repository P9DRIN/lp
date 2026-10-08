import { Plus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeader } from "@/components/primitives";

const OBJECTIONS = [
  {
    question: "Vai sair caro.",
    answer:
      "Caro comparado a quê? O preço fecha antes de começar e não muda no meio do projeto. Caro costuma ser o terceiro freelancer refazendo o mesmo site, ou o lead que some porque a página demora nove segundos para abrir. Nós cuidamos disso.",
  },
  {
    question: "Já tenho um site, só preciso de uns ajustes.",
    answer:
      "Ótimo, então talvez o trabalho seja pequeno mesmo. Prefiro te dizer isso do que te vender um projeto inteiro. Se três ajustes resolvem, eu entrego os três ajustes e a gente encerra por aí.",
  },
  {
    question: "Não tenho tempo para acompanhar isso.",
    answer:
      "Seu tempo total no projeto: uma chamada de 30~45 minutos no início e cerca de 20 minutos por semana. O resto você abre no celular quando quiser, sem marcar reunião.",
  },
  {
    question: "E se eu não gostar do resultado?",
    answer:
      "Você aprova um protótipo navegável antes da primeira linha de código. Nada é construído sem esse aceite, e revisões nessa fase são ilimitadas, é justamente o momento em que mudar de ideia não custa nada.",
  },
  {
    question: "Depois de entregar, eu fico na mão?",
    answer:
      "Você recebe o repositório, a documentação e um vídeo de passagem de bastão. Trinta dias de ajustes já vêm inclusos. Manutenção depois disso é opcional, mensal e cancelável a qualquer momento.",
  },
  {
    question: "Meu negócio é muito específico, ninguém entende.",
    answer:
      "Provavelmente é mesmo. Por isso o projeto começa por diagnóstico, e não por layout. O sistema se adapta ao seu processo, não o contrário: se o seu jeito de trabalhar funciona, e permanece. Vamos parar de depender de memória e planilha.",
  },
  {
    question: "Prefiro um construtor de sites, sai mais barato.",
    answer:
      "Financeiramente, sim. Até o dia em que você precisa de uma integração que ele não oferece, ou a página passa a carregar em seis segundos por causa de cinco plugins. Se o construtor resolve o seu caso, eu digo isso na primeira chamada e você economiza o projeto inteiro.",
  },
];

export function ObjectionsSection() {
  return (
    <Section id="objecoes" className="blueprint-grid">
      <div className="mx-auto max-w-[760px]">
        <SectionHeader
          align="center"
          eyebrow=""
          title={
            <>
              As perguntas que você faria{" "}
              <span className="text-brand">na segunda reunião</span>.
            </>
          }
          description="Melhor resolver agora. Abaixo estão as objeções que mais aparecem — respondidas do mesmo jeito que eu responderia no telefone."
        />

        <div className="mt-12 flex flex-col gap-3">
          {OBJECTIONS.map((item, index) => (
            <Reveal key={item.question} delay={Math.min(index, 4) * 0.05}>
              {/* Native disclosure: keyboard- and screen-reader-ready with no
                  JavaScript. `name` makes the group behave as an accordion. */}
              <details
                name="objecoes"
                className="group rounded-2xl border border-line bg-white transition-colors duration-200 open:border-brand/30 hover:border-brand/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-[17px] font-medium leading-[1.4] tracking-[-0.01em] text-ink md:text-[19px]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-200 group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-[1.7] text-muted md:pr-16">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
