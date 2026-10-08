/**
 * Single place to edit the copy that changes most often: contact details and
 * the headline numbers.
 *
 * NOTE: every value under `metrics` and `cases` is a PLACEHOLDER. Replace them
 * with real, auditable numbers before publishing — inflated claims are the
 * fastest way to lose the trust this page is built to earn.
 */

export const CONTACT = {
  email: "tech@limasilva.dev",
  responseTime: "Resposta em até 24h",
};

export const NAV_LINKS = [
  { href: "#custo", label: "O custo" },
  { href: "#entregas", label: "Entregas" },
  { href: "#processo", label: "Processo" },
  { href: "#objecoes", label: "Dúvidas" },
];

export type Metric = {
  value: string;
  label: string;
  detail: string;
};

/** MOCK — swap for real numbers. */
export const METRICS: Metric[] = [
  {
    value: "+14",
    label: "Sistemas entregues",
    detail: "Landing pages, painéis internos e integrações, automações, etc.",
  },
  {
    value: "24 dias",
    label: "Tempo médio até o go-live",
    detail: "Do primeiro diagnóstico ao site no ar, com escopo fechado.",
  },
  {
    value: "24 meses",
    label: "Tempo médio de parceria",
    detail: "Clientes que voltam para novos projetos e/ou continuam com cobertura de manutenção",
  },
  {
    value: "+700",
    label: "Deploys em produção",
    detail: "Mudanças de código entregues em sites e sistemas, com monitoramento de erros e performance.",
  },
];

export type CaseStudy = {
  tag: string;
  title: string;
  challenge: string;
  solution: string;
  before: { label: string; value: string };
  after: { label: string; value: string };
  /** Share of the "before" bar the "after" bar fills (0–1). Omit for qualitative shifts. */
  afterRatio?: number;
  numbers: { value: string; label: string }[];
};

/** Casos reais, anonimizados a pedido dos clientes. */
export const CASES: CaseStudy[] = [
  {
    tag: "Automação crítica",
    title: "Um processo vital que travava a operação por até 5 minutos.",
    challenge:
      "A automação que sustentava o funil da empresa demorava até 5 minutos para rodar. Enquanto isso, o lead esfriava e a equipe esperava.",
    solution:
      "Reescrevi o fluxo do zero, eliminei os gargalos de processamento e deixei cada etapa monitorada.",
    before: { label: "Antes", value: "até 5 min" },
    after: { label: "Depois, no pior caso", value: "30 s" },
    afterRatio: 0.1,
    numbers: [
      { value: "10x", label: "Mais rápido no pior cenário" },
      { value: "+30%", label: "Leads convertidos" },
    ],
  },
  {
    tag: "Plataforma sob medida",
    title: "Automações soltas viraram um produto que vende sozinho.",
    challenge:
      "O negócio dependia de várias automações desconectadas, difíceis de manter e impossíveis de transformar em oferta.",
    solution:
      "Construí do zero uma plataforma personalizada que reúne tudo e entrega produtos com IA prontos para vender.",
    before: { label: "Antes", value: "Automações soltas" },
    after: { label: "Depois", value: "Plataforma própria com IA" },
    numbers: [
      { value: "~50%", label: "Da base migrou para planos mais caros" },
    ],
  },
];
