'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PromoBannerCarousel({ banners }) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        speed={600} // smooth but not slow
        loop={banners.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: '.promo-next',
          prevEl: '.promo-prev',
        }}
        pagination={{
          clickable: true,
          el: '.promo-pagination',
        }}
        slidesPerView={1}
        spaceBetween={0}
        className="w-full bg-white"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="w-full py-2 flex items-center justify-center text-center transition-colors duration-300"
              style={{
                backgroundColor: banner.bgColor ? banner.bgColor : '#ffffff',
              }}
            >
              <div
                className="text-sm md:text-base font-medium flex flex-col lg:flex-row flex-wrap items-center justify-center gap-2 px-10 md:px-16 lg:px-24"
                style={{
                  color: banner.textColor ?? '#ffffff',
                }}
              >
                <span className="">{banner.text}</span>

                <div className='flex gap-2'>
                  {banner.links?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:opacity-80 transition-opacity italic"
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            className="promo-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 text-black opacity-70 hover:opacity-100 transition"
            aria-label="Previous banner"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            className="promo-next absolute right-3 top-1/2 -translate-y-1/2 z-10 text-black opacity-70 hover:opacity-100 transition"
            aria-label="Next banner"
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination Dots */}
          <div className="promo-pagination absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2"></div>
        </>
      )}
    </div>
  );
}
