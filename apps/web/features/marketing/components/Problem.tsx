"use client";

import { HiExclamationCircle, HiCurrencyDollar } from "react-icons/hi";

export default function Problem() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Não quero mais perder dinheiro com estoque!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const problems = [
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      title: "Produtos Vencidos",
      description: "Mercadorias paradas na prateleira virando prejuízo e ocupando espaço de produtos que realmente vendem.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: "Divergência Física vs Sistema",
      description: "Seu sistema mostra 50 unidades, mas você tem apenas 35. Onde estão as outras 15?",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Perdas Não Identificadas",
      description: "Furtos, quebras e erros de processo consumindo até 15% do seu lucro sem você perceber.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      title: "Tempo Desperdiçado",
      description: "Sua equipe contando manualmente, com erros, e parando o atendimento aos clientes.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF3E0] border-l-4 border-[#f84704] px-6 py-3 rounded">
            <HiExclamationCircle className="w-6 h-6 text-[#f84704]" />
            <span className="text-[#f84704] font-bold text-sm uppercase tracking-wide">
              ALERTA: Isso está acontecendo na sua farmácia agora
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#343434] mb-6">
            Você está deixando dinheiro na mesa
            <br />
            <span className="text-[#f84704]">(E a gente vai te provar isso)</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Olha, a gente não quer assustar você. Mas precisa ser honesto:
            <br />
            <span className="font-semibold text-[#343434] inline-flex items-center gap-2 flex-wrap justify-center">
              Todo dia que passa sem um inventário preciso, é dinheiro indo embora sem você perceber.
              <HiExclamationCircle className="w-5 h-5 text-[#f84704]" />
            </span>
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-[#F9F9F9] border-2 border-[#E0E0E0] rounded-xl p-8 hover:border-[#f84704] transition-all duration-300 hover:shadow-lg group"
            >
              <div className="text-[#f84704] mb-4 group-hover:scale-110 transition-transform duration-300">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-[#343434] mb-3">{problem.title}</h3>
              <p className="text-gray-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Impact Statistics */}
        <div className="bg-[#343434] rounded-xl p-8 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <HiCurrencyDollar className="w-40 h-40 text-white" />
          </div>
          <p className="text-2xl md:text-3xl text-white leading-relaxed relative z-10">
            Farmácias sem inventário profissional perdem{" "}
            <span className="text-[#f84704] font-bold text-4xl">em média R$ 47 mil/ano</span>
            <br />
            <span className="text-gray-400 text-lg inline-flex items-center gap-2 justify-center flex-wrap mt-2">
              (Sim, você leu certo. É muita grana indo embora!
              <HiExclamationCircle className="w-5 h-5 text-[#f84704]" />
              )
            </span>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-lg px-10 py-4 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Não Quero Mais Perder Dinheiro
          </a>
        </div>
      </div>
    </section>
  );
}
