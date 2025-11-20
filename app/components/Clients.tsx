"use client";

import { HiStar } from "react-icons/hi";

export default function Clients() {
  // Logos dos clientes (adicione as logos reais em /public/clients/)
  const clients = [
    { name: "Farmácia Central", shortName: "Central", color: "#2563eb" },
    { name: "Drogaria Mais Saúde", shortName: "Mais Saúde", color: "#dc2626" },
    { name: "Farmácia Popular", shortName: "Popular", color: "#16a34a" },
    { name: "Drogaria São Lucas", shortName: "São Lucas", color: "#ea580c" },
    { name: "Farmácia Vida", shortName: "Vida", color: "#7c3aed" },
    { name: "Rede Saúde Total", shortName: "Saúde Total", color: "#0891b2" },
    { name: "Farmácia BemViver", shortName: "BemViver", color: "#c026d3" },
    { name: "Drogaria União", shortName: "União", color: "#059669" },
    { name: "Farmácia Feliz", shortName: "Feliz", color: "#ca8a04" },
    { name: "Rede Farma Bem", shortName: "Farma Bem", color: "#4f46e5" },
  ];

  // Duplicar array 3x para scroll infinito mais suave
  const duplicatedClients = [...clients, ...clients, ...clients];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#f84704]/10 border border-[#f84704]/30 rounded-full px-4 py-2 mb-4">
            <HiStar className="w-5 h-5 text-[#f84704]" />
            <span className="text-sm font-bold text-[#f84704] uppercase tracking-wide">
              Confiança Comprovada
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#343434] mb-4">
            Empresas que Confiam no Nosso Trabalho
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mais de 500 farmácias e estabelecimentos comerciais já transformaram
            seus estoques com nossa solução profissional.
          </p>
        </div>

        {/* Carrossel Infinito */}
        <div className="relative overflow-hidden py-8">
          {/* Gradient Overlays - Mais suaves */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>

          {/* Logos Container */}
          <div className="flex animate-scroll-infinite hover:pause-animation">
            {duplicatedClients.map((client, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-6 group cursor-pointer"
                style={{ width: "200px" }}
              >
                <div className="relative h-28 flex items-center justify-center p-6 rounded-xl bg-white border-2 border-gray-200 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:border-[#f84704]">
                  {/* Logo Placeholder com SVG */}
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${client.color}15`,
                      }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: client.color }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    {/* Name */}
                    <div className="text-center">
                      <div className="text-base font-bold" style={{ color: client.color }}>
                        {client.shortName}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Farmácias
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{
                         boxShadow: `0 0 30px ${client.color}30`
                       }}>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#f84704]">Todas</span> essas empresas escolheram nossa solução para revolucionar a gestão de estoque
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-12 border-t-2 border-gray-200">
          <div className="text-center group">
            <div className="text-5xl font-black bg-gradient-to-r from-[#f84704] to-[#ff6b35] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
              500+
            </div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
              Clientes Atendidos
            </div>
          </div>
          <div className="text-center group">
            <div className="text-5xl font-black bg-gradient-to-r from-[#f84704] to-[#ff6b35] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
              15M+
            </div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
              Produtos Inventariados
            </div>
          </div>
          <div className="text-center group">
            <div className="text-5xl font-black bg-gradient-to-r from-[#f84704] to-[#ff6b35] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
              98%
            </div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
              Satisfação dos Clientes
            </div>
          </div>
          <div className="text-center group">
            <div className="text-5xl font-black bg-gradient-to-r from-[#f84704] to-[#ff6b35] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
              6
            </div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
              Estados Atendidos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
