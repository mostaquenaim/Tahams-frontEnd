import React, { useEffect, useState } from 'react';
import ShowCat from '../ShopByCategory/ShowCat';
import ShowNewArrival from './ShowNewArrival';
import Heading from '../Header/Heading';

const NewArrival = () => {
    
    const [products, setProducts] = useState([])

    useEffect(() => {
        fetch('/new-arrivals.json')
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [])
    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 shadow-md px-10">
                <Heading first='NEW' second='ARRIVALS'></Heading>
                <div className="pt-10 pb-20 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {
                        products.map((product, index) => (
                            <ShowNewArrival key={index} prop={product}></ShowNewArrival>
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export default NewArrival;