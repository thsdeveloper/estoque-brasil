import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Funciona o Inventário de Estoque",
  description:
    "Entenda o passo a passo do nosso processo de inventário: agendamento, execução sem parar operações, relatório detalhado e suporte pós-inventário. Simples e eficiente.",
  keywords: [
    "como funciona inventário",
    "processo inventário farmácia",
    "etapas inventário estoque",
    "metodologia inventário",
    "inventário sem fechar loja",
    "inventário 24 horas",
  ],
  alternates: {
    canonical: "https://estoquebrasill.com.br/como-funciona",
  },
  openGraph: {
    title: "Como Funciona o Inventário de Estoque | Estoque Brasil",
    description:
      "Processo simples em 4 etapas: agendamento, execução sem parar operações, relatório detalhado e suporte. Inventário em até 24h.",
    url: "https://estoquebrasill.com.br/como-funciona",
    images: [
      {
        url: "/images/og-como-funciona.jpg",
        width: 1200,
        height: 630,
        alt: "Como Funciona - Estoque Brasil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Como Funciona o Inventário de Estoque | Estoque Brasil",
    description:
      "Processo simples em 4 etapas: agendamento, execução sem parar operações, relatório detalhado e suporte.",
    images: ["/images/og-como-funciona.jpg"],
  },
};

export default function ComoFuncionaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
