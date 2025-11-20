"use client";

import { HiClock } from "react-icons/hi";

export default function FinalCTA() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Quero solicitar meu orçamento gratuito agora!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#343434] via-[#2a2a2a] to-[#1a1a1a] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #f84704 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-4 border-[#f84704]/30 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-[#f84704]/20 rounded-full"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-[#f84704]/25 rounded-full"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
          Pare de{" "}
          <span className="text-[#f84704] relative">
            Perder Dinheiro
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#f84704]/50"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,6 Q75,0 150,6 T300,6"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </span>
          .
          <br />
          Comece a Lucrar Mais Hoje.
        </h2>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Mais de 500 farmácias já deram o primeiro passo.
          <br />
          <span className="font-semibold text-white">
            É a sua vez de recuperar o controle do estoque.
          </span>
        </p>

        {/* Main CTA Button */}
        <div className="mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-2xl px-16 py-6 rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-[#f84704]/50 hover:shadow-[#f84704]/70 hover:scale-105"
          >
            <svg
              className="w-7 h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Solicitar Orçamento Gratuito Agora
          </a>
        </div>

        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 bg-[#f84704]/20 backdrop-blur-sm border border-[#f84704] rounded-full px-6 py-3 mb-8">
          <HiClock className="w-5 h-5 text-[#f84704] animate-pulse" />
          <span className="text-white font-semibold">
            Agendamentos limitados para esta semana
          </span>
        </div>

        {/* Guarantees */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Sem compromisso</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Orçamento em 5 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Atendimento profissional garantido</span>
          </div>
        </div>
      </div>
    </section>
  );
}
