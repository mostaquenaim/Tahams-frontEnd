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
import AnimatedCustomizeButton from '../Header/AnimatedCustomizeButton';
import Link from 'next/link';

const MySwiper = ({ images = [] }) => {
  const customizeBtnPosition =
    'top-1/2 left-1/2 -translate-x-[50%] translate-y-[50%] md:top-auto md:translate-x-0 md:translate-y-0 absolute z-10 w-48 md:w-72 h-10';

  return (
    <Swiper
      modules={[Autoplay, EffectFade]}
      spaceBetween={50}
      slidesPerView={1}
      effect="fade"
      autoplay={{
        delay: 2500,
        pauseOnMouseEnter: true,
        disableOnInteraction: false, // Optional, but recommended
      }}
      //   className='relative'
      style={{
        position: 'relative',
      }}
    >
      {/* <AnimatedCustomizeButton></AnimatedCustomizeButton> */}
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full">
            {/* Banner Image */}
            <img
              className="w-full lg:aspect-[5/2] object-cover pt-16 lg:pt-32"
              src={`/${image}`} // assuming images are in /public
              alt={`Banner ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchpriority={index === 0 ? 'high' : 'auto'}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Button overlay content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center md:items-start md:justify-end p-6 md:p-12 text-center md:text-left">
              {/* Headline */}
              <h2 className="hidden lg:block text-xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2 md:mb-4">
                Design Your Identity
              </h2>

              {/* Subheadline */}
              <p className="hidden lg:block text-xs md:text-lg text-gray-200 max-w-lg mb-3 md:mb-6">
                Customize premium tees with your style — bold, unique, and made
                for you.
              </p>

              {/* CTA Button */}
              <Link
                href="/customize-tee"
                className="group relative inline-flex items-center justify-center 
      text-xs md:text-sm font-semibold tracking-wide
      px-4 md:px-6 py-2 md:py-3
      rounded-xl shadow-lg overflow-hidden
      bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-400 hover:to-purple-600 
      text-white transition-all duration-300"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-0 group-hover:w-full h-full bg-white/20 transition-all duration-500 ease-in-out"></span>
                </span>

                {/* Button text + icon */}
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-3 h-3 md:w-5 md:h-5"
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
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

MySwiper.propTypes = {
  images: PropTypes.array.isRequired,
};

export default MySwiper;
