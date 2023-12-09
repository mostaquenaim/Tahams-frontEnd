import React from 'react';
import MySwiper from './MySwiper';
import PropTypes from 'prop-types';

const ProductShowCard = ({name, desc, images=[]}) => {
    return (
        <div>
            {/* <div>{name}</div> */}
            <div className="card w-96 bg-base-100 shadow-xl">
                <figure className='mx-auto text-center items-center'>
                    <MySwiper images={images}></MySwiper>
                </figure>
                <div className="card-body">
                    <h2 className="card-title">{name}</h2>
                    <p>{desc}</p>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductShowCard;