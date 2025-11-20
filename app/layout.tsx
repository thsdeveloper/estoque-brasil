import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Estoque Brasil Inventários | Inventário Especializado para Farmácias",
  description: "Inventário 100% preciso em 24h, sem fechar as portas. Mais de 500 farmácias já recuperaram o controle do estoque e aumentaram o lucro. Atendemos DF, GO, TO, MA, PI e PA.",
  keywords: ["inventário de estoque", "farmácia", "varejo", "contagem de estoque", "auditoria de estoque", "prevenção de perdas"],
  authors: [{ name: "Estoque Brasil Inventários" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Estoque Brasil Inventários | Inventário Especializado para Farmácias",
    description: "Inventário 100% preciso em 24h, sem fechar as portas. Mais de 500 farmácias atendidas.",
    siteName: "Estoque Brasil Inventários",
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
