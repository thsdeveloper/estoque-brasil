import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serviços de Inventário de Estoque para Farmácias",
  description:
    "Conheça nossos serviços especializados de inventário: contagem completa, inventário rotativo, auditoria de estoque e consultoria. Atendemos farmácias em DF, GO, TO, MA, PI e PA.",
  keywords: [
    "serviços inventário farmácia",
    "contagem de estoque",
    "inventário rotativo",
    "auditoria de estoque",
    "consultoria estoque farmácia",
    "inventário completo",
    "balanço de estoque farmácia",
  ],
  alternates: {
    canonical: "https://estoquebrasill.com.br/servicos",
  },
  openGraph: {
    title: "Serviços de Inventário de Estoque para Farmácias | Estoque Brasil",
    description:
      "Contagem completa, inventário rotativo, auditoria e consultoria. Serviços especializados para farmácias com tecnologia de ponta.",
    url: "https://estoquebrasill.com.br/servicos",
    images: [
      {
        url: "/images/og-servicos.jpg",
        width: 1200,
        height: 630,
        alt: "Serviços de Inventário - Estoque Brasil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serviços de Inventário de Estoque para Farmácias | Estoque Brasil",
    description:
      "Contagem completa, inventário rotativo, auditoria e consultoria. Serviços especializados para farmácias.",
    images: ["/images/og-servicos.jpg"],
  },
};

export default function ServicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
