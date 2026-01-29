export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Estoque Brasil Inventários",
    alternateName: "Estoque Brasil",
    url: "https://estoquebrasill.com.br",
    logo: "https://estoquebrasill.com.br/images/logo_eb.png",
    description:
      "Empresa especializada em inventário de estoque para farmácias e varejo. Mais de 500 farmácias atendidas com 100% de precisão.",
    foundingDate: "2018",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-61-9266-1043",
      contactType: "customer service",
      areaServed: ["BR-DF", "BR-GO", "BR-TO", "BR-MA", "BR-PI", "BR-PA"],
      availableLanguage: "Portuguese",
    },
    sameAs: [
      "https://wa.me/556192661043",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
