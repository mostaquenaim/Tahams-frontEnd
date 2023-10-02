import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ShowBanners = () => {
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
            {banners.map((banner, index) => (
                <div key={banner.id} id={`slide-${index}`}
                    className="carousel-item relative w-full h-full"
                >
                    <img src={banner.filename}
                        className="w-full"
                    />
                    <div
                        className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                        <a href={index != 0 ? `#slide-${index - 1}` : `#slide-${banners.length - 1}`}
                            className="btn btn-circle"
                        >❮</a>
                        <a href={banners.length > index + 1 ? `#slide-${index + 1}` : `#slide-0`}
                            className="btn btn-circle">❯</a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShowBanners;