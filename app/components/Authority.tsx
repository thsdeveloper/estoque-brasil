"use client";

import { HiStar } from "react-icons/hi";

export default function Authority() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Quero fazer parte desse grupo de farmácias de sucesso!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const stats = [
    { number: "500+", label: "Farmácias Atendidas" },
    { number: "100%", label: "Precisão Garantida" },
    { number: "24h", label: "Tempo Médio" },
    { number: "6", label: "Estados Atendidos" },
  ];

  const badges = [
    "Equipe 100% Especializada",
    "Tecnologia Certificada",
    "Atendimento Profissional",
    "Relatórios Detalhados",
  ];

  return (
    <section id="diferenciais" className="py-20 bg-[#343434] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #f84704 0, #f84704 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-l-4 border-[#f84704] px-6 py-3 rounded">
            <HiStar className="w-6 h-6 text-[#f84704]" />
            <span className="text-[#f84704] font-bold text-sm uppercase tracking-wide">
              RESULTADOS COMPROVADOS
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            + de 500 Farmácias Já Confiam
            <br />
            No Nosso Trabalho
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            De pequenas drogarias a grandes redes. Todos os dias,
            ajudamos farmacêuticos a recuperarem o controle do estoque.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-black text-[#f84704] mb-2">
                {stat.number}
              </div>
              <div className="text-lg text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl p-8 md:p-12 border-l-6 border-[#f84704] shadow-2xl">
            <div className="flex justify-start mb-4">
              <svg className="w-12 h-12 text-[#f84704]/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-2xl text-[#343434] italic mb-6 leading-relaxed">
              "Descobrimos R$ 38 mil em produtos que o sistema não mostrava.
              O investimento no inventário pagou em menos de 1 semana."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f84704] rounded-full flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <div>
                <p className="font-semibold text-[#343434]">Farmacêutica Responsável</p>
                <p className="text-gray-600">Rede com 12 lojas (GO)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 bg-[#f84704]/10 border border-[#f84704] rounded-full px-6 py-3 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-medium">{badge}</span>
            </div>
          ))}
        </div>

        {/* Visual Element - Team Image Placeholder */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f84704]/30 to-[#d63d03]/20 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-32 h-32 text-white/40 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-white text-xl font-semibold">
                  Equipe Profissional Estoque Brasil
                </p>
                <p className="text-white/80">Especializada em Inventário Farmacêutico</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-xl px-12 py-5 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
          >
            Fazer Parte Desse Grupo Agora
          </a>
        </div>
      </div>
    </section>
  );
}
