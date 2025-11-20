"use client";

import { FiActivity, FiCheckCircle, FiTrendingUp, FiShield, FiClock, FiArrowRight } from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";

export default function Hero() {
  const whatsappNumber = "556192661043";
  const whatsappMessage = encodeURIComponent("Olá! Quero reduzir minhas perdas de estoque agora!");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-grid-flow" style={{
          backgroundImage: `linear-gradient(#f84704 1px, transparent 1px), linear-gradient(90deg, #f84704 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        {/* Radial Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Column */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f84704] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f84704]"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">Tecnologia de Precisão para Farmácias</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white animate-fade-in-up animation-delay-200 tracking-tight">
              Tenha precisão absoluta no seu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f84704] to-[#ff8c00] animate-gradient">
                estoque em 24h
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg animate-fade-in-up animation-delay-400">
              Elimine perdas e furos de estoque com nossa tecnologia proprietária de contagem. Precisão de 100% garantida em contrato.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 bg-[#f84704] hover:bg-[#d63d03] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#f84704]/25"
              >
                <span>Começar Agora</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                Conhecer Método
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 animate-fade-in-up animation-delay-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#f84704]">
                  <FiClock className="w-5 h-5" />
                  <span className="font-bold text-white">24h</span>
                </div>
                <p className="text-xs text-gray-500">Tempo médio de execução</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#f84704]">
                  <FiShield className="w-5 h-5" />
                  <span className="font-bold text-white">100%</span>
                </div>
                <p className="text-xs text-gray-500">Garantia de precisão</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#f84704]">
                  <HiOfficeBuilding className="w-5 h-5" />
                  <span className="font-bold text-white">500+</span>
                </div>
                <p className="text-xs text-gray-500">Farmácias atendidas</p>
              </div>
            </div>
          </div>

          {/* Right Column - Holographic Dashboard */}
          <div className="hidden lg:block relative h-[600px] w-full animate-fade-in-up animation-delay-400">
            {/* Main Dashboard Card */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#f84704]/10 animate-float">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-mono text-gray-500">ESTOQUE_BRASIL_SYS_V2.0</span>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Chart Area Placeholder */}
                <div className="h-32 bg-gradient-to-r from-[#f84704]/20 to-transparent rounded-lg border border-[#f84704]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-4 pb-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-8 bg-[#f84704] opacity-80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="text-gray-400 text-xs mb-1">Acuracidade</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                      99.9%
                      <FiCheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="text-gray-400 text-xs mb-1">Itens Auditados</div>
                    <div className="text-2xl font-bold text-white">12.450</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-10 bg-[#1a1a1a] border border-white/10 p-4 rounded-xl shadow-lg animate-float-slow" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Lucro Recuperado</div>
                  <div className="text-sm font-bold text-white">+ R$ 15.000</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-32 left-0 bg-[#1a1a1a] border border-white/10 p-4 rounded-xl shadow-lg animate-float-slow" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f84704]/20 rounded-lg text-[#f84704]">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Status do Inventário</div>
                  <div className="text-sm font-bold text-white">Em Andamento</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
