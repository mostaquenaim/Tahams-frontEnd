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
      <div className="group">
        {/* <div
          className={`${customizeBtnPosition} md:bottom-8 md:left-12
        rounded-lg animate-pulse
            bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
        transition-all duration-500 ease-in-out`}
        ></div> */}

        <Link
          href={'/customize-tee'}
          className={`${customizeBtnPosition} md:bottom-10 md:left-10 md:animate-bounce md:hover:animate-none
            text-[8px] md:text-sm border-2 btn btn-xs md:btn-md hover:text-white
          bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-400 hover:to-purple-600 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded`}
        >
          {/* Shine effect */}
          <span className="absolute inset-0 overflow-hidden">
            <span
              className="absolute top-0 left-0 w-8 h-full bg-white/30 
                      transform -skew-x-12 transition-all duration-700 ease-in-out
                      group-hover:animate-shine group-hover:w-20"
            ></span>
          </span>
          {/* Button content with icon */}
          <svg
            className="w-2 h-2 md:w-4 md:h-4 mr-2"
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
          Customize Your Own Tee
        </Link>
      </div>

      {/* <div className="group">
        <Link
          href={'/customize-tee'}
          className="relative z-10 inline-flex items-center justify-center 
               px-6 py-3 md:px-8 md:py-4
               text-xs md:text-sm font-semibold text-white 
               bg-gradient-to-r from-gray-900 to-black
               rounded-lg shadow-lg
               transform transition-all duration-300 ease-out
               group-hover:scale-105 group-hover:shadow-xl
               overflow-hidden"
        >
          Customize Your Own Tee
        </Link>

        <div
          className="absolute -inset-0.5 rounded-lg 
               bg-gradient-to-r from-pink-500 via-yellow-500 to-indigo-500 
               opacity-75 group-hover:opacity-100 group-hover:animate-pulse
               transition-all duration-300 ease-in-out
               group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-yellow-500"
        ></div>
      </div> */}

      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            className="w-full lg:aspect-[5/2] object-cover pt-16 lg:pt-32"
            src={`/${image}`} // assuming images are in /public
            alt={`Banner ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchpriority={index === 0 ? 'high' : 'auto'}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

MySwiper.propTypes = {
  images: PropTypes.array.isRequired,
};

export default MySwiper;
