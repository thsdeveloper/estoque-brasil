"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiX, FiMaximize2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiPlay } from "react-icons/hi";

interface Video {
  src: string;
  title: string;
}

const videos: Video[] = Array.from({ length: 28 }, (_, i) => ({
  src: `/videos/video-${String(i + 1).padStart(2, "0")}.mp4`,
  title: `Vídeo ${i + 1}`,
}));

export default function VideoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Responsive: 4 desktop, 3 tablet, 2 mobile
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isModalOpen]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, []);

  // Get visible videos with circular wrapping
  const getVisibleVideos = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % videos.length;
      result.push({ ...videos[index], originalIndex: index });
    }
    return result;
  };

  const visibleVideos = getVisibleVideos();

  const handleVideoClick = (video: Video) => {
    openModal(video);
  };

  const openModal = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const toggleFullscreen = () => {
    if (modalVideoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        modalVideoRef.current.requestFullscreen();
      }
    }
  };

  const setVideoRef = (src: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(src, el);
    } else {
      videoRefs.current.delete(src);
    }
  };

  return (
    <section className="py-20 bg-[#343434] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #f84704 0, #f84704 1px, transparent 0, transparent 50%)`,
            backgroundSize: "10px 10px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bastidores da Precisão
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cada contagem conta uma história. Veja como transformamos números em
            resultados reais para nossos clientes.
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
            aria-label="Vídeo anterior"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>

          {/* Videos Row */}
          <div className="overflow-hidden mx-8">
            <div className="flex gap-4 transition-all duration-500 ease-in-out">
              {visibleVideos.map((video, index) => (
                <div
                  key={`${video.originalIndex}-${index}`}
                  className="flex-shrink-0"
                  style={{ width: `calc((100% - ${(visibleCount - 1) * 16}px) / ${visibleCount})` }}
                >
                  <div
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => handleVideoClick(video)}
                  >
                    <video
                      ref={(el) => setVideoRef(video.src, el)}
                      src={video.src}
                      className="w-full h-full object-cover"
                      playsInline
                      loop
                      muted
                      preload="metadata"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/40">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <HiPlay className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
                      </div>
                    </div>

                    {/* Video Number */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">{video.title}</p>
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
            aria-label="Próximo vídeo"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Counter */}
        <div className="text-center mt-6 text-white/80">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && selectedVideo && (
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

          {/* Modal Video Container */}
          <div
            className="relative w-full h-full max-w-md max-h-[90vh] mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={selectedVideo.src}
              className="max-w-full max-h-full rounded-xl"
              controls
              autoPlay
              playsInline
            />

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
              aria-label="Tela cheia"
            >
              <FiMaximize2 className="w-6 h-6" />
            </button>
          </div>

          {/* Video Title */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg font-medium">
            {selectedVideo.title}
          </div>
        </div>
      )}
    </section>
  );
}
