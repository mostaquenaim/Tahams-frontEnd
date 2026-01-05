import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  EffectFade,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import PropTypes from 'prop-types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-fade';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';

const ProfessionalSwiper = ({ images = [] }) => {
  const slides = useMemo(
    () =>
      images.map((i, idx) =>
        typeof i === 'string'
          ? { src: i, alt: `Banner ${idx + 1}` }
          : { ...i, alt: i.alt || `Banner ${idx + 1}` },
      ),
    [images],
  );

  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const progressBarRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSlideChange = (swiper) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
      setTimeout(() => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '100%';
        }
      }, 50);
    }
  };

  return (
    <div className="relative w-full overflow-hidden group/main">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, EffectFade, Navigation, Pagination, A11y]}
        effect="fade"
        speed={1000}
        keyboard={{ enabled: true }}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className}" style="width: 10px; height: 10px; background: rgba(255,255,255,0.7); margin: 0 4px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></span>`;
          },
        }}
        loop={true}
        className="h-full"
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative pt-16 lg:pt-48 h-full">
              <div className="relative w-full overflow-hidden">
                <picture>
                  <source
                    media="(max-width: 640px)"
                    srcSet={slide.mobileSrc || slide.src}
                  />
                  <img
                    src={
                      slide.src.startsWith('/') ? slide.src : `/${slide.src}`
                    }
                    alt={slide.alt}
                    className="w-full object-cover h-[58vh] sm:h-[64vh] lg:h-[72vh] 2xl:h-[76vh] scale-105 animate-[kenburns_12s_ease-in-out_infinite]"
                  />
                </picture>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

              {/* Main Wrapper */}
              <div
                className={`absolute inset-x-0 bottom-0 flex transition-all duration-700 ease-in-out px-6 sm:px-12 pb-16 lg:pb-20
                ${isMinimized ? 'justify-start' : 'justify-center'}`}
              >
                <div
                  className={`relative w-full transform transition-all duration-700 ease-in-out 
                              text-white rounded-2xl group/box
                              ${
                                isMinimized
                                  ? 'max-w-max bg-transparent border-transparent shadow-none p-0'
                                  : 'max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl px-6 py-8 sm:px-10 sm:py-12'
                              }
                              ${
                                isVisible
                                  ? 'opacity-100 translate-y-0'
                                  : 'opacity-0 translate-y-10'
                              }
                  `}
                >
                  {/* Toggle Button: Hidden by default when minimized, shows on hover of the main container */}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className={`absolute -top-3 -right-3 z-50 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full border border-white/30 transition-all duration-300
                      ${
                        isMinimized
                          ? 'opacity-0 group-main/main:hover:opacity-100 group-hover:scale-110'
                          : 'opacity-100'
                      }
                    `}
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    {isMinimized ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 12H6"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Content to hide when minimized */}
                  <div
                    className={`flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out overflow-hidden ${
                      isMinimized
                        ? 'max-h-0 opacity-0'
                        : 'max-h-[1000px] opacity-100 mb-6 sm:mb-8'
                    }`}
                  >
                    <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                      <span className="text-xs font-semibold tracking-wider uppercase">
                        Premium Collection
                      </span>
                    </div>

                    <h1 className="text-2xl lg:text-6xl font-bold leading-tight mb-4">
                      Design Your{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Thought
                      </span>
                    </h1>

                    <p className="hidden lg:block text-base text-gray-200 max-w-2xl mx-auto leading-relaxed mb-6">
                      Customize premium tees with your unique style — bold,
                      distinctive, and crafted exclusively for you.
                    </p>

                    <div className="hidden md:flex justify-center items-center gap-6 py-2 flex-wrap">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold">
                          1000+
                        </div>
                        <div className="text-xs sm:text-sm text-gray-300">
                          Designs
                        </div>
                      </div>
                      <div className="w-1 h-6 bg-white/30 rounded-full"></div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold">98%</div>
                        <div className="text-xs sm:text-sm text-gray-300">
                          Happy
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div
                    className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-700
                    ${isMinimized ? 'justify-start' : 'justify-center'}`}
                  >
                    <Link
                      href="/customize-tee"
                      className="group/btn relative inline-flex items-center justify-center text-sm font-semibold px-6 py-2 sm:px-8 sm:py-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-700 text-white transition-all hover:-translate-y-0.5"
                    >
                      <span className="relative flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Customize Now
                      </span>
                    </Link>

                    <Link
                      href="#new-arrival"
                      className="group/btn relative inline-flex items-center justify-center text-sm font-semibold px-6 py-2 sm:px-8 sm:py-3 rounded-xl shadow-lg border-2 border-white/30 hover:border-white text-white transition-all hover:-translate-y-0.5"
                    >
                      <span className="relative flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        View Collection
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Swiper Controls */}
        <div className="swiper-button-next !text-white !right-4 opacity-70 hover:opacity-100 after:!text-xl"></div>
        <div className="swiper-button-prev !text-white !left-4 opacity-70 hover:opacity-100 after:!text-xl"></div>
        <div className="swiper-pagination !bottom-4"></div>
      </Swiper>
    </div>
  );
};

ProfessionalSwiper.propTypes = {
  images: PropTypes.array.isRequired,
};

export default ProfessionalSwiper;
