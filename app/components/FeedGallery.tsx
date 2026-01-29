"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface FeedImage {
  src: string;
  title: string;
  description: string;
}

const images: FeedImage[] = [
  {
    src: "/images/inventario-total-sem-alterar-fluxo-feed.jpg",
    title: "Inventário Total",
    description: "Realize inventários completos sem interromper suas operações",
  },
  {
    src: "/images/capital-parado-gestao-estoque.jpg",
    title: "Capital Parado",
    description: "Seu dinheiro preso em produtos sem giro de estoque",
  },
  {
    src: "/images/prejuizo-oculto-estoque-iceberg.jpg",
    title: "Prejuízo Oculto",
    description: "O que você não vê no estoque é o que mais custa",
  },
  {
    src: "/images/dados-estoque-estrategia-faturamento-feed.jpg",
    title: "Dados Estratégicos",
    description: "Use informações do estoque para aumentar seu faturamento",
  },
  {
    src: "/images/desafio-aceito-precisao-inventario-feed.jpg",
    title: "Desafio Aceito",
    description: "Precisão e compromisso ao seu inventário",
  },
  {
    src: "/images/encontrar-inconsistencias-estoque-feed.jpg",
    title: "Encontre Inconsistências",
    description: "Descubra divergências antes que virem prejuízo",
  },
  {
    src: "/images/gestor-vip-gestao-estoque-feed.jpg",
    title: "Gestor VIP",
    description: "Pense como um gestor de elite em estoque",
  },
  {
    src: "/images/precisao-no-alvo-controle-estoque-feed.jpg",
    title: "Precisão no Alvo",
    description: "Onde o controle é exato, o prejuízo não entra",
  },
  {
    src: "/images/500-farmacias-atendidas-brasil-feed.jpg",
    title: "+500 Farmácias",
    description: "Equipe especializada com 100% de precisão",
  },
  {
    src: "/images/contagem-rapida-precisa-inventario.jpg",
    title: "Contagem Rápida",
    description: "Agilidade e precisão na contagem de estoque",
  },
  {
    src: "/images/divergencia-identificada-inventario-feed.jpg",
    title: "Divergência Identificada",
    description: "Encontre e solucione falhas imediatamente",
  },
  {
    src: "/images/tecnologia-ao-seu-favor-inventario-feed.jpg",
    title: "Tecnologia a seu Favor",
    description: "Automatize e otimize seu controle de inventário",
  },
  {
    src: "/images/caso-grupo-mateus-erro-estoque-feed.jpg",
    title: "Case Grupo Mateus",
    description: "Erro de R$ 1,1 bilhão em estoques evitável",
  },
  {
    src: "/images/destaque-seu-negocio-controle-certo.jpg",
    title: "Destaque seu Negócio",
    description: "Com o controle certo de estoque",
  },
  {
    src: "/images/perdas-por-validade-medicamentos.jpg",
    title: "Perdas por Validade",
    description: "Prejuízos silenciosos que o inventário elimina",
  },
  {
    src: "/images/lucro-farmacia-estoque-feed.jpg",
    title: "Lucro da Farmácia",
    description: "Vende bem mas lucro não aparece? Pode ser o estoque",
  },
  {
    src: "/images/auditoria-cuidado-negocio-feed.jpg",
    title: "Auditoria",
    description: "Não é desconfiança, é cuidado com seu negócio",
  },
  {
    src: "/images/saude-farmacia-inventario.jpg",
    title: "Saúde da Farmácia",
    description: "O inventário revela a saúde do seu negócio",
  },
  {
    src: "/images/setor-pet-perdas-ecommerce-feed.jpg",
    title: "Setor Pet",
    description: "Lidera ranking de perdas no e-commerce",
  },
  {
    src: "/images/contar-vs-inventariar-diferenca.jpg",
    title: "Contar vs Inventariar",
    description: "Saiba a diferença fundamental",
  },
  {
    src: "/images/perdas-bilhoes-empresas-brasil.jpg",
    title: "R$ 36,5 Bi em Perdas",
    description: "Lucro das empresas brasileiras perdido anualmente",
  },
  {
    src: "/images/eficiencia-operacional-processos.jpg",
    title: "Eficiência Operacional",
    description: "Acelere processos com segurança e precisão",
  },
  {
    src: "/images/tempo-perdido-procurando-medicamentos.jpg",
    title: "Tempo Perdido",
    description: "Quanto tempo seu time perde procurando produtos?",
  },
  {
    src: "/images/motivos-investir-inventario-total.jpg",
    title: "3 Motivos",
    description: "Para investir em um inventário total profissional",
  },
];

export default function FeedGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FeedImage | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Responsive: 5 desktop, 3 tablet, 2 mobile
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 5;
  };

  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, isModalOpen]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
      if (e.key === "ArrowLeft" && isModalOpen) {
        goToPrevModal();
      }
      if (e.key === "ArrowRight" && isModalOpen) {
        goToNextModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, selectedImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, []);

  const openModal = (image: FeedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const goToPrevModal = useCallback(() => {
    if (!selectedImage) return;
    const currentIdx = images.findIndex((img) => img.src === selectedImage.src);
    const prevIdx = (currentIdx - 1 + images.length) % images.length;
    setSelectedImage(images[prevIdx]);
  }, [selectedImage]);

  const goToNextModal = useCallback(() => {
    if (!selectedImage) return;
    const currentIdx = images.findIndex((img) => img.src === selectedImage.src);
    const nextIdx = (currentIdx + 1) % images.length;
    setSelectedImage(images[nextIdx]);
  }, [selectedImage]);

  // Get visible images with circular wrapping
  const getVisibleImages = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % images.length;
      result.push({ ...images[index], originalIndex: index });
    }
    return result;
  };

  const visibleImages = getVisibleImages();

  return (
    <section className="py-20 bg-gradient-to-br from-[#f84704] via-[#ff5a1f] to-[#d63d03] relative overflow-hidden">
      {/* Background Line Effects */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.3) 20px,
              rgba(255,255,255,0.3) 22px
            )`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.2) 40px,
              rgba(255,255,255,0.2) 42px
            )`,
          }}
        />
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Direto do Nosso Instagram
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Dicas, cases reais e insights que ajudam centenas de farmácias a
            transformar estoque em lucro. Siga-nos e fique por dentro!
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrow - Left */}
          <button
            onClick={goToPrev}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
            aria-label="Slide anterior"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>

          {/* Images Grid */}
          <div className="overflow-hidden mx-8">
            <div className="flex gap-4 transition-all duration-500 ease-in-out">
              {visibleImages.map((image, index) => (
                <div
                  key={`${image.originalIndex}-${index}`}
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ width: `calc((100% - ${(visibleCount - 1) * 16}px) / ${visibleCount})` }}
                  onClick={() => openModal(image)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                    <Image
                      src={image.src}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes={`(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw`}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <h3 className="text-sm md:text-base font-bold text-white mb-1 line-clamp-1">
                        {image.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/90 line-clamp-2 hidden sm:block">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrow - Right */}
          <button
            onClick={goToNext}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
            aria-label="Próximo slide"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-6 text-white/80">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 z-10"
            aria-label="Fechar"
          >
            <FiX className="w-8 h-8" />
          </button>

          {/* Modal Navigation - Previous */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevModal();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 z-10"
            aria-label="Imagem anterior"
          >
            <FiChevronLeft className="w-8 h-8" />
          </button>

          {/* Modal Navigation - Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNextModal();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 z-10"
            aria-label="Próxima imagem"
          >
            <FiChevronRight className="w-8 h-8" />
          </button>

          {/* Modal Image */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            {/* Modal Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 md:p-8">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-lg md:text-xl text-white/90">
                {selectedImage.description}
              </p>
            </div>
          </div>

          {/* Modal Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-lg">
            {images.findIndex((img) => img.src === selectedImage.src) + 1} /{" "}
            {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
