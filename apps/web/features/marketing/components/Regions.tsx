"use client";

import { HiLocationMarker } from "react-icons/hi";

export default function Regions() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Solicito atendimento na minha região!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const regions = [
    { name: "DISTRITO FEDERAL", abbr: "DF", color: "#f84704" },
    { name: "GOIÁS", abbr: "GO", color: "#ff6b35" },
    { name: "TOCANTINS", abbr: "TO", color: "#f84704" },
    { name: "MARANHÃO", abbr: "MA", color: "#ff6b35" },
    { name: "PIAUÍ", abbr: "PI", color: "#f84704" },
    { name: "PARÁ", abbr: "PA", color: "#ff6b35" },
  ];

  return (
    <section id="regioes" className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#343434] mb-6">
            Atendemos Sua Região
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Presença consolidada em 6 estados.
            <br />
            Logística preparada para atender você com agilidade.
          </p>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {regions.map((region, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center hover:shadow-xl hover:border-2 hover:border-[#f84704] transition-all duration-300 hover:-translate-y-1 border-2 border-transparent group"
            >
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <HiLocationMarker className="w-12 h-12" style={{ color: region.color }} />
              </div>
              <div className="text-2xl font-bold text-[#f84704] mb-1">{region.abbr}</div>
              <div className="text-sm text-gray-600 font-medium">{region.name}</div>
            </div>
          ))}
        </div>

        {/* Map Illustration */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <svg
              className="w-32 h-32 mx-auto mb-4 text-[#f84704]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-2xl font-bold text-[#343434] mb-2">
              Cobertura Regional Completa
            </p>
            <p className="text-gray-600">
              Atendimento rápido e eficiente em todo o Centro-Oeste, Norte e Nordeste
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <p className="text-2xl text-[#343434] mb-6">
            Sua farmácia está em uma dessas regiões?
            <br />
            <span className="font-bold text-[#f84704]">Podemos começar ainda esta semana.</span>
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-xl px-12 py-5 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
          >
            Solicitar Atendimento na Minha Região
          </a>
        </div>
      </div>
    </section>
  );
}
