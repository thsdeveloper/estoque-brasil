"use client";

export default function HowItWorks() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Quero começar meu inventário agora!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const steps = [
    {
      number: "1",
      icon: (
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: "AGENDAMENTO RÁPIDO",
      description: [
        "Entre em contato pelo WhatsApp.",
        "Orçamento gratuito em até 5 minutos.",
        "Agendamos na melhor data para você.",
      ],
    },
    {
      number: "2",
      icon: (
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      title: "EXECUÇÃO ÁGIL",
      description: [
        "Equipe uniformizada chega no horário.",
        "Trabalho rápido com tecnologia de ponta.",
        "Sua loja continua vendendo normalmente.",
      ],
    },
    {
      number: "3",
      icon: (
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: "RELATÓRIO DE INTELIGÊNCIA",
      description: [
        "Análise completa das divergências.",
        "Identificação de produtos vencidos.",
        "Relatório detalhado em até 24h.",
      ],
    },
    {
      number: "4",
      icon: (
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      title: "RESULTADO & LUCRO",
      description: [
        "Você corrige as divergências.",
        "Recupera dinheiro parado.",
        "Aumenta a lucratividade comprovada.",
      ],
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#343434] mb-6">
            Como Transformamos Seu Estoque
            <br />
            Em 4 Passos Simples
          </h2>
          <p className="text-xl text-gray-600">
            Processo comprovado, rápido e sem complicação.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f84704]/20 via-[#f84704]/50 to-[#f84704]/20 transform -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Step Content */}
                  <div className="flex-1 bg-[#F9F9F9] border-2 border-[#E0E0E0] rounded-xl p-8 hover:border-[#f84704] transition-all duration-300 hover:shadow-xl group">
                    <div className="flex items-start gap-4">
                      <div className="text-[#f84704] group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-bold text-white bg-[#f84704] px-3 py-1 rounded-full">
                            PASSO {step.number}
                          </span>
                          <h3 className="text-2xl font-bold text-[#343434]">{step.title}</h3>
                        </div>
                        <ul className="space-y-2">
                          {step.description.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-[#f84704] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Step Number Circle - Desktop */}
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-[#f84704] rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-3xl font-black text-white">{step.number}</span>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block flex-1"></div>
                </div>

                {/* Arrow - Not on last step */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-6 lg:hidden">
                    <svg className="w-8 h-8 text-[#f84704] animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Message */}
        <div className="text-center mt-16 mb-8">
          <p className="text-2xl text-gray-700 mb-2">
            Simples assim. Sem burocracia, sem complicação.
          </p>
          <p className="text-3xl font-bold text-[#343434]">
            Apenas <span className="text-[#f84704]">resultado</span>.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-xl px-12 py-5 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
          >
            Começar Agora Meu Inventário
          </a>
        </div>
      </div>
    </section>
  );
}
