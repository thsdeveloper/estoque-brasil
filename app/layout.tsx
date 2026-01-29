import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://estoquebrasill.com.br"),
  title: {
    default: "Estoque Brasil Inventários | Inventário Especializado para Farmácias",
    template: "%s | Estoque Brasil Inventários",
  },
  description: "Inventário 100% preciso em 24h, sem fechar as portas. Mais de 500 farmácias já recuperaram o controle do estoque e aumentaram o lucro. Atendemos DF, GO, TO, MA, PI e PA.",
  keywords: [
    "inventário de estoque",
    "inventário farmácia",
    "contagem de estoque",
    "auditoria de estoque",
    "prevenção de perdas",
    "inventário Brasília",
    "inventário Goiânia",
    "inventário DF",
    "inventário Goiás",
    "inventário Tocantins",
    "inventário farmácia Brasília",
    "gestão de estoque farmácia",
    "balanço de estoque",
    "inventário rotativo",
    "inventário varejo",
  ],
  authors: [{ name: "Estoque Brasil Inventários" }],
  creator: "Estoque Brasil Inventários",
  publisher: "Estoque Brasil Inventários",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://estoquebrasill.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://estoquebrasill.com.br",
    title: "Estoque Brasil Inventários | Inventário Especializado para Farmácias",
    description: "Inventário 100% preciso em 24h, sem fechar as portas. Mais de 500 farmácias atendidas.",
    siteName: "Estoque Brasil Inventários",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Estoque Brasil Inventários - Inventário especializado para farmácias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estoque Brasil Inventários | Inventário Especializado para Farmácias",
    description: "Inventário 100% preciso em 24h, sem fechar as portas. Mais de 500 farmácias atendidas.",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
