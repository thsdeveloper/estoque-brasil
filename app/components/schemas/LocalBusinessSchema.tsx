export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://estoquebrasill.com.br/#localbusiness",
    name: "Estoque Brasil Inventários",
    image: "https://estoquebrasill.com.br/images/logo_eb.png",
    description:
      "Inventário especializado para farmácias e varejo. Contagem 100% precisa em até 24h sem fechar as portas.",
    url: "https://estoquebrasill.com.br",
    telephone: "+55-61-9266-1043",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brasília",
      addressRegion: "DF",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -15.7942,
      longitude: -47.8822,
    },
    areaServed: [
      {
        "@type": "State",
        name: "Distrito Federal",
        sameAs: "https://pt.wikipedia.org/wiki/Distrito_Federal_(Brasil)",
      },
      {
        "@type": "State",
        name: "Goiás",
        sameAs: "https://pt.wikipedia.org/wiki/Goi%C3%A1s",
      },
      {
        "@type": "State",
        name: "Tocantins",
        sameAs: "https://pt.wikipedia.org/wiki/Tocantins",
      },
      {
        "@type": "State",
        name: "Maranhão",
        sameAs: "https://pt.wikipedia.org/wiki/Maranh%C3%A3o",
      },
      {
        "@type": "State",
        name: "Piauí",
        sameAs: "https://pt.wikipedia.org/wiki/Piau%C3%AD",
      },
      {
        "@type": "State",
        name: "Pará",
        sameAs: "https://pt.wikipedia.org/wiki/Par%C3%A1",
      },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "500",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
