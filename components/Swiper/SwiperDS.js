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
  // Normalize slides whether array is strings or objects
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
  const progressBarRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    // Initialize progress bar animation
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
      setTimeout(() => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '100%';
        }
      }, 50);
    }
  }, []);

  const handleSlideChange = (swiper) => {
    // Reset and animate progress bar on slide change
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
    <div className="relative w-full overflow-hidden group">
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
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          firstSlideMessage: 'This is the first slide',
          lastSlideMessage: 'This is the last slide',
          paginationBulletMessage: 'Go to slide {{index}}',
        }}
        loop={true}
        className="h-full"
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative pt-16 lg:pt-40">
              <div className="relative w-full overflow-hidden">
                <picture>
                  {/* <Link
                    className="hidden xl:block"
                    href={'search-product?search=Executive%20Polo'}
                  >
                    <img
                      src="/bg-removed-pics/cover-marshmallow-rmv-bg-2.png"
                      className="object-cover h-[58vh] sm:h-[64vh] lg:h-[72vh] 2xl:h-[76vh]  
                               absolute scale-125 left-[82px] z-50 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    />
                  </Link>
                  <Link
                    className="hidden lg:block"
                    href={'search-product?search=Marshmallow'}
                  >
                    <img
                      src="/bg-removed-pics/cover-marshmallow-rmv-bg-1.png"
                      className="object-cover h-[58vh] sm:h-[64vh] lg:h-[72vh] 2xl:h-[76vh]  
                               absolute scale-125 right-0 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    />
                  </Link> */}
                  <source
                    media="(max-width: 640px)"
                    srcSet={
                      slide.mobileSrc || slide.src.startsWith('/')
                        ? slide.src
                        : `/${slide.src}`
                    }
                  />
                  <source
                    media="(min-width: 641px) and (max-width: 1024px)"
                    srcSet={
                      slide.tabletSrc || slide.src.startsWith('/')
                        ? slide.src
                        : `/${slide.src}`
                    }
                  />
                  <img
                    src={
                      slide.src.startsWith('/') ? slide.src : `/${slide.src}`
                    }
                    alt={slide.alt}
                    className="w-full object-cover h-[58vh] sm:h-[64vh] lg:h-[72vh] 2xl:h-[76vh]  
                               scale-105 will-change-transform animate-[kenburns_12s_ease-in-out_infinite]"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                </picture>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center top-20 ">
                <div
                  className={`relative max-w-4xl mx-auto space-y-4 sm:space-y-6 
                text-white transform transition-all duration-1000 ease-out 
                rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl
                lg:bg-transparent lg:backdrop-blur-0 lg:border-transparent lg:shadow-none
                xl:bg-white/10 xl:backdrop-blur-md xl:border xl:border-white/20 xl:shadow-xl
                px-6 py-8 sm:px-10 sm:py-12
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2 sm:mb-4">
                    <span className="text-xs font-semibold tracking-wider uppercase">
                      Premium Collection
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl lg:text-6xl font-bold leading-tight">
                    Design Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                      Thought
                    </span>
                  </h1>

                  {/* Subheadline */}
                  <p className="hidden lg:block text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                    Customize premium tees with your unique style — bold,
                    distinctive, and crafted exclusively for you.
                  </p>

                  {/* Stats */}
                  <div className="hidden md:flex justify-center items-center gap-4 sm:gap-6 py-2 sm:py-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">1000+</div>
                      <div className="text-xs sm:text-sm text-gray-300">
                        Designs Created
                      </div>
                    </div>
                    <div className="w-1 h-4 sm:h-6 bg-white/30 rounded-full hidden sm:block"></div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">98%</div>
                      <div className="text-xs sm:text-sm text-gray-300">
                        Customer Satisfaction
                      </div>
                    </div>
                    <div className="w-1 h-4 sm:h-6 bg-white/30 rounded-full hidden sm:block"></div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">24h</div>
                      <div className="text-xs sm:text-sm text-gray-300">
                        Fast Delivery
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
                    <Link
                      href="/customize-tee"
                      scroll={false}
                      className="group relative inline-flex items-center justify-center 
                        text-sm font-semibold tracking-wide
                        px-6 py-2 sm:px-8 sm:py-3
                        rounded-xl shadow-lg overflow-hidden
                        bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 
                        text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      aria-label="Customize your t-shirt now"
                    >
                      <span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      ></span>

                      <span className="relative flex items-center gap-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
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
                      className="group relative inline-flex items-center justify-center 
                        text-sm font-semibold tracking-wide
                        px-6 py-2 sm:px-8 sm:py-3
                        rounded-xl shadow-lg overflow-hidden
                        bg-transparent border-2 border-white/30 hover:border-white
                        text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      aria-label="View our t-shirt collection"
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                      <span className="relative flex items-center gap-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
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

        {/* Custom Navigation Arrows */}
        <div className="swiper-button-next !text-white !right-4 sm:!right-6 opacity-70 hover:opacity-100 transition-opacity duration-300 after:!text-xl sm:after:!text-2xl"></div>
        <div className="swiper-button-prev !text-white !left-4 sm:!left-6 opacity-70 hover:opacity-100 transition-opacity duration-300 after:!text-xl sm:after:!text-2xl"></div>

        {/* Custom Pagination */}
        <div className="swiper-pagination !bottom-4 sm:!bottom-6"></div>
      </Swiper>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-white/30 w-full z-10">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-5000 ease-linear swiper-progress-bar"
          style={{ transition: 'width 5s linear' }}
        ></div>
      </div>
    </div>
  );
};

ProfessionalSwiper.propTypes = {
  images: PropTypes.array.isRequired,
};

export default ProfessionalSwiper;
