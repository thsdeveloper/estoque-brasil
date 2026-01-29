"use client";

import Image from "next/image";
import { HiLocationMarker } from "react-icons/hi";

export default function Footer() {
  const whatsappNumber = "556192661043";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-[#343434] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Brand Column */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo_eb.png"
                alt="Estoque Brasil - Soluções em Gestão de Estoque"
                width={240}
                height={65}
                className="h-auto w-52"
              />
            </div>
            <p className="text-gray-400 leading-relaxed mb-4 mt-2">
              Inventário Especializado • Precisão • Lucro
            </p>
            <p className="text-sm text-gray-500">
              Mais de 500 farmácias confiam no nosso trabalho para recuperar o controle do estoque e aumentar a lucratividade.
            </p>
          </div>

          {/* Regions Column */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Regiões Atendidas
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Distrito Federal (DF)
              </li>
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Goiás (GO)
              </li>
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Tocantins (TO)
              </li>
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Maranhão (MA)
              </li>
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Piauí (PI)
              </li>
              <li className="hover:text-[#f84704] transition-colors flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-[#f84704]" />
                Pará (PA)
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#f84704]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Contato
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">WhatsApp / Telefone:</p>
                <a
                  href={`tel:+${whatsappNumber}`}
                  className="text-xl font-bold text-white hover:text-[#f84704] transition-colors"
                >
                  (61) 9266-1043
                </a>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Estoque Brasil Inventários. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 text-center md:text-right">
            Inventário Especializado para Farmácias e Varejo
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Prestamos serviços de inventário de estoque com tecnologia de ponta e equipe especializada.
            <br />
            Atendimento profissional para farmácias e estabelecimentos de varejo.
          </p>
        </div>
      </div>
    </footer>
  );
}
