"use client";

import { useState } from "react";
import {
  HiSparkles,
  HiShoppingBag,
  HiClock,
  HiCheckCircle,
  HiCurrencyDollar,
  HiShieldCheck,
  HiHeart,
  HiBadgeCheck,
  HiChatAlt2,
  HiQuestionMarkCircle
} from "react-icons/hi";
import { IconType } from "react-icons";

export interface FAQItem {
  question: string;
  answer: string;
  icon: IconType;
}

export const faqData: FAQItem[] = [
    {
      question: "Vocês vão bagunçar minha farmácia? Tenho medo de virar aquela zona...",
      answer: "Relaxa! A gente entende perfeitamente esse medo (e já ouvimos isso umas 500 vezes). Nossa equipe trabalha de forma super organizada - movimentamos apenas o necessário, recolocamos tudo no lugar, e você nem vai perceber que estivemos lá (a não ser pelo relatório incrível que vai receber!). Ah, e nossa equipe é uniformizada e identificada, então você sabe exatamente quem está cuidando do seu negócio.",
      icon: HiSparkles
    },
    {
      question: "Vou ter que fechar a farmácia durante o inventário?",
      answer: "NÃO! Essa é uma das coisas que a gente mais gosta de falar: sua farmácia continua vendendo normalmente! Nossa equipe é treinada pra trabalhar sem atrapalhar seu atendimento. A gente se adapta à sua rotina, não o contrário. Já fizemos inventários em farmácias lotadas no horário de pico, e tudo fluiu tranquilamente.",
      icon: HiShoppingBag
    },
    {
      question: "Quanto tempo leva? Não tenho tempo pra ficar dias nisso...",
      answer: "A gente é rápido, mas sem ser apressado! Na maioria dos casos, finalizamos tudo em até 24 horas. Farmácias pequenas? Às vezes a gente termina no mesmo dia. Redes maiores? Planejamos tudo certinho pra não atrapalhar nenhuma loja. O melhor: você não precisa ficar babysitting a gente - fazemos tudo de forma autônoma e profissional.",
      icon: HiClock
    },
    {
      question: "E se vocês errarem na contagem? Como fico sabendo que é confiável?",
      answer: "Olha, não vou mentir e dizer que somos perfeitos (ninguém é!), mas nossa margem de erro é praticamente zero. Usamos coletores de dados profissionais, dupla verificação em itens críticos, e um sistema de conferência interno bem rigoroso. Além disso, você recebe um relatório completo onde pode verificar tudo. E se - no improvável caso - houver alguma inconsistência, a gente corrige sem custo adicional. Simples assim!",
      icon: HiCheckCircle
    },
    {
      question: "Isso não vai custar uma fortuna? Não tenho orçamento pra luxos...",
      answer: "Entendo total! Mas deixa eu te falar uma coisa: na maioria das vezes, o inventário SE PAGA. Nossos clientes costumam encontrar divergências que valem muito mais que o investimento no serviço. Tipo aquele cliente que achou R$ 42 mil em produtos 'fantasma' no sistema. O valor é justo e transparente - sem taxas escondidas ou surpresas. E o melhor: você pode parcelar! Quer um orçamento sem compromisso? É só chamar no WhatsApp!",
      icon: HiCurrencyDollar
    },
    {
      question: "Meus dados vão ficar seguros? Tenho medo de vazamento...",
      answer: "Sua preocupação é super válida e a gente leva MUITO a sério! Todos os nossos colaboradores assinam termo de confidencialidade. Os dados são processados em sistemas seguros e depois disso, apagamos tudo que não é essencial pra você. Nunca - NUNCA mesmo - compartilhamos informações dos clientes. Seu estoque, seus dados, suas informações ficam só com você. Palavra de honra!",
      icon: HiShieldCheck
    },
    {
      question: "Vocês atendem farmácia pequena ou só rede grande?",
      answer: "A gente ADORA farmácia pequena! Sério mesmo! Não importa se você tem uma lojinha ou uma rede de 50 unidades - todo mundo merece ter um estoque organizado e preciso. Nosso trabalho é escalável: adaptamos o processo pro tamanho do seu negócio. Pequeno, médio, grande - você é importante pra gente, ponto final!",
      icon: HiHeart
    },
    {
      question: "E se eu não gostar do resultado? Fico no prejuízo?",
      answer: "Olha, em 500+ clientes, isso nunca aconteceu. Mas se você não ficar satisfeito, a gente REFAZ. Sem mimimi, sem desculpa. Nossa reputação depende da sua satisfação, então vamos fazer de tudo pra você ficar feliz com o resultado. E antes de finalizar, você valida tudo com a gente - transparência total!",
      icon: HiBadgeCheck
    },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#f84704]/10 border border-[#f84704]/30 rounded-full px-4 py-2 mb-6">
            <HiChatAlt2 className="w-5 h-5 text-[#f84704]" />
            <span className="text-sm font-bold text-[#f84704] uppercase tracking-wide">
              Dúvidas? A Gente Responde!
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#343434] mb-6">
            Perguntas Que Sempre Nos Fazem
            <br />
            <span className="text-[#f84704]">(Com Respostas Honestas!)</span>
          </h2>

          <p className="text-lg text-gray-600">
            Zero de blá-blá-blá corporativo. Aqui você encontra respostas reais pras suas dúvidas de verdade.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#f84704] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-6 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <faq.icon className="w-7 h-7 text-[#f84704]" />
                </div>

                {/* Question */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-[#343434] pr-8">
                    {faq.question}
                  </h3>
                </div>

                {/* Toggle Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full bg-[#f84704]/10 flex items-center justify-center transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <svg className="w-5 h-5 text-[#f84704]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Answer */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="px-6 pb-6 pl-20">
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#f84704]/5 via-[#ff6b35]/5 to-[#f84704]/5 rounded-2xl p-8 border-2 border-[#f84704]/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-bold text-[#343434]">
              Ainda ficou com dúvida?
            </h3>
            <HiQuestionMarkCircle className="w-7 h-7 text-[#f84704]" />
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            A gente ADORA conversar! Sério mesmo. Manda sua dúvida no WhatsApp e
            <br />
            vamos te responder com todo carinho (e sem aquele papo de vendedor chato).
          </p>
          <a
            href="https://wa.me/556192661043?text=Oi! Tenho algumas dúvidas sobre o inventário..."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Tirar Minhas Dúvidas Agora
          </a>
        </div>
      </div>
    </section>
  );
}
