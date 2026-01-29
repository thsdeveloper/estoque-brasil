export default function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Inventário de Estoque",
    provider: {
      "@type": "Organization",
      name: "Estoque Brasil Inventários",
      url: "https://estoquebrasill.com.br",
    },
    name: "Inventário Especializado para Farmácias",
    description:
      "Serviço de inventário 100% preciso em até 24h, sem fechar as portas. Inclui contagem completa, relatório detalhado e suporte pós-inventário.",
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços de Inventário",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Inventário Completo",
            description:
              "Contagem total de todos os itens do estoque com tecnologia de coletores de dados profissionais.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Inventário Rotativo",
            description:
              "Contagem periódica e planejada para manter o estoque sempre atualizado.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Auditoria de Estoque",
            description:
              "Verificação e análise de divergências entre estoque físico e sistema.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Consultoria em Gestão de Estoque",
            description:
              "Orientação especializada para melhorar processos e reduzir perdas.",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
