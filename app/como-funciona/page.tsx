"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import { FiCalendar, FiZap, FiFileText, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

export default function ComoFuncionaPage() {
    const whatsappNumber = "556192661043";
    const whatsappMessage = encodeURIComponent("Quero agendar meu inventário!");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const steps = [
        {
            number: "01",
            title: "Agendamento Inteligente",
            description: "Entre em contato e receba um orçamento em 5 minutos. Definimos a melhor data para sua operação, sem burocracia.",
            icon: FiCalendar,
            color: "from-blue-500 to-cyan-500",
            details: ["Atendimento via WhatsApp", "Orçamento imediato", "Flexibilidade de horários"]
        },
        {
            number: "02",
            title: "Execução de Alta Performance",
            description: "Nossa equipe uniformizada chega com coletores de última geração. Contamos tudo enquanto sua loja continua vendendo.",
            icon: FiZap,
            color: "from-orange-500 to-red-500",
            details: ["Equipe especializada", "Tecnologia própria", "Zero interrupção"]
        },
        {
            number: "03",
            title: "Auditoria & Análise",
            description: "Não apenas contamos. Auditamos divergências, validamos validades e geramos inteligência sobre seu estoque.",
            icon: FiFileText,
            color: "from-purple-500 to-pink-500",
            details: ["Dupla checagem", "Relatório de vencidos", "Análise de perdas"]
        },
        {
            number: "04",
            title: "Entrega de Resultados",
            description: "Em até 24h você recebe o relatório completo. Dados precisos para tomar decisões e aumentar seu lucro imediatamente.",
            icon: FiTrendingUp,
            color: "from-green-500 to-emerald-500",
            details: ["Relatório digital", "Dados acionáveis", "Suporte pós-inventário"]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-24 bg-[#1a1a1a] overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, #f84704 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }}></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#f84704]/20 text-[#f84704] text-sm font-bold mb-6 border border-[#f84704]/30">
                            METODOLOGIA COMPROVADA
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                            Do Caos ao Controle <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f84704] to-[#ff8c00]">
                                Em 4 Etapas
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Entenda como nosso processo de inventário elimina erros e recupera o lucro da sua farmácia em tempo recorde.
                        </p>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-24 bg-gray-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2 z-0"></div>

                        <div className="space-y-24">
                            {steps.map((step, index) => (
                                <div key={index} className={`relative flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                                    {/* Content Card */}
                                    <div className="flex-1 w-full">
                                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${step.color}`}></div>

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <step.icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-5xl font-black text-gray-100 absolute top-4 right-4 select-none">
                                                    {step.number}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                {step.description}
                                            </p>

                                            <ul className="space-y-3">
                                                {step.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                        <FiCheckCircle className={`w-4 h-4 text-gray-400 group-hover:text-${step.color.split('-')[1]}-500 transition-colors`} />
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Center Marker (Desktop) */}
                                    <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-gray-200 rounded-full items-center justify-center z-10">
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.color}`}></div>
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1 w-full hidden lg:block"></div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* FAQ / Final CTA */}
                <section className="py-24 bg-[#1a1a1a] text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                            Pronto para ver isso acontecendo na sua loja?
                        </h2>
                        <p className="text-xl text-gray-400 mb-12">
                            Não deixe seu dinheiro parado no estoque por mais um dia.
                        </p>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#f84704]/50"
                        >
                            Agendar Inventário Agora
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
            <FloatingWhatsApp />
        </div>
    );
}
