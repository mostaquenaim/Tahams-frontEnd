import { Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectFade, } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import PropTypes from 'prop-types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-fade';

const MySwiper = ({ images }) => {
    return (

        <Swiper
            modules={[
                Autoplay,
                // Navigation, 
                // Pagination, 
                // Scrollbar, 
                // A11y, 
                EffectFade
            ]}
            spaceBetween={50}
            slidesPerView={1}
            effect="fade"
            autoplay={{
                delay: 2500,
                pauseOnMouseEnter: true,
                disableOnInteraction: false, // Optional, but recommended
            }}

        // navigation
        // pagination={{ clickable: true }}
        // scrollbar={{ draggable: true }}
        // onSwiper={(swiper) => console.log(swiper)}
        // onSlideChange={() => console.log('slide change')}
        >
            {
                images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <img
                            className='w-full pt-32'
                            src={image}
                            alt=""
                        />
                    </SwiperSlide>
                ))

            }
        </Swiper>
    );
};

MySwiper.propTypes = {
    images: PropTypes.array.isRequired,
};


export default MySwiper;
