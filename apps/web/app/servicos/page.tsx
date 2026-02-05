"use client";

import { Header, Footer, FloatingWhatsApp } from "@/features/marketing";
import { HiOfficeBuilding, HiBadgeCheck, HiLightningBolt, HiChartBar, HiUserGroup, HiShieldCheck } from "react-icons/hi";

export default function ServicosPage() {
    const whatsappNumber = "556192661043";
    const whatsappMessage = encodeURIComponent("Quero um orçamento para os serviços de inventário!");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const services = [
        {
            icon: HiLightningBolt,
            title: "Inventário Geral",
            description: "Contagem completa de todos os itens da loja. Ideal para balanços anuais, semestrais ou troca de gestão.",
            features: ["Equipe completa", "Até 24h de duração", "Relatório detalhado"]
        },
        {
            icon: HiBadgeCheck,
            title: "Inventário Rotativo",
            description: "Contagens cíclicas de grupos específicos de produtos (curva A, B, C) para manter a acuracidade sempre alta.",
            features: ["Frequência personalizada", "Foco em itens críticos", "Prevenção contínua"]
        },
        {
            icon: HiChartBar,
            title: "Auditoria de Estoque",
            description: "Verificação pontual para identificar fraudes, erros operacionais ou validar números para venda da farmácia.",
            features: ["Sigilo absoluto", "Foco em divergências", "Análise de processos"]
        }
    ];

    const benefits = [
        {
            icon: (
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
            ),
            title: "VELOCIDADE",
            description: "Inventário completo em até 24h. Rápido sem ser apressado. Resultado que você pode confiar.",
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ),
            title: "PRECISÃO 100%",
            description: "Tecnologia com coletores de dados de ponta. Margem de erro zero.",
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
            ),
            title: "MAIS LUCRO",
            description: "Identifique perdas, produtos parados e oportunidades de aumento de margem.",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Page Hero */}
                <section className="relative py-24 bg-[#1a1a1a] overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: 'url(/services-bg.jpg)' }}
                        ></div>
                        {/* Overlay Gradient for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/95 via-[#1a1a1a]/80 to-[#1a1a1a]/70"></div>
                        {/* Tech Grid Overlay (Subtle) */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `linear-gradient(#f84704 1px, transparent 1px), linear-gradient(90deg, #f84704 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#f84704]/20 text-[#f84704] text-sm font-bold mb-6 border border-[#f84704]/30">
                            NOSSAS SOLUÇÕES
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                            Serviços de Inventário <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f84704] to-[#ff8c00]">
                                Especializado
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Tecnologia, precisão e agilidade para transformar o estoque da sua farmácia em uma fonte de lucro, não de problemas.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8 -mt-32 relative z-20">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-[#f84704]/30 transition-all duration-300 hover:-translate-y-2 group">
                                    <div className="w-16 h-16 bg-[#f84704]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#f84704] transition-colors duration-300">
                                        <service.icon className="w-8 h-8 text-[#f84704] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                                    <ul className="space-y-3">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                                <HiShieldCheck className="w-5 h-5 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Original Benefits Section (Refined) */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que contratar nossos serviços?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Entregamos mais do que números. Entregamos confiança e resultados financeiros.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg text-[#f84704] mb-6">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-[#1a1a1a] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#f84704]/10"></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                            Pronto para organizar seu estoque?
                        </h2>
                        <p className="text-xl text-gray-300 mb-10">
                            Solicite um orçamento sem compromisso e descubra como podemos ajudar sua farmácia a lucrar mais.
                        </p>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-[#f84704] hover:bg-[#d63d03] text-white font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#f84704]/50"
                        >
                            <HiLightningBolt className="w-6 h-6" />
                            Solicitar Orçamento Agora
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
            <FloatingWhatsApp />
        </div>
    );
}
