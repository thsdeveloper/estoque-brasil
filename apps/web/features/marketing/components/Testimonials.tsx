"use client";

import Image from "next/image";
import { HiChatAlt2, HiSparkles, HiStar } from "react-icons/hi";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ana Paula Oliveira",
      role: "Farmacêutica Responsável",
      company: "Farmácia Saúde & Vida - Goiânia/GO",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      rating: 5,
      text: "Antes do inventário, eu perdia noites de sono pensando nas divergências do estoque. A equipe da Estoque Brasil foi incrível! Descobrimos R$ 42 mil em produtos que nem sabíamos que tínhamos. O melhor: não precisei fechar a loja nem um minuto!",
      highlight: "R$ 42 mil recuperados",
      photo: "/testimonials/ana-paula.jpg",
    },
    {
      name: "Roberto Silva",
      role: "Proprietário",
      company: "Rede Farma Bem - 5 lojas no DF",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
      rating: 5,
      text: "Trabalho com farmácia há 20 anos e sempre tive medo de fazer inventário pela bagunça que dá. Esses caras mudaram minha vida! Fizeram tudo em 1 dia, sem atrapalhar as vendas, e ainda me ajudaram a entender onde eu estava perdendo dinheiro. Recomendo de olhos fechados!",
      highlight: "20 anos de experiência",
      photo: "/testimonials/roberto.jpg",
    },
    {
      name: "Mariana Costa",
      role: "Gerente de Operações",
      company: "Drogaria União - Palmas/TO",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      rating: 5,
      text: "Eu estava cética no início, mas a precisão foi impressionante! Identificaram produtos vencidos que estavam escondidos, ajustaram divergências que eu nem imaginava existir. O relatório que recebi me deu insights valiosos para melhorar toda a gestão. Valeu cada centavo!",
      highlight: "100% de precisão",
      photo: "/testimonials/mariana.jpg",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#f84704]/10 border border-[#f84704]/30 rounded-full px-4 py-2 mb-4">
            <HiChatAlt2 className="w-5 h-5 text-[#f84704]" />
            <span className="text-sm font-bold text-[#f84704] uppercase tracking-wide">
              Depoimentos Reais
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#343434] mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Histórias reais de pessoas que transformaram seus estoques e recuperaram dinheiro
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#f84704] group relative overflow-hidden"
            >
              {/* Decorative Quote */}
              <div className="absolute top-4 right-4 text-6xl text-[#f84704]/10 font-serif">"</div>

              {/* Stars Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-1 bg-[#f84704]/10 text-[#f84704] text-sm font-bold px-3 py-1 rounded-full mb-4">
                <HiSparkles className="w-4 h-4" />
                {testimonial.highlight}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10 italic">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#f84704] to-[#ff6b35] p-0.5">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#343434] text-base">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
                  <p className="text-xs text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Message */}
        <div className="text-center bg-gradient-to-r from-[#f84704]/5 via-[#ff6b35]/5 to-[#f84704]/5 rounded-2xl p-8 border-2 border-[#f84704]/20">
          <p className="text-lg text-gray-700 flex items-center justify-center gap-2 flex-wrap">
            <span className="font-bold text-[#f84704]">Mais de 500 histórias</span> como essas acontecendo todos os dias.
            <br />
            <span className="text-base text-gray-600 inline-flex items-center gap-1">
              A próxima pode ser a sua! <HiSparkles className="w-5 h-5 text-[#f84704]" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
