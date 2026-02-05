"use client";

import { HiUsers, HiHeart, HiUserGroup, HiLightningBolt, HiPhone, HiCheckCircle } from "react-icons/hi";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: HiUsers,
      title: "Somos Gente Como Você",
      description: "Não somos uma empresa fria e distante. Somos uma equipe de pessoas reais que entende suas dores porque já estivemos do seu lado. Cada membro da nossa equipe foi treinado não só tecnicamente, mas para se importar de verdade com o seu negócio.",
      color: "#2563eb",
    },
    {
      icon: HiHeart,
      title: "Tratamos Seu Negócio Como Nosso",
      description: "Quando entramos na sua farmácia, não é 'só mais um trabalho'. A gente sabe que cada produto na prateleira representa o seu suor, seu investimento, seus sonhos. Por isso tratamos tudo com o cuidado que merece.",
      color: "#f84704",
    },
    {
      icon: HiUserGroup,
      title: "Você Não É Só Um Número",
      description: "Aqui você não vai virar protocolo #12345. Você vai conhecer o nome da pessoa que vai cuidar do seu inventário. Vai ter o WhatsApp direto, vai receber atenção personalizada. Porque para nós, relacionamento importa mais que transação.",
      color: "#16a34a",
    },
    {
      icon: HiLightningBolt,
      title: "Agilidade Sem Perder o Cuidado",
      description: "A gente trabalha rápido, mas nunca com pressa. É a experiência de quem já fez isso 500+ vezes. Sabemos exatamente o que fazer, como fazer, e fazemos com excelência - sem correria, sem estresse pra você.",
      color: "#7c3aed",
    },
    {
      icon: HiPhone,
      title: "Falamos Sua Língua",
      description: "Nada de 'tecniquês' complicado ou jargões corporativos. Explicamos tudo de forma simples, clara e honesta. Se você não entendeu algo, a gente explica de novo, quantas vezes precisar. Sem pressa, sem julgamento.",
      color: "#0891b2",
    },
    {
      icon: HiCheckCircle,
      title: "Transparência Total",
      description: "Sem letras miúdas, sem pegadinhas, sem surpresas desagradáveis. O que prometemos, cumprimos. O preço que falamos é o preço que você paga. Simples assim. Porque confiança se constrói com honestidade.",
      color: "#dc2626",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Humanizado */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f84704]/10 border border-[#f84704]/30 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">❤️</span>
            <span className="text-sm font-bold text-[#f84704] uppercase tracking-wide">
              O Diferencial Está nas Pessoas
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#343434] mb-6">
            Por Que Nossos Clientes Voltam
            <br />
            <span className="text-[#f84704]">(E Recomendam Pros Amigos)</span>
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            Não é só sobre tecnologia ou números. É sobre como a gente faz você se sentir.
            <br />
            É sobre cuidar do seu negócio com o mesmo carinho que cuidaríamos do nosso.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-[#f84704] transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Icon with colored background */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${reason.color}15` }}
              >
                <reason.icon className="w-8 h-8" style={{ color: reason.color }} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#343434] mb-4 group-hover:text-[#f84704] transition-colors">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>

              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: reason.color }}
              ></div>
            </div>
          ))}
        </div>

        {/* Personal Message Box */}
        <div className="bg-gradient-to-br from-[#343434] to-[#2a2a2a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f84704] rounded-full blur-3xl opacity-10"></div>

          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar placeholder */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f84704] to-[#ff6b35] p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <HiUserGroup className="w-10 h-10 text-[#f84704]" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  "A gente não quer ser a maior. A gente quer ser a melhor pra você."
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Sei que escolher quem vai cuidar do inventário da sua farmácia é uma decisão importante.
                  Você está confiando seu patrimônio, seus dados, seu negócio a alguém.
                  <br /><br />
                  Por isso quero que saiba: cada pessoa da nossa equipe foi escolhida a dedo.
                  Não só pela competência técnica, mas pelo caráter, pela empatia, pelo comprometimento.
                  Porque a gente acredita que negócios são feitos de pessoas para pessoas.
                  <br /><br />
                  Quando você nos escolhe, não está contratando um serviço. Está ganhando parceiros que
                  querem ver você prosperar.
                </p>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-lg">Equipe Estoque Brasil</p>
                    <p className="text-sm text-gray-400">Com carinho, dedicação e profissionalismo ❤️</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA dentro da mensagem */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6 border-t border-white/10">
              <p className="text-gray-300">Quer conversar antes de decidir?</p>
              <a
                href="https://wa.me/556192661043?text=Olá! Quero conhecer melhor a equipe e entender como vocês trabalham."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
