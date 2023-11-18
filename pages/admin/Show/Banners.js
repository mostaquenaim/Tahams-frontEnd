import BannerSwiper from '../../components/Swiper/MyBannerSwiper';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Banners = () => {
    const [banners, setBanners] = useState([])

    const loadBanners = async () => {
        const resp = await axios.get('/banners.json')
        setBanners(resp.data)
    }
    useEffect(() => {
        loadBanners()
    }, [])
    return (
        <div className='carousel w-full '>
            <BannerSwiper props={banners}></BannerSwiper>
        </div>
    );
};

export default Banners;